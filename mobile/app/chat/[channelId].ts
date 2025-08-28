// mobile/app/chat/[channelId].tsx
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStreamChat } from "@/context/StreamChatContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  View,
  KeyboardAvoidingView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import { LightThemeColors, DarkThemeColors } from "@/constants/Colors";
import ChatHeader from "@/components/chat/ChatHeader";
import { 
  Chat, 
  Channel, 
  MessageList, 
  MessageInput, 
  OverlayProvider 
} from "stream-chat-expo";
import { createStreamChatTheme } from "@/utils/StreamChatTheme";

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const channelId = typeof params?.channelId === "string" ? params.channelId : undefined;
  const { client, isConnected, isConnecting } = useStreamChat();
  const { currentUser } = useCurrentUser();
  const { isDarkMode } = useTheme();

  const colors = {
    background: isDarkMode ? DarkThemeColors.background : LightThemeColors.background,
    text: isDarkMode ? DarkThemeColors.text : LightThemeColors.text,
    grayText: isDarkMode ? DarkThemeColors.textSecondary : LightThemeColors.textSecondary,
  };

  const [channel, setChannel] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId || !client || !isConnected || !currentUser) return;

    const initializeChannel = async () => {
      try {
        setLoading(true);
        const ch = client.channel("messaging", channelId);
        await ch.watch();
        setChannel(ch);

        // Get other user info
        const membersArray = Array.isArray(ch.state.members)
          ? ch.state.members
          : Object.values(ch.state.members || {});
        const otherMember = membersArray.find(
          (member) => member?.user?.id !== currentUser.clerkId
        );

        if (otherMember?.user) {
          setOtherUser({
            name: otherMember.user.name || "Unknown User",
            image: otherMember.user.image || `https://getstream.io/random_png/?name=${otherMember.user.name}`,
            online: otherMember.user.online || false,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Error initializing channel:", error);
        Alert.alert("Error", "Failed to load chat. Please try again.");
        setLoading(false);
      }
    };

    initializeChannel();
  }, [client, isConnected, channelId, currentUser]);

  if (isConnecting || loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!client || !isConnected || !channel) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={64} color={colors.grayText} />
          <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: colors.text }}>
            Connection Issue
          </Text>
          <Text className="text-center" style={{ color: colors.grayText }}>
            Unable to connect to chat service. Please check your internet connection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <OverlayProvider>
      <Chat client={client} style={createStreamChatTheme(isDarkMode)}>
        <Channel channel={channel}>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <SafeAreaView edges={['top']}>
              <StatusBar style={isDarkMode ? "light" : "dark"} />
              
              {/* Header */}
              <ChatHeader
                otherUser={otherUser}
                onGoBack={() => router.back()}
                isDarkMode={isDarkMode}
              />
            </SafeAreaView>

            {/* Chat Content with Keyboard Avoidance */}
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={0}
            >
              <MessageList />
              <MessageInput />
            </KeyboardAvoidingView>
          </View>
        </Channel>
      </Chat>
    </OverlayProvider>
  );
}
