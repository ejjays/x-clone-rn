import { useState } from "react"
import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface MessageInputProps {
  onSendMessage: (text: string) => void
  isSending: boolean
}

const MessageInput = ({ onSendMessage, isSending }: MessageInputProps) => {
  const [message, setMessage] = useState("")
  const insets = useSafeAreaInsets()

  const handleSend = () => {
    if (message.trim() && !isSending) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  return (
    <View
      className="flex-row items-center px-4 py-3 border-t border-gray-100 bg-white"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
        <TextInput
          className="flex-1 text-base"
          placeholder="Type a message..."
          placeholderTextColor="#657786"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
      </View>
      <TouchableOpacity
        onPress={handleSend}
        className={`size-10 rounded-full items-center justify-center ${
          message.trim() && !isSending ? "bg-blue-500" : "bg-gray-300"
        }`}
        disabled={!message.trim() || isSending}
      >
        {isSending ? <ActivityIndicator size="small" color="white" /> : <Feather name="send" size={20} color="white" />}
      </TouchableOpacity>
    </View>
  )
}

export default MessageInput
