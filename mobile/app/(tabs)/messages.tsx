import { useStreamChat } from "@/hooks/useStreamChat"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Ionicons } from "@expo/vector-icons"
import { useState, useRef } from "react"
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Chat, OverlayProvider } from "stream-chat-react-native"
import NewMessageScreen from "@/components/NewMessageScreen"
import CustomChannelList from "@/components/CustomChannelList"
import ChatScreen from "@/components/ChatScreen"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const MessagesScreen = () => {
  const insets = useSafeAreaInsets()
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const flatListRef = useRef(null)

  const { client, isConnecting, isConnected, createChannel } = useStreamChat()
  const { currentUser } = useCurrentUser()

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId)
  }

  const handleBackToList = () => {
    setSelectedChannelId(null)
  }

  const handleNewMessage = () => {
    router.push("/new-message")
  }

  const closeNewMessage = () => {
    setIsNewMessageOpen(false)
  }

  if (selectedChannelId) {
    return <ChatScreen channelId={selectedChannelId} onBack={handleBackToList} />
  }

  if (isConnecting) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1877F2" />
        <Text className="text-gray-500 mt-2">Connecting to chat...</Text>
      </View>
    )
  }

  if (!isConnected || !client) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="message-circle" size={32} color="#65676B" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-3">Chat Unavailable</Text>
        <Text className="text-gray-500 text-center text-base leading-6">
          Unable to connect to chat. Please check your connection and try again.
        </Text>
      </View>
    )
  }

  return (
    <OverlayProvider>
      <Chat client={client}>
        <SafeAreaView className="flex-1 bg-white">
          {/* HEADER */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-900">Messages</Text>
            <TouchableOpacity onPress={handleNewMessage} className="p-2 bg-blue-500 rounded-full">
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* CUSTOM CHANNEL LIST */}
          <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
            <CustomChannelList onChannelSelect={handleChannelSelect} />
          </View>

          {/* Loading overlay for channel creation */}
          {isCreatingChannel && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
              <View className="bg-white p-6 rounded-lg items-center">
                <ActivityIndicator size="large" color="#1877F2" />
                <Text className="text-gray-700 mt-3">Creating conversation...</Text>
              </View>
            </View>
          )}

          {/* New Message Modal */}
          <Modal visible={isNewMessageOpen} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1" style={{ paddingTop: insets.top }}>
              <NewMessageScreen onClose={closeNewMessage} />
            </View>
          </Modal>
        </SafeAreaView>
      </Chat>
    </OverlayProvider>
  )
}

export default MessagesScreen
