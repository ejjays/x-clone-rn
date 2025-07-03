import React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useChatContext } from "stream-chat-react-native"

interface CustomChannelListProps {
  onSelectChannel: (channel: any) => void
}

export const CustomChannelList: React.FC<CustomChannelListProps> = ({ onSelectChannel }) => {
  const { currentUser } = useCurrentUser()
  const { client } = useChatContext()
  const [channels, setChannels] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!client || !currentUser) return

    const loadChannels = async () => {
      try {
        const filter = { members: { $in: [currentUser._id] } }
        const sort = { last_message_at: -1 }
        const options = { limit: 20 }

        const response = await client.queryChannels(filter, sort, options)
        setChannels(response)
      } catch (error) {
        console.error("Failed to load channels:", error)
      } finally {
        setLoading(false)
      }
    }

    loadChannels()

    // Listen for new channels
    const handleChannelUpdate = () => {
      loadChannels()
    }

    client.on("channel.updated", handleChannelUpdate)
    client.on("message.new", handleChannelUpdate)

    return () => {
      client.off("channel.updated", handleChannelUpdate)
      client.off("message.new", handleChannelUpdate)
    }
  }, [client, currentUser])

  const getOtherUser = (channel: any) => {
    const { user1, user2 } = channel.data

    if (user1?.id === currentUser?._id) {
      return user2
    } else if (user2?.id === currentUser?._id) {
      return user1
    }

    // Fallback: get from members
    const otherMember = Object.values(channel.state.members).find((member: any) => member.user?.id !== currentUser?._id)

    return otherMember?.user
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading conversations...</Text>
      </View>
    )
  }

  if (channels.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Text className="text-2xl">💬</Text>
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-3">No conversations yet</Text>
        <Text className="text-gray-500 text-center text-base leading-6 max-w-xs">
          Start a conversation with someone to see it here.
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1">
      {channels.map((channel) => {
        const otherUser = getOtherUser(channel)
        const lastMessage = channel.state.messages[channel.state.messages.length - 1]
        const unreadCount = channel.countUnread()

        return (
          <TouchableOpacity
            key={channel.id}
            className="flex-row items-center px-4 py-3 border-b border-gray-100"
            onPress={() => onSelectChannel(channel)}
          >
            {/* Profile Picture */}
            <View className="relative">
              {otherUser?.image ? (
                <Image source={{ uri: otherUser.image }} className="w-12 h-12 rounded-full" />
              ) : (
                <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
                  <Text className="text-white font-semibold text-lg">
                    {otherUser?.firstName?.[0] || otherUser?.name?.[0] || "?"}
                  </Text>
                </View>
              )}

              {/* Online indicator - you can implement this based on user status */}
              <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </View>

            {/* Content */}
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-gray-900 text-base">
                  {otherUser?.firstName && otherUser?.lastName
                    ? `${otherUser.firstName} ${otherUser.lastName}`
                    : otherUser?.name || "Unknown User"}
                </Text>
                {lastMessage && <Text className="text-gray-500 text-sm">{formatTime(lastMessage.created_at)}</Text>}
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                  {lastMessage?.user?.id === currentUser?._id && "You: "}
                  {lastMessage?.text || "No messages yet..."}
                </Text>

                {unreadCount > 0 && (
                  <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center ml-2">
                    <Text className="text-white text-xs font-semibold">{unreadCount > 99 ? "99+" : unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
