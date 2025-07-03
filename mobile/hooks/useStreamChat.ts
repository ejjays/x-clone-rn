import { useEffect, useState } from "react"
import { StreamChat } from "stream-chat"
import { useAuth } from "@clerk/clerk-expo"
import { useCurrentUser } from "./useCurrentUser"
import { API_BASE_URL } from "@/utils/constants"

const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY!)

export const useStreamChat = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const { getToken, userId } = useAuth()
  const { currentUser } = useCurrentUser()

  useEffect(() => {
    if (!userId || !currentUser) return

    const connectUser = async () => {
      try {
        setIsConnecting(true)
        console.log("🔄 Initializing Stream Chat for user:", userId)

        // Get Stream token from backend
        const token = await getToken()
        const response = await fetch(`${API_BASE_URL}/stream/token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to get Stream token")
        }

        const { token: streamToken, user } = await response.json()
        console.log("✅ Stream token received for user:", userId)

        // Connect user to Stream Chat
        await client.connectUser(
          {
            id: userId,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            image: currentUser.profilePicture || `https://getstream.io/random_png/?name=${userId}`,
          },
          streamToken,
        )

        setIsConnected(true)
        console.log("✅ Stream Chat connected successfully!")
      } catch (error) {
        console.error("❌ Stream Chat connection failed:", error)
        setIsConnected(false)
      } finally {
        setIsConnecting(false)
      }
    }

    connectUser()

    return () => {
      if (client.user) {
        client.disconnectUser()
        setIsConnected(false)
      }
    }
  }, [userId, currentUser, getToken])

  const createChannel = async (members: string[], channelData?: any) => {
    try {
      if (!isConnected) throw new Error("Stream Chat not connected")

      const token = await getToken()
      const response = await fetch(`${API_BASE_URL}/stream/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          members,
          ...channelData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create channel")
      }

      const { channelId } = await response.json()
      return channelId
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
      throw error
    }
  }

  return {
    client: isConnected ? client : null,
    isConnecting,
    isConnected,
    createChannel,
  }
}
