import { router } from "expo-router"
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useStreamChat } from "@/hooks/useStreamChat"
import CustomChannelList from "@/components/CustomChannelList"
import NoMessagesFound from "@/components/NoMessagesFound"
import { useState } from "react"

export default function MessagesScreen() {
  const { isConnecting, isConnected, channels, client, refreshChannels } = useStreamChat()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleNewMessage = () => {
    router.push("/new-message")
  }

  const handleChannelSelect = (channelId: string) => {
    router.push(`/chat/${channelId}`)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshChannels()
    } catch (error) {
      console.error("❌ Error refreshing channels:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const renderContent = () => {
    // Show loading while connecting AND we don't have a client yet
    if (isConnecting && !client) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1877F2" />
          <Text className="text-gray-500 mt-2">Connecting to chat...</Text>
        </View>
      )
    }

    // If we have a client but not connected, or no client at all after connection attempt
    if (!client || (!isConnected && !isConnecting)) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">Connection Issue</Text>
          <Text className="text-gray-500 text-center">
            Unable to connect to chat service. Please check your internet connection.
          </Text>
          <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4" onPress={handleRefresh}>
            <Text className="text-white font-semibold">Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // If connected but no channels, show empty state with animated Lottie
    if (isConnected && channels.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#1877F2"
              colors={["#1877F2"]}
            />
          }
        >
          <NoMessagesFound />
        </ScrollView>
      )
    }

    // Show the channel list when we have channels
    return (
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#1877F2"
            colors={["#1877F2"]}
          />
        }
      >
        <CustomChannelList onChannelSelect={handleChannelSelect} />
      </ScrollView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header - No border line, matching Notifications style */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text className="text-3xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity
          onPress={handleNewMessage}
          className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
          disabled={!client} // Only disable if we don't have a client at all
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      {renderContent()}
    </SafeAreaView>
  )
}
