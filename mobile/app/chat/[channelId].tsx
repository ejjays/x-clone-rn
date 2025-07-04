import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useStreamChat } from "@/hooks/useStreamChat"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Keyboard,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const { client, isConnected, isConnecting } = useStreamChat()
  const { currentUser } = useCurrentUser()
  const insets = useSafeAreaInsets()

  const [channel, setChannel] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    )
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0))

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [])

  useEffect(() => {
    if (!client || !isConnected || !channelId || !currentUser) {
      setLoading(false)
      return
    }

    initializeChannel()

    async function initializeChannel() {
      try {
        setLoading(true)
        console.log("🔄 Initializing channel:", channelId)

        // Get the channel
        const ch = client.channel("messaging", channelId)
        await ch.watch()
        setChannel(ch)

        // Get other user info
        const membersArray = Array.isArray(ch.state.members) ? ch.state.members : Object.values(ch.state.members || {})

        const otherMember = membersArray.find((member: any) => member?.user?.id !== currentUser.clerkId)

        if (otherMember?.user) {
          setOtherUser({
            name: otherMember.user.name || "Unknown User",
            image: otherMember.user.image || `https://getstream.io/random_png/?name=${otherMember.user.name}`,
            online: otherMember.user.online || false,
          })
        }

        // Get messages
        const messagesArray = Array.isArray(ch.state.messages) ? Object.values(ch.state.messages) : []

        setMessages(messagesArray.reverse())

        // Listen for new messages
        const handleNewMessage = (event: any) => {
          console.log("📨 New message received:", event.message)
          setMessages((prev) => [event.message, ...prev])
        }

        ch.on("message.new", handleNewMessage)

        console.log("✅ Channel initialized successfully")

        // Cleanup function
        return () => {
          ch.off("message.new", handleNewMessage)
        }
      } catch (error) {
        console.error("❌ Error initializing channel:", error)
        Alert.alert("Error", "Failed to load chat. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }, [client, isConnected, channelId, currentUser])

  const sendMessage = async () => {
    if (!channel || !newMessage.trim() || sending) return

    setSending(true)
    try {
      console.log("📤 Sending message:", newMessage.trim())

      await channel.sendMessage({
        text: newMessage.trim(),
      })

      setNewMessage("")
      console.log("✅ Message sent successfully")
    } catch (error) {
      console.error("❌ Error sending message:", error)
      Alert.alert("Error", "Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const renderMessage = ({ item: message }: { item: any }) => {
    const isFromCurrentUser = message.user?.id === currentUser?.clerkId
    const messageTime = message.created_at ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true }) : ""

    return (
      <View className={`flex-row mb-4 ${isFromCurrentUser ? "justify-end" : "justify-start"}`}>
        <View
          className={`max-w-[75%] p-3 rounded-2xl ${
            isFromCurrentUser ? "bg-blue-500 rounded-br-md" : "bg-gray-200 rounded-bl-md"
          }`}
        >
          <Text className={`text-base ${isFromCurrentUser ? "text-white" : "text-gray-900"}`}>{message.text}</Text>
          {messageTime && (
            <Text className={`text-xs mt-1 ${isFromCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
              {messageTime}
            </Text>
          )}
        </View>
      </View>
    )
  }

  // Show loading while connecting or initializing
  if (isConnecting || loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">
            {isConnecting ? "Connecting to chat..." : "Loading conversation..."}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show error if not connected or no client
  if (!client || !isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">Connection Issue</Text>
          <Text className="text-gray-500 text-center">
            Unable to connect to chat service. Please check your internet connection.
          </Text>
          <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4" onPress={() => router.back()}>
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        {/* Profile Picture */}
        {otherUser?.image && (
          <View className="relative mr-3">
            <Image source={{ uri: otherUser.image }} className="w-10 h-10 rounded-full" />
            {otherUser.online && (
              <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </View>
        )}

        <View className="flex-1 min-w-0">
          <Text className="font-semibold text-gray-900 text-lg" numberOfLines={1} ellipsizeMode="tail">
            {otherUser?.name || "Chat"}
          </Text>
          {otherUser && <Text className="text-gray-500 text-sm">{otherUser.online ? "Online" : "Offline"}</Text>}
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons name="call-outline" size={24} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-2">
          <Ionicons name="videocam-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Messages Container */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1">
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id || index.toString()}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
            inverted
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-20" style={{ transform: [{ scaleY: -1 }] }}>
                <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">No messages yet</Text>
                <Text className="text-gray-400 text-sm">Start the conversation!</Text>
              </View>
            )}
          />

          {/* Message Input - Fixed at bottom */}
          <View
            className="flex-row items-end p-4 border-t border-gray-200 bg-white"
            style={{
              paddingBottom: Math.max(insets.bottom, 16),
              marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
            }}
          >
            <View className="flex-1 mr-3">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                className="border border-gray-300 rounded-full px-4 py-3 text-base max-h-24"
                multiline
                maxLength={500}
                editable={!sending}
                textAlignVertical="center"
                style={{
                  minHeight: 48,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-full ${newMessage.trim() && !sending ? "bg-blue-500" : "bg-gray-300"}`}
              style={{ marginBottom: 2 }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color={newMessage.trim() && !sending ? "white" : "gray"} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
