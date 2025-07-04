import { View, Text, TouchableOpacity, Image, FlatList } from "react-native"
import { useStreamChat } from "../hooks/useStreamChat"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { formatDistanceToNow } from "date-fns"

interface ChannelListProps {
  onChannelSelect: (channelId: string) => void
}

export default function CustomChannelList({ onChannelSelect }: ChannelListProps) {
  const { channels, loading } = useStreamChat()
  const { currentUser } = useCurrentUser()

  const getOtherUserInfo = (channel: any) => {
    if (!currentUser) return null

    // Get the other user from channel members
    const otherMember = channel.state.members.find((member: any) => member.user.id !== currentUser.id)

    if (otherMember) {
      return {
        name: otherMember.user.name || "Unknown User",
        image: otherMember.user.image || `https://getstream.io/random_png/?name=${otherMember.user.name}`,
        online: otherMember.user.online,
      }
    }

    return null
  }

  const getLastMessage = (channel: any) => {
    const messages = channel.state.messages
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      return {
        text: lastMessage.text || "No message",
        timestamp: lastMessage.created_at,
        isFromCurrentUser: lastMessage.user?.id === currentUser?.id,
      }
    }
    return null
  }

  const renderChannelItem = ({ item: channel }: { item: any }) => {
    const otherUser = getOtherUserInfo(channel)
    const lastMessage = getLastMessage(channel)
    const unreadCount = channel.state.unreadCount || 0

    if (!otherUser) return null

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

          {lastMessage && (
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
          )}
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading conversations...</Text>
      </View>
    )
  }

  if (!channels || channels.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-gray-500 text-center text-lg">No conversations yet</Text>
        <Text className="text-gray-400 text-center mt-2">Start a conversation by messaging someone!</Text>
      </View>
    )
  }

  return <FlatList data={channels} renderItem={renderChannelItem} keyExtractor={(item) => item.id} className="flex-1" />
}
