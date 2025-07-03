import { useStreamChat } from "@/hooks/useStreamChat"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Feather } from "@expo/vector-icons"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
  Alert,
  Image,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Chat, OverlayProvider } from "stream-chat-react-native"
import NewMessageScreen from "@/components/NewMessageScreen"
import { CustomChannelList } from "@/components/CustomChannelList"
import type { User } from "@/types"

const MessagesScreen = () => {
  const insets = useSafeAreaInsets()
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [isChannelOpen, setIsChannelOpen] = useState(false)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const flatListRef = useRef(null)

  const { client, isConnecting, isConnected, createChannel } = useStreamChat()
  const { currentUser } = useCurrentUser()

  // Listen for new messages when channel is selected
  useEffect(() => {
    if (!selectedChannel) return

    const handleNewMessage = (event) => {
      console.log("📨 New message received:", event.message.text)
      setMessages((prev) => [...prev, event.message])
    }

    const handleMessageUpdate = (event) => {
      console.log("📝 Message updated:", event.message.text)
      setMessages((prev) => prev.map((msg) => (msg.id === event.message.id ? event.message : msg)))
    }

    // Subscribe to channel events
    selectedChannel.on("message.new", handleNewMessage)
    selectedChannel.on("message.updated", handleMessageUpdate)

    // Load existing messages
    const loadMessages = async () => {
      try {
        const result = await selectedChannel.query({
          messages: { limit: 50 },
        })
        console.log("📚 Loaded messages:", result.messages.length)
        setMessages(result.messages.reverse())
      } catch (error) {
        console.error("❌ Failed to load messages:", error)
      }
    }

    loadMessages()

    // Cleanup
    return () => {
      selectedChannel.off("message.new", handleNewMessage)
      selectedChannel.off("message.updated", handleMessageUpdate)
    }
  }, [selectedChannel])

  const openNewMessage = () => {
    setIsNewMessageOpen(true)
  }

  const closeNewMessage = () => {
    setIsNewMessageOpen(false)
  }

  const startNewConversation = async (user: User) => {
    if (!client || !currentUser) {
      console.error("❌ Client or current user not available")
      return
    }

    setIsNewMessageOpen(false)
    setIsCreatingChannel(true)

    try {
      console.log("🔄 Starting conversation with:", user.firstName, user._id)

      const channel = await createChannel(user._id, user.firstName)

      if (channel) {
        setSelectedChannel(channel)
        setIsChannelOpen(true)
        setMessages([]) // Clear previous messages
        console.log("✅ Channel created successfully!")
      } else {
        console.error("❌ Failed to create channel - no channel returned")
        Alert.alert("Error", "Failed to create conversation")
      }
    } catch (error) {
      console.error("❌ Failed to start conversation:", error)
      Alert.alert("Error", "Failed to start conversation")
    } finally {
      setIsCreatingChannel(false)
    }
  }

  const closeChannel = () => {
    setIsChannelOpen(false)
    setSelectedChannel(null)
    setMessages([])
    setMessageText("")
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChannel || isSending) return

    setIsSending(true)
    const tempMessage = messageText
    setMessageText("")

    try {
      console.log("📤 Sending message:", tempMessage)
      await selectedChannel.sendMessage({
        text: tempMessage,
      })
      console.log("✅ Message sent successfully!")
    } catch (error) {
      console.error("❌ Failed to send message:", error)
      setMessageText(tempMessage) // Restore message text on error
      Alert.alert("Error", "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const getOtherUser = (channel) => {
    const { user1, user2 } = channel.data

    if (user1?.id === currentUser?._id) {
      return user2
    } else if (user2?.id === currentUser?._id) {
      return user1
    }

    // Fallback: get from members
    const otherMember = Object.values(channel.state.members).find((member) => member.user?.id !== currentUser?._id)

    return otherMember?.user
  }

  const renderMessage = ({ item: message }) => {
    const isMyMessage = message.user?.id === currentUser?._id

    return (
      <View className={`mb-4 px-4 ${isMyMessage ? "items-end" : "items-start"}`}>
        <View
          className={`max-w-[80%] p-3 rounded-2xl ${
            isMyMessage ? "bg-blue-500 rounded-br-md" : "bg-gray-100 rounded-bl-md"
          }`}
        >
          <Text className={`text-base ${isMyMessage ? "text-white" : "text-gray-900"}`}>{message.text}</Text>
          <Text className={`text-xs mt-1 ${isMyMessage ? "text-blue-100" : "text-gray-500"}`}>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    )
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
          <Feather name="message-circle" size={32} color="#65676B" />
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
        <View className="flex-1 bg-white">
          {/* HEADER */}
          <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
            <Text className="text-3xl font-bold text-gray-900">Messages</Text>
            <TouchableOpacity onPress={openNewMessage}>
              <Feather name="edit" size={24} color="#1DA1F2" />
            </TouchableOpacity>
          </View>

          {/* CUSTOM CHANNEL LIST */}
          <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
            <CustomChannelList
              onSelectChannel={(channel) => {
                console.log("📱 Channel selected:", channel.id)
                setSelectedChannel(channel)
                setIsChannelOpen(true)
                setMessages([]) // Clear previous messages
              }}
            />
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
              <NewMessageScreen onSelectUser={startNewConversation} onClose={closeNewMessage} />
            </View>
          </Modal>

          {/* Chat Modal */}
          <Modal visible={isChannelOpen} animationType="slide" presentationStyle="pageSheet">
            {selectedChannel && (
              <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
              >
                {/* Chat Header */}
                <View
                  className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white"
                  style={{ paddingTop: insets.top + 12 }}
                >
                  <TouchableOpacity onPress={closeChannel} className="mr-3">
                    <Feather name="arrow-left" size={24} color="#1DA1F2" />
                  </TouchableOpacity>

                  {/* Other user's profile picture */}
                  <View className="mr-3">
                    {(() => {
                      const otherUser = getOtherUser(selectedChannel)
                      return otherUser?.image ? (
                        <Image source={{ uri: otherUser.image }} className="w-8 h-8 rounded-full" />
                      ) : (
                        <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                          <Text className="text-white font-semibold text-sm">
                            {otherUser?.firstName?.[0] || otherUser?.name?.[0] || "?"}
                          </Text>
                        </View>
                      )
                    })()}
                  </View>

                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-lg">
                      {(() => {
                        const otherUser = getOtherUser(selectedChannel)
                        return otherUser?.firstName && otherUser?.lastName
                          ? `${otherUser.firstName} ${otherUser.lastName}`
                          : otherUser?.name || "Chat"
                      })()}
                    </Text>
                  </View>
                </View>

                {/* Messages List */}
                <View className="flex-1 bg-white">
                  {messages.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <Feather name="message-circle" size={24} color="#65676B" />
                      </View>
                      <Text className="text-gray-500 text-center">No messages yet. Start the conversation!</Text>
                    </View>
                  ) : (
                    <FlatList
                      ref={flatListRef}
                      data={messages}
                      renderItem={renderMessage}
                      keyExtractor={(item) => item.id}
                      className="flex-1"
                      contentContainerStyle={{ paddingVertical: 16 }}
                      onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                      onLayout={() => flatListRef.current?.scrollToEnd()}
                    />
                  )}
                </View>

                {/* Message Input */}
                <View
                  className="bg-white border-t border-gray-100 px-4 py-3"
                  style={{ paddingBottom: insets.bottom + 12 }}
                >
                  <View className="flex-row items-end">
                    <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-3">
                      <TextInput
                        value={messageText}
                        onChangeText={setMessageText}
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        maxLength={1000}
                        className="text-base text-gray-900 max-h-24"
                        style={{ fontSize: 16 }}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={sendMessage}
                      disabled={!messageText.trim() || isSending}
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        messageText.trim() && !isSending ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      {isSending ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Feather name="send" size={18} color={messageText.trim() ? "white" : "#9CA3AF"} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            )}
          </Modal>
        </View>
      </Chat>
    </OverlayProvider>
  )
}

export default MessagesScreen
