import { useStreamChat } from "@/hooks/useStreamChat"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { formatDistanceToNow } from "date-fns"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native"

interface Channel {
  id: string
  data: {
    name?: string
    image?: string
  }
  state: {
    members: any
    messages: any
    last_message_at?: string
  }
}

interface CustomChannelListProps {
  onRefresh?: () => void
  refreshing?: boolean
  searchQuery?: string
}

export default function CustomChannelList({ onRefresh, refreshing = false, searchQuery = "" }: CustomChannelListProps) {
  const { channels, loading } = useStreamChat()
  const { currentUser } = useCurrentUser()
  const [processedChannels, setProcessedChannels] = useState<any[]>([])
  const [filteredChannels, setFilteredChannels] = useState<any[]>([])

  useEffect(() => {
    if (!channels || !currentUser) return

    const processed = channels.map((channel: Channel) => {
      // Get other user info
      const membersArray = Array.isArray(channel.state.members)
        ? channel.state.members
        : Object.values(channel.state.members || {})

      const otherMember = membersArray.find((member: any) => member?.user?.id !== currentUser.clerkId)

      // Get last message
      const messagesArray = Array.isArray(channel.state.messages) ? Object.values(channel.state.messages) : []

      const lastMessage = messagesArray[messagesArray.length - 1]

      return {
        id: channel.id,
        name: otherMember?.user?.name || "Unknown User",
        image: otherMember?.user?.image || `https://getstream.io/random_png/?name=${otherMember?.user?.name}`,
        lastMessage: lastMessage?.text || "No messages yet",
        lastMessageTime: channel.state.last_message_at
          ? formatDistanceToNow(new Date(channel.state.last_message_at), {
              addSuffix: true,
            })
          : "",
        isFromCurrentUser: lastMessage?.user?.id === currentUser.clerkId,
        online: otherMember?.user?.online || false,
      }
    })

    setProcessedChannels(processed)
  }, [channels, currentUser])

  // Filter channels based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChannels(processedChannels)
    } else {
      const filtered = processedChannels.filter((channel) => {
        const nameMatch = channel.name.toLowerCase().includes(searchQuery.toLowerCase())
        const messageMatch = channel.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        return nameMatch || messageMatch
      })
      setFilteredChannels(filtered)
    }
  }, [processedChannels, searchQuery])

  const renderChannelItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View className="relative mr-3">
        <Image source={{ uri: item.image }} className="w-12 h-12 rounded-full" />
        {item.online && (
          <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      <View className="flex-1 min-w-0 mr-2">
        <Text className="font-semibold text-gray-900 text-base mb-1" numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text className="text-gray-500 text-sm" numberOfLines={1}>
          {item.isFromCurrentUser ? "You: " : ""}
          {item.lastMessage}
        </Text>
      </View>

      <View className="flex-shrink-0">
        {item.lastMessageTime && <Text className="text-gray-400 text-xs">{item.lastMessageTime}</Text>}
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading conversations...</Text>
      </View>
    )
  }

  // Show "No results" when searching but no matches found
  if (searchQuery.trim() && filteredChannels.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-gray-500 text-lg mb-2">No conversations found</Text>
        <Text className="text-gray-400 text-center px-8">
          Try searching with different keywords or check your spelling
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={filteredChannels}
      renderItem={renderChannelItem}
      keyExtractor={(item) => item.id}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} tintColor="#3B82F6" />
        ) : undefined
      }
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-500 text-lg mb-2">No conversations yet</Text>
          <Text className="text-gray-400 text-center px-8">Start a new conversation by tapping the compose button</Text>
        </View>
      )}
    />
  )
}
