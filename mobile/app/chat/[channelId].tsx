import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, router } from "expo-router"
import { TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useStreamChat } from "@/hooks/useStreamChat"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { client, isConnected } = useStreamChat()
  const { user: currentUser } = useCurrentUser()

  useEffect(() => {
    if (!channelId) {
      setError("Channel ID is missing")
      setIsLoading(false)
      return
    }

    if (!currentUser) {
      setError("User not authenticated")
      setIsLoading(false)
      return
    }

    if (!isConnected || !client) {
      // Still connecting to Stream Chat
      return
    }

    initializeChat()
  }, [channelId, currentUser, isConnected, client])

  const initializeChat = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!client) {
        throw new Error("Stream Chat client not initialized")
      }

      // Get or create the channel
      const channel = client.channel("messaging", channelId)
      await channel.watch()

      console.log("✅ Channel initialized:", channelId)
      setIsLoading(false)
    } catch (error) {
      console.error("❌ Failed to initialize chat:", error)
      setError("Failed to load conversation")
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text className="mt-2 text-gray-500">Loading conversation...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={handleGoBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Chat</Text>
        </View>

        {/* Error State */}
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="mt-2 text-lg font-semibold text-gray-900">Error</Text>
          <Text className="mt-1 text-gray-500 text-center">{error}</Text>
          <TouchableOpacity
            className="mt-4 bg-blue-500 px-6 py-2 rounded-full"
            onPress={() => {
              setError(null)
              initializeChat()
            }}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Chat</Text>
      </View>

      {/* Chat Content */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Chat interface will be implemented here</Text>
        <Text className="text-sm text-gray-400 mt-2">Channel ID: {channelId}</Text>
      </View>
    </SafeAreaView>
  )
}
