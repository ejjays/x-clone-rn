import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useStreamChat } from "@/hooks/useStreamChat"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { format, isToday, isYesterday } from "date-fns"
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
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height + 20)
    })
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

        const ch = client.channel("messaging", channelId)
        await ch.watch()
        setChannel(ch)

        const membersArray = Array.isArray(ch.state.members) ? ch.state.members : Object.values(ch.state.members || {})

        const otherMember = membersArray.find((member: any) => member?.user?.id !== currentUser.clerkId)

        if (otherMember?.user) {
          setOtherUser({
            name: otherMember.user.name || "Unknown User",
            image: otherMember.user.image || `https://getstream.io/random_png/?name=${otherMember.user.name}`,
            online: otherMember.user.online || false,
          })
        }

        const messagesArray = Array.isArray(ch.state.messages) ? Object.values(ch.state.messages) : []
        setMessages(messagesArray.reverse())

        const handleNewMessage = (event: any) => {
          console.log("📨 New message received:", event.message)
          setMessages((prev) => [event.message, ...prev])
        }

        ch.on("message.new", handleNewMessage)

        console.log("✅ Channel initialized successfully")

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

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return `TODAY AT ${format(date, "h:mm a").toUpperCase()}`
    } else if (isYesterday(date)) {
      return `YESTERDAY AT ${format(date, "h:mm a").toUpperCase()}`
    } else {
      return format(date, "d MMM 'AT' h:mm a").toUpperCase()
    }
  }

  const shouldShowTimestamp = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true

    const currentDate = new Date(currentMessage.created_at)
    const previousDate = new Date(previousMessage.created_at)

    // Show timestamp if messages are more than 30 minutes apart
    const timeDiff = currentDate.getTime() - previousDate.getTime()
    return timeDiff > 30 * 60 * 1000 // 30 minutes
  }

  const shouldShowAvatar = (currentMessage: any, nextMessage: any) => {
    if (!nextMessage) return true

    const isFromCurrentUser = currentMessage.user?.id === currentUser?.clerkId
    const nextIsFromCurrentUser = nextMessage.user?.id === currentUser?.clerkId

    // Show avatar if next message is from different user or if it's the last message from this user
    return isFromCurrentUser !== nextIsFromCurrentUser
  }

  const renderMessage = ({ item: message, index }: { item: any; index: number }) => {
    const isFromCurrentUser = message.user?.id === currentUser?.clerkId
    const previousMessage = index < messages.length - 1 ? messages[index + 1] : null
    const nextMessage = index > 0 ? messages[index - 1] : null
    const showTimestamp = shouldShowTimestamp(message, previousMessage)
    const showAvatar = shouldShowAvatar(message, nextMessage)

    return (
      <View>
        {showTimestamp && (
          <View className="items-center my-4">
            <Text className="text-gray-300 text-xs font-medium tracking-wide">
              {formatMessageTime(new Date(message.created_at))}
            </Text>
          </View>
        )}

        <View className={`flex-row mb-2 ${isFromCurrentUser ? "justify-end" : "justify-start"}`}>
          {!isFromCurrentUser && (
            <View className="mr-2" style={{ width: 32 }}>
              {showAvatar && otherUser?.image ? (
                <Image source={{ uri: otherUser.image }} className="w-8 h-8 rounded-full" />
              ) : null}
            </View>
          )}

          <View
            className={`max-w-[75%] px-4 py-3 ${
              isFromCurrentUser ? "bg-blue-500 rounded-3xl rounded-br-lg" : "bg-slate-700 rounded-3xl rounded-bl-lg"
            }`}
          >
            <Text className="text-white text-base leading-5">{message.text}</Text>
          </View>

          {isFromCurrentUser && <View style={{ width: 32 }} />}
        </View>
      </View>
    )
  }

  // Show loading while connecting or initializing
  if (isConnecting || loading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-600">
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text className="text-white mt-2">
              {isConnecting ? "Connecting to chat..." : "Loading conversation..."}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  // Show error if not connected or no client
  if (!client || !isConnected) {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-600">
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="cloud-offline-outline" size={64} color="#FFFFFF" />
            <Text className="text-xl font-semibold text-white mt-4 mb-2">Connection Issue</Text>
            <Text className="text-blue-100 text-center">
              Unable to connect to chat service. Please check your internet connection.
            </Text>
            <TouchableOpacity className="bg-white/20 px-6 py-3 rounded-lg mt-4" onPress={() => router.back()}>
              <Text className="text-white font-semibold">Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-600" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center p-4 bg-black/20">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
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
          <Text className="font-semibold text-white text-lg" numberOfLines={1} ellipsizeMode="tail">
            {otherUser?.name || "Chat"}
          </Text>
          {otherUser && <Text className="text-blue-100 text-sm">{otherUser.online ? "Online" : "Offline"}</Text>}
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons name="call-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-2">
          <Ionicons name="videocam-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Messages Container */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="flex-1">
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id || index.toString()}
            className="flex-1 px-4"
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: keyboardHeight > 0 ? 20 : 16,
            }}
            inverted
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-20" style={{ transform: [{ scaleY: -1 }] }}>
                <Ionicons name="chatbubbles-outline" size={48} color="#FFFFFF" />
                <Text className="text-white mt-2">No messages yet</Text>
                <Text className="text-blue-100 text-sm">Start the conversation!</Text>
              </View>
            )}
          />

          {/* Message Input */}
          <View
            className="flex-row items-end bg-black/20"
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom:
                Platform.OS === "ios"
                  ? Math.max(insets.bottom + 8, 20)
                  : keyboardHeight > 0
                    ? 20
                    : Math.max(insets.bottom + 8, 20),
              marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
            }}
          >
            <View className="flex-1 mr-3">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                className="bg-white/90 rounded-full px-4 py-3 text-base text-gray-900"
                multiline
                maxLength={500}
                editable={!sending}
                textAlignVertical="top"
                style={{
                  minHeight: 48,
                  maxHeight: 120,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-full ${newMessage.trim() && !sending ? "bg-blue-600" : "bg-gray-600"}`}
              style={{ marginBottom: 2 }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
