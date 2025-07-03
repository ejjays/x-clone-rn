import { View, Text } from "react-native"
import { useAuth } from "@clerk/clerk-expo"
import type { Message } from "@/lib/supabase" 

interface MessageBubbleProps {
  message: Message
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { userId } = useAuth()
  const isMe = message.user_id === userId

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <View className={`flex-row mb-3 ${isMe ? "justify-end" : "justify-start"}`}>
      <View className={`max-w-xs ${isMe ? "items-end" : "items-start"}`}>
        <View className={`rounded-2xl px-4 py-3 ${isMe ? "bg-blue-500" : "bg-gray-100"}`}>
          <Text className={`text-base ${isMe ? "text-white" : "text-gray-900"}`}>{message.text}</Text>
        </View>
        <Text className="text-xs text-gray-400 mt-1 px-2">{formatTime(message.created_at)}</Text>
      </View>
    </View>
  )
}

export default MessageBubble
