// mobile/app/chat/[channelId].tsx
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStreamChat } from "@/context/StreamChatContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
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
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";
import { offlineQueue } from "@/utils/offline/OfflineQueue";
import { useTheme } from "@/context/ThemeContext";
import { LightThemeColors, DarkThemeColors } from "@/constants/Colors"; // Import both theme colors
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { useFocusEffect } from "@react-navigation/native";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import ReactionPickerModal from "@/components/chat/ReactionPickerModal";
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from "stream-chat-expo"; // Use built-in MessageInput
import { createStreamChatTheme } from "@/utils/StreamChatTheme";
import { uploadMediaToCloudinary } from "@/utils/cloudinary";

const MOCK_EMOJIS = ["👍", "❤️", "🔥", "🤣", "🥲", "😡"];

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const channelId =
    typeof params?.channelId === "string"
      ? (params.channelId as string)
      : undefined;
  const { client, isConnected, isConnecting } = useStreamChat();
  const { currentUser } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const colors = {
    background: isDarkMode
      ? DarkThemeColors.background
      : LightThemeColors.background,
    cardBackground: isDarkMode
      ? DarkThemeColors.surface
      : LightThemeColors.surface,
    text: isDarkMode ? DarkThemeColors.text : LightThemeColors.text,
    grayText: isDarkMode
      ? DarkThemeColors.textSecondary
      : LightThemeColors.textSecondary,
    border: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
    inputBackground: isDarkMode
      ? DarkThemeColors.surface
      : LightThemeColors.surface,
    inputBorder: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
    blue500: isDarkMode ? DarkThemeColors.blue : LightThemeColors.blue,
    gray200: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
  };

  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [quotedMessage, setQuotedMessage] = useState<any | null>(null);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{
    pageX: number;
    pageY: number;
    width: number;
  } | null>(null);
  const messageRefs = useRef<{ [key: string]: View | null }>({});
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (!channelId) return;

    // Hydrate cached messages for offline display
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(
          StorageKeys.CHAT_MESSAGES(channelId)
        );
        if (raw) {
          const snapshot = JSON.parse(raw);
          if (Array.isArray(snapshot)) setMessages(snapshot);
        }
      } catch {}
    })();

    if (!client || !isConnected || !currentUser) return;

    const initializeChannel = async () => {
      try {
        setLoading(true);
        const ch = client.channel("messaging", channelId);
        await ch.watch();
        setChannel(ch);

        const membersArray = Array.isArray(ch.state.members)
          ? ch.state.members
          : Object.values(ch.state.members || {});
        const otherMember = membersArray.find(
          (member: any) => member?.user?.id !== currentUser.clerkId
        );

        if (otherMember?.user) {
          setOtherUser({
            name: otherMember.user.name || "Unknown User",
            image:
              otherMember.user.image ||
              `https://getstream.io/random_png/?name=${otherMember.user.name}`,
            online: otherMember.user.online || false,
          });
        }

        const handleEvent = (event: any) => {
          const eventChannel = event.channel || ch;
          setMessages(eventChannel.state.messages.slice().reverse());
          // Persist a small snapshot for offline
          try {
            const snapshot = (eventChannel.state.messages || [])
              .slice(-50)
              .reverse()
              .map((m: any) => ({
                id: m.id,
                text: m.text,
                user: m.user,
                attachments: m.attachments,
                created_at: m.created_at,
              }));
            AsyncStorage.setItem(
              StorageKeys.CHAT_MESSAGES(channelId),
              JSON.stringify(snapshot)
            ).catch(() => {});
          } catch {}
        };

        setMessages(ch.state.messages.slice().reverse());
        try {
          const snapshot = (ch.state.messages || [])
            .slice(-50)
            .reverse()
            .map((m: any) => ({
              id: m.id,
              text: m.text,
              user: m.user,
              attachments: m.attachments,
              created_at: m.created_at,
            }));
          AsyncStorage.setItem(
            StorageKeys.CHAT_MESSAGES(channelId),
            JSON.stringify(snapshot)
          ).catch(() => {});
        } catch {}

        ch.on("message.new", handleEvent);
        ch.on("message.updated", handleEvent);
        ch.on("message.deleted", handleEvent);
        ch.on("reaction.new", handleEvent);
        ch.on("reaction.updated", handleEvent);
        ch.on("reaction.deleted", handleEvent);

        setTimeout(() => {
          setLoading(false);
        }, 500);

        return () => {
          ch.off("message.new", handleEvent);
          ch.off("message.updated", handleEvent);
          ch.off("message.deleted", handleEvent);
          ch.off("reaction.new", handleEvent);
          ch.off("reaction.updated", handleEvent);
          ch.off("reaction.deleted", handleEvent);
        };
      } catch (error) {
        console.error("❌ Error initializing channel:", error);
        Alert.alert("Error", "Failed to load chat. Please try again.");
        setLoading(false);
      }
    };

    initializeChannel();
  }, [client, isConnected, channelId, currentUser]);

  // Remove manual keyboard tracking; rely on OS resize + KeyboardAvoidingView

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        try {
          NavigationBar.setVisibilityAsync("visible");
          NavigationBar.setPositionAsync("absolute");
          NavigationBar.setBehaviorAsync("inset-swipe");
          NavigationBar.setBackgroundColorAsync(
            isDarkMode
              ? DarkThemeColors.background
              : LightThemeColors.background
          );
          NavigationBar.setButtonStyleAsync(isDarkMode ? "light" : "dark");
        } catch {}
      }
      return () => {
        if (Platform.OS === "android") {
          try {
            NavigationBar.setVisibilityAsync("visible");
            NavigationBar.setPositionAsync("absolute");
            NavigationBar.setBehaviorAsync("inset-swipe");
            NavigationBar.setBackgroundColorAsync(
              isDarkMode
                ? DarkThemeColors.background
                : LightThemeColors.background
            );
            NavigationBar.setButtonStyleAsync(isDarkMode ? "light" : "dark");
          } catch {}
        }
      };
    }, [isDarkMode])
  );

  // Let built-in MessageInput handle sending. Only provide upload override through Channel props below.

  const handleReaction = async (emoji: string) => {
    try {
      if (!channel || !selectedMessage) return;
      const reactionTypeMap: Record<string, string> = {
        "👍": "like",
        "❤️": "love",
        "🔥": "fire",
        "🤣": "haha",
        "🥲": "smile_tear",
        "😡": "angry",
      };
      const reactionType = reactionTypeMap[emoji];
      if (!reactionType) return;

      const ownReactions: any[] = Array.isArray(selectedMessage.own_reactions)
        ? selectedMessage.own_reactions
        : [];
      const hasSameType = ownReactions.some(
        (r: any) => r.type === reactionType
      );

      if (hasSameType) {
        await channel.deleteReaction(selectedMessage.id, reactionType);
      } else {
        for (const r of ownReactions) {
          if (r?.type && r.type !== reactionType) {
            try {
              await channel.deleteReaction(selectedMessage.id, r.type);
            } catch {}
          }
        }
        await channel.sendReaction(selectedMessage.id, { type: reactionType });
      }
    } catch (error) {
      console.error("❌ Error handling reaction:", error);
      Alert.alert("Error", "Failed to update reaction. Please try again.");
    } finally {
      setSelectedMessage(null);
    }
  };

  const handleLongPress = (message: any) => {
    const ref = messageRefs.current[message.id];
    if (ref) {
      ref.measure((_x, _y, width, height, pageX, pageY) => {
        setAnchorMeasurements({ pageX, pageY, width });
        setSelectedMessage(message);
      });
    }
  };

  if (isConnecting || loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!client || !isConnected) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name="cloud-offline-outline"
            size={64}
            color={colors.grayText}
          />
          <Text
            className="text-xl font-semibold mt-4 mb-2"
            style={{ color: colors.text }}
          >
            Connection Issue
          </Text>
          <Text className="text-center" style={{ color: colors.grayText }}>
            Unable to connect to chat service. Please check your internet
            connection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ChatHeader colors={colors} otherUser={otherUser} />

      <View className="flex-1">
        {client && channel && (
          <OverlayProvider value={{ style: createStreamChatTheme(isDarkMode) }}>
            <Chat client={client}>
              <Channel channel={channel}>
                {Platform.OS === 'ios' ? (
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    keyboardVerticalOffset={0}
                  >
                    <MessageList />
                    <MessageInput hasImagePicker hasFilePicker={false} compressImageQuality={0.8} />
                  </KeyboardAvoidingView>
                ) : (
                  <View style={{ flex: 1 }}>
                    <MessageList />
                    <MessageInput hasImagePicker hasFilePicker={false} compressImageQuality={0.8} />
                  </View>
                )}
              </Channel>
            </Chat>
          </OverlayProvider>
        )}
      </View>

      <ReactionPickerModal
        visible={!!selectedMessage}
        anchor={anchorMeasurements}
        colors={colors}
        emojis={MOCK_EMOJIS}
        onPick={handleReaction}
        onClose={() => setSelectedMessage(null)}
      />
    </SafeAreaView>
  );
}
