import { useEffect, useState } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useStreamChat } from "@/hooks/useStreamChat"
import type { Channel } from "stream-chat"

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const { client } = useStreamChat()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!client || !channelId) return

    const initChannel = async () => {
      try {
        console.log("🔄 Initializing channel:", channelId)
        const ch = client.channel("messaging", channelId)
        await ch.watch()
        setChannel(ch)
        console.log("✅ Channel initialized successfully")
      } catch (error) {
        console.error("❌ Failed to load channel:", error)
        setError("Failed to load chat")
      } finally {
        setLoading(false)
      }
    }

    initChannel()
  }, [client, channelId])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500">Loading chat...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !channel) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Chat</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Failed to load chat</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-blue-500">Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Get other user's name for header
  const otherUser = Object.values(channel.state.members).find((member) => member.user?.id !== client.userID)
  const otherUserName = otherUser?.user?.name || "Chat"

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-3">
          <Text className="text-white font-semibold text-sm">{otherUserName[0]?.toUpperCase() || "?"}</Text>
        </View>
        <Text className="text-lg font-semibold">{otherUserName}</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500 mb-4">Chat interface coming soon!</Text>
        <Text className="text-gray-400 text-sm text-center px-8">
          This is where the Stream Chat UI components will be integrated. For now, the channel is created and ready.
        </Text>
        <Text className="text-gray-300 text-xs mt-2">Channel: {channelId}</Text>
      </View>
    </SafeAreaView>
  )
}
