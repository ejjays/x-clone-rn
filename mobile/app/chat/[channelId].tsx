import { useEffect } from "react";
import { View, Text, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useStreamChat } from "@/hooks/useStreamChat";
import {
  Channel,
  MessageInput,
  MessageList,
} from "stream-chat-react-native";
import { streamChatTheme } from "@/utils/StreamChatTheme";

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const { client, isConnected } = useStreamChat();

  useEffect(() => {
    if (!isConnected) {
      // You can add a loading indicator or a message here
      console.log("Waiting for Stream Chat connection...");
    }
  }, [isConnected]);

  if (!isConnected || !client) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ color: "#6B7280", marginTop: 8 }}>
            Connecting to chat...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!channelId) {
    Alert.alert("Error", "No channel ID found.");
    return (
      <View>
        <Text>Error: No channel ID provided.</Text>
      </View>
    );
  }

  // Get the channel from the client
  const channel = client.channel("messaging", channelId);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Channel channel={channel} theme={streamChatTheme}>
        <MessageList />
        <MessageInput />
      </Channel>
    </View>
  );
}