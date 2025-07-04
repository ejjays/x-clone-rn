import { useEffect } from "react"
import { View, Text, SafeAreaView, ActivityIndicator, Alert } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useStreamChat } from "@/hooks/useStreamChat"
import { Channel, MessageInput, MessageList } from "stream-chat-react-native"
import { streamChatTheme } from "@/utils/StreamChatTheme"

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const { client, isConnected, isConnecting } = useStreamChat()

  useEffect(() => {
    if (!channelId) {
      Alert.alert("Error", "No channel ID found.", [{ text: "OK", onPress: () => router.back() }])
    }
  }, [channelId])

  // Show loading while connecting
  if (isConnecting || !isConnected || !client) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ color: "#6B7280", marginTop: 8 }}>
            {isConnecting ? "Connecting to chat..." : "Loading chat..."}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!channelId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#6B7280" }}>Error: No channel ID provided.</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Get the channel from the client
  const channel = client.channel("messaging", channelId)

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Channel channel={channel} theme={streamChatTheme}>
        <MessageList />
        <MessageInput />
      </Channel>
    </View>
  )
}
