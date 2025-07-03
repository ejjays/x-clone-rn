import { useEffect, useState } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Channel, MessageList, MessageInput } from "stream-chat-react-native"
import { useStreamChat } from "../../hooks/useStreamChat"

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const [channel, setChannel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { client, isConnected } = useStreamChat()

  useEffect(() => {
    if (!channelId) {
      setError("No channel ID provided")
      setLoading(false)
      return
    }

    if (!isConnected || !client) {
      console.log("⏳ Waiting for Stream Chat connection...")
      return
    }

    initializeChannel()
  }, [channelId, isConnected, client])

  const initializeChannel = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Initializing channel:", channelId)

      if (!client) {
        throw new Error("Stream Chat client not available")
      }

      // Parse channel ID to get type and ID
      const [type, id] = channelId.includes("_") ? channelId.split("_", 2) : ["messaging", channelId]

      console.log("📡 Getting channel:", { type, id })

      const channelInstance = client.channel(type, id)
      await channelInstance.watch()

      console.log("✅ Channel initialized successfully")
      setChannel(channelInstance)
    } catch (error: any) {
      console.error("❌ Failed to initialize channel:", error)
      setError(error.message || "Failed to load chat")

      // Show alert and go back
      Alert.alert("Error", "Failed to load chat. Please try again.", [{ text: "OK", onPress: () => router.back() }])
    } finally {
      setLoading(false)
    }
  }

  const getChannelName = () => {
    if (!channel) return "Chat"

    // Get other members (exclude current user)
    const members = Object.values(channel.state.members || {}) as any[]
    const otherMembers = members.filter((member: any) => member.user_id !== client?.userID)

    if (otherMembers.length > 0) {
      const otherUser = otherMembers[0].user
      return otherUser?.name || `@${otherUser?.id}` || "Chat"
    }

    return channel.data?.name || "Chat"
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">Loading chat...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !channel) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
          <Text className="mt-4 text-gray-500 text-lg">Unable to load chat</Text>
          <Text className="text-gray-400 text-center mt-2">{error}</Text>
          <TouchableOpacity className="mt-4 bg-blue-500 px-6 py-3 rounded-full" onPress={() => router.back()}>
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{getChannelName()}</Text>
          <Text className="text-sm text-gray-500">{channel.state.watcher_count > 1 ? "Online" : "Offline"}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Chat */}
      <Channel channel={channel}>
        <View className="flex-1">
          <MessageList />
          <MessageInput />
        </View>
      </Channel>
    </SafeAreaView>
  )
}
