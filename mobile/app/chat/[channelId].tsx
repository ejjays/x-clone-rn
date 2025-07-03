import { View, Text, SafeAreaView, TouchableOpacity } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useStreamChat } from "@/hooks/useStreamChat"
import { useEffect, useState } from "react"
import type { Channel as StreamChannel } from "stream-chat"

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const { client } = useStreamChat()
  const [channel, setChannel] = useState<StreamChannel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!client || !channelId) return

    const initializeChannel = async () => {
      try {
        console.log("🔄 Initializing channel:", channelId)
        const streamChannel = client.channel("messaging", channelId)
        await streamChannel.watch()
        setChannel(streamChannel)
        console.log("✅ Channel initialized successfully")
      } catch (error) {
        console.error("❌ Failed to initialize channel:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeChannel()
  }, [client, channelId])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading chat...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!channel) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Failed to load chat</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 bg-blue-500 rounded">
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">{channel.data?.name || "Chat"}</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500 text-center">
          Chat interface will be implemented here.{"\n"}Channel ID: {channelId}
        </Text>
      </View>
    </SafeAreaView>
  )
}
