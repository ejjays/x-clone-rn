import { useEffect, useRef } from "react"
import { View, ScrollView, ActivityIndicator, Text } from "react-native"
import { useMessages } from "@/hooks/useMessages"
import MessageBubble from "./MessageBubble"
import MessageInput from "./MessageInput"

interface ChatScreenProps {
  conversationId: string
}

const ChatScreen = ({ conversationId }: ChatScreenProps) => {
  const { messages, isLoading, isSending, sendMessage } = useMessages(conversationId)
  const scrollViewRef = useRef<ScrollView>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1877F2" />
        <Text className="text-gray-500 mt-2">Loading messages...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-center text-base">No messages yet. Start the conversation!</Text>
          </View>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
      </ScrollView>
      <MessageInput onSendMessage={sendMessage} isSending={isSending} />
    </View>
  )
}

export default ChatScreen
