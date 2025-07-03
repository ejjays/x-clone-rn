import { useEffect, useState } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Chat, Channel, MessageList, MessageInput, ChannelHeader } from "stream-chat-expo"
import { useStreamChat } from "../../hooks/useStreamChat"

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)

  const { client, isConnected } = useStreamChat()

  useEffect(() => {
    if (isConnected && client && channelId) {
      initializeChannel()
    }
  }, [isConnected, client, channelId])

  const initializeChannel = async () => {
    try {
      setLoading(true)
      console.log("🔄 Initializing channel:", channelId)

      const channel = client.channel("messaging", channelId)
      await channel.watch()

      setChannel(channel)
      console.log("✅ Channel initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize channel:", error)
      Alert.alert("Error", "Failed to load conversation")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected || loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Chat</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">{loading ? "Loading conversation..." : "Connecting to chat..."}</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!channel) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Chat</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Failed to load conversation</Text>
          <TouchableOpacity onPress={initializeChannel} className="mt-4 bg-blue-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Chat client={client}>
        <Channel channel={channel}>
          {/* Custom Header */}
          <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <ChannelHeader />
          </View>

          {/* Messages */}
          <View className="flex-1">
            <MessageList />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  )
}
