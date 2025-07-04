import { router } from "expo-router"
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useStreamChat } from "@/hooks/useStreamChat"
import CustomChannelList from "@/components/CustomChannelList"

export default function MessagesScreen() {
  // ✨ Use the new, more reliable connection flags
  const { isConnecting, isConnected, channels } = useStreamChat()

  const handleNewMessage = () => {
    router.push("/new-message")
  }

  const handleChannelSelect = (channelId: string) => {
    router.push(`/chat/${channelId}`)
  }

  const renderContent = () => {
    // If we are in the process of connecting, show a spinner
    if (isConnecting) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1877F2" />
          <Text className="text-gray-500 mt-2">Connecting to chat...</Text>
          <Text className="text-gray-400 mt-1 text-sm">This may take a moment</Text>
        </View>
      )
    }

    // If connection failed, show error state
    if (!isConnected && !isConnecting) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">Connection Failed</Text>
          <Text className="text-gray-500 text-center mb-6">
            Unable to connect to chat service. Please check your internet connection and try again.
          </Text>
        </View>
      )
    }

    // If we are connected and have no channels, show the empty state
    if (isConnected && channels.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">No conversations yet</Text>
          <Text className="text-gray-500 text-center mb-6">
            Start a new conversation by tapping the compose button above.
          </Text>
        </View>
      )
    }

    // If we are connected and have channels, show the list
    if (isConnected && channels.length > 0) {
      return <CustomChannelList onChannelSelect={handleChannelSelect} />
    }

    // Fallback for any other state
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1877F2" />
        <Text className="text-gray-500 mt-2">Loading...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Messages</Text>
        <TouchableOpacity
          onPress={handleNewMessage}
          className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      {renderContent()}
    </SafeAreaView>
  )
}
