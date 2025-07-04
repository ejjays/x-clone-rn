import { View, Text, TouchableOpacity, Image, FlatList, RefreshControl } from "react-native"
import { useStreamChat } from "../hooks/useStreamChat"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

interface ChannelListProps {
  onChannelSelect: (channelId: string) => void
  onRefresh?: () => Promise<void>
}

export default function CustomChannelList({ onChannelSelect, onRefresh }: ChannelListProps) {
  const { channels } = useStreamChat()
  const { currentUser } = useCurrentUser()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } catch (error) {
      console.error("❌ Error refreshing channels:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getOtherUserInfo = (channel: any) => {
    if (!currentUser || !channel.state?.members) return null

    try {
      // Convert members object to array if it's an object
      const membersArray = Array.isArray(channel.state.members)
        ? channel.state.members
        : Object.values(channel.state.members || {})

      // Get the other user from channel members
      const otherMember = membersArray.find((member: any) => {
        return member?.user?.id !== currentUser.clerkId
      })

      if (otherMember?.user) {
        return {
          name: otherMember.user.name || "Unknown User",
          image: otherMember.user.image || `https://getstream.io/random_png/?name=${otherMember.user.name}`,
          online: otherMember.user.online || false,
        }
      }

      return null
    } catch (error) {
      console.error("Error getting other user info:", error)
      return null
    }
  }

  const getLastMessage = (channel: any) => {
    try {
      const messages = channel.state?.messages
      if (messages && Array.isArray(messages) && messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        return {
          text: lastMessage.text || "No message",
          timestamp: lastMessage.created_at,
          isFromCurrentUser: lastMessage.user?.id === currentUser?.clerkId,
        }
      }
      return null
    } catch (error) {
      console.error("Error getting last message:", error)
      return null
    }
  }

  const renderChannelItem = ({ item: channel }: { item: any }) => {
    const otherUser = getOtherUserInfo(channel)
    const lastMessage = getLastMessage(channel)
    const unreadCount = channel.state?.unreadCount || 0

    // If we can't get other user info, don't render this item
    if (!otherUser) {
      return null
    }

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => onChannelSelect(channel.id)}
      >
        <View className="relative">
          <Image source={{ uri: otherUser.image }} className="w-12 h-12 rounded-full" />
          {otherUser.online && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900 text-base">{otherUser.name}</Text>
            {lastMessage && (
              <Text className="text-gray-500 text-sm">
                {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
              </Text>
            )}
          </View>

          {lastMessage ? (
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                {lastMessage.isFromCurrentUser ? "You: " : ""}
                {lastMessage.text}
              </Text>
              {unreadCount > 0 && (
                <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center ml-2">
                  <Text className="text-white text-xs font-bold">{unreadCount > 99 ? "99+" : unreadCount}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text className="text-gray-500 text-sm mt-1">No messages yet</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  // Filter out any null channels or channels without proper data
  const validChannels = channels.filter((channel) => {
    return channel && channel.id && channel.state
  })

  return (
    <FlatList
      data={validChannels}
      renderItem={renderChannelItem}
      keyExtractor={(item) => item.id}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#1877F2"
            colors={["#1877F2"]}
          />
        ) : undefined
      }
    />
  )
}
