import { useEffect, useState, useRef } from "react"
import { useAuth } from "@clerk/clerk-expo"
import { type Channel, StreamChat } from "stream-chat"
import { useApiClient, streamApi } from "@/utils/api"
import { useCurrentUser } from "./useCurrentUser"

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || "YOUR_STREAM_API_KEY"

// Global singleton instance
let globalClient: StreamChat | null = null
let isConnecting = false

export const useStreamChat = () => {
  const [client, setClient] = useState<StreamChat | null>(globalClient)
  const [channels, setChannels] = useState<Channel[]>([])
  const [isConnectingState, setIsConnectingState] = useState(false)
  const { isSignedIn, userId } = useAuth()
  const { currentUser } = useCurrentUser()
  const api = useApiClient()
  const connectionAttempted = useRef(false)

  useEffect(() => {
    if (!isSignedIn || !userId || !currentUser) {
      setClient(null)
      setChannels([])
      setIsConnectingState(false)
      return
    }

    // Prevent multiple connection attempts
    if (connectionAttempted.current) {
      return
    }

    // If we already have a connected client for this user, use it
    if (globalClient && globalClient.userID === userId && globalClient.wsConnection?.isConnected) {
      console.log("✅ Using existing Stream Chat connection")
      setClient(globalClient)
      setIsConnectingState(false)
      fetchChannels(globalClient)
      return
    }

    // If we're already connecting, don't start another connection
    if (isConnecting) {
      console.log("⏳ Connection already in progress...")
      return
    }

    connectionAttempted.current = true
    connectUser()

    async function connectUser() {
      if (isConnecting) return

      isConnecting = true
      setIsConnectingState(true)

      try {
        // Disconnect any existing connection first
        if (globalClient && globalClient.userID && globalClient.userID !== userId) {
          console.log("🔄 Disconnecting previous user...")
          await globalClient.disconnectUser()
          globalClient = null
        }

        // Create or get existing client
        if (!globalClient) {
          globalClient = StreamChat.getInstance(API_KEY)
        }

        // Only connect if not already connected to this user
        if (globalClient.userID !== userId) {
          console.log("🔄 Connecting to Stream Chat...")

          const response = await streamApi.getToken(api)
          const { token, user } = response.data

          await globalClient.connectUser(user, token)
          console.log("✅ Stream Chat connected successfully!")
        }

        setClient(globalClient)
        await fetchChannels(globalClient)
      } catch (error) {
        console.error("❌ Failed to connect to Stream Chat:", error)
        globalClient = null
        setClient(null)
        setChannels([])
      } finally {
        isConnecting = false
        setIsConnectingState(false)
      }
    }

    async function fetchChannels(chatClient: StreamChat) {
      try {
        console.log("🔄 Fetching channels...")

        const userChannels = await chatClient.queryChannels(
          { type: "messaging", members: { $in: [userId] } },
          [{ last_message_at: -1 }],
          { watch: true, state: true },
        )

        setChannels(userChannels)
        console.log(`✅ Found ${userChannels.length} channels.`)
      } catch (error) {
        console.error("❌ Failed to fetch channels:", error)
        setChannels([])
      }
    }

    // Cleanup function
    return () => {
      connectionAttempted.current = false
    }
  }, [isSignedIn, userId, currentUser]) // Only depend on essential auth changes

  const createChannel = async (otherUserId: string, otherUserName: string) => {
    if (!client || !currentUser || !userId) {
      console.error("❌ Cannot create channel: client or user is not ready.")
      return null
    }

    try {
      console.log("🔄 Creating channel...")

      const response = await streamApi.createChannel(api, {
        members: [userId, otherUserId],
        name: `${currentUser.firstName} & ${otherUserName}`,
      })

      const channelData = response.data
      const channel = client.channel("messaging", channelData.channelId)
      await channel.watch()

      console.log("✅ Channel created successfully:", channelData.channelId)
      return channel
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
      return null
    }
  }

  return {
    client,
    channels,
    isConnecting: isConnectingState,
    isConnected: !!client && !isConnectingState && client.wsConnection?.isConnected,
    createChannel,
  }
}

// Cleanup function to disconnect when app closes
export const disconnectStreamChat = async () => {
  if (globalClient && globalClient.userID) {
    try {
      await globalClient.disconnectUser()
      globalClient = null
      isConnecting = false
      console.log("✅ Stream Chat disconnected")
    } catch (error) {
      console.error("❌ Error disconnecting Stream Chat:", error)
    }
  }
}
