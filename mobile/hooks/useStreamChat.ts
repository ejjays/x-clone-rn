import { useEffect, useState } from "react"
import { StreamChat } from "stream-chat"
import { useAuth } from "@clerk/clerk-expo"
import { useCurrentUser } from "./useCurrentUser"
import { useApiClient } from "@/utils/api"

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || "YOUR_STREAM_API_KEY"

export const useStreamChat = () => {
  const [client, setClient] = useState<StreamChat | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const { isSignedIn } = useAuth()
  const { currentUser } = useCurrentUser()
  const api = useApiClient()

  useEffect(() => {
    if (!isSignedIn || !currentUser || client) return

    const initializeStreamChat = async () => {
      setIsConnecting(true)

      try {
        // Get Stream token from backend
        const response = await api.get("/stream/token")
        const { token, user } = response.data

        // Initialize Stream Chat client
        const chatClient = StreamChat.getInstance(API_KEY)

        // Connect user
        await chatClient.connectUser(
          {
            id: user.id,
            name: user.name,
            image: user.image,
            username: user.username,
          },
          token,
        )

        setClient(chatClient)
        setIsConnected(true)
        console.log("✅ Stream Chat connected successfully!")
      } catch (error) {
        console.error("❌ Stream Chat connection failed:", error)
      } finally {
        setIsConnecting(false)
      }
    }

    initializeStreamChat()

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnectUser()
        setClient(null)
        setIsConnected(false)
      }
    }
  }, [isSignedIn, currentUser])

  const createChannel = async (otherUserId: string, otherUserName: string) => {
    if (!client || !currentUser) return null

    try {
      const channel = client.channel("messaging", {
        members: [currentUser._id, otherUserId],
        name: `${currentUser.firstName} & ${otherUserName}`,
      })

      await channel.watch()
      return channel
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
      return null
    }
  }

  return {
    client,
    isConnecting,
    isConnected,
    createChannel,
  }
}
