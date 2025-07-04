import { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from "react-native"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useStreamChat } from "@/hooks/useStreamChat"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useAuth } from "@clerk/clerk-expo"

// ... (interface ChannelData remains the same)

export default function MessagesScreen() {
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [loading, setLoading] = useState(true)
  const { client, isConnected, isConnecting } = useStreamChat()
  const { currentUser } = useCurrentUser()
  const { userId } = useAuth()

  // ... (useEffect for loading channels remains the same)

  const getOtherUser = (members: any[]) => {
    return members.find((member) => member.user.id !== userId)?.user
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const handleNewMessage = () => {
    router.push("/new-message")
  }

  const renderChannelItem = ({ item }: { item: any }) => {
    const otherUser = getOtherUser(item.members)
    if (!otherUser) return null

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => {
          router.push({
            pathname: "/chat/[channelId]",
            params: {
              channelId: item.id,
              otherUserName: otherUser.name,
              otherUserImage: otherUser.image || "",
            },
          })
        }}
      >
        <View className="relative">
          <Image
            source={{ uri: otherUser.image || `https://getstream.io/random_png/?name=${otherUser.name}` }}
            className="w-12 h-12 rounded-full"
            contentFit="cover"
          />
          <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900 text-base">{otherUser.name}</Text>
            {item.lastMessage && (
              <Text className="text-gray-500 text-sm">{formatTime(item.lastMessage.created_at)}</Text>
            )}
          </View>

          <View className="flex-row items-center justify-between mt-1">
            {/************************************/}
            {/* ✨ THIS IS THE CORRECTED LINE ✨ */}
            {/************************************/}
            <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
              {item.lastMessage
                ? item.lastMessage.user.id === userId
                  ? `You: ${item.lastMessage.text}`
                  : item.lastMessage.text
                : "No messages yet..."}
            </Text>

            {item.unreadCount && item.unreadCount > 0 && (
              <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center ml-2">
                <Text className="text-white text-xs font-medium">
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // ... (rest of the component remains the same)
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

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1877F2" />
          <Text className="text-gray-500 mt-2">Loading conversations...</Text>
        </View>
      ) : channels.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          {isConnecting ? (
            <View className="items-center">
              <Text className="text-gray-500 mb-2">Connecting to chat...</Text>
              <Text className="text-gray-400 text-sm text-center">Setting up your messaging experience</Text>
            </View>
          ) : isConnected ? (
            <View className="items-center">
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
              <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">No conversations yet</Text>
              <Text className="text-gray-500 text-center mb-6">
                Start a conversation by tapping the compose button above
              </Text>
              <TouchableOpacity onPress={handleNewMessage} className="bg-blue-500 px-6 py-3 rounded-full">
                <Text className="text-white font-semibold">Start a conversation</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              <Ionicons name="warning-outline" size={64} color="#EF4444" />
              <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">Connection failed</Text>
              <Text className="text-gray-500 text-center">Unable to connect to chat service. Please try again.</Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={channels}
          renderItem={renderChannelItem}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}