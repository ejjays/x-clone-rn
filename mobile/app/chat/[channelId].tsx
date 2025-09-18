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
  InteractionManager,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";
import { offlineQueue } from "@/utils/offline/OfflineQueue";
import { useTheme } from "@/context/ThemeContext";
import { LightThemeColors, DarkThemeColors } from "@/constants/Colors"; // Import both theme colors
import * as SystemUI from "expo-system-ui";
import { useFocusEffect } from "@react-navigation/native";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import ReactionPickerModal from "@/components/chat/ReactionPickerModal";
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from "stream-chat-expo"; // Use built-in MessageInput
// import KeyboardAvoiderView from "@/components/KeyboardAvoiderView";
import { createStreamChatTheme } from "@/utils/StreamChatTheme";
import { uploadMediaToCloudinary } from "@/utils/cloudinary";
import Animated, { FadeIn } from "react-native-reanimated";

const MOCK_EMOJIS = ["👍", "❤️", "🔥", "🤣", "🥲", "😡"];

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const channelId =
    typeof params?.channelId === "string"
      ? (params.channelId as string)
      : undefined;
  const { client, isConnected, isConnecting, channels: cachedChannels } = useStreamChat();
  const { currentUser } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const colors = {
    background: isDarkMode
      ? DarkThemeColors.chatBackground
      : LightThemeColors.chatBackground,
    cardBackground: isDarkMode
      ? DarkThemeColors.chatBackground
      : LightThemeColors.chatBackground,
    text: isDarkMode ? DarkThemeColors.text : LightThemeColors.text,
    grayText: isDarkMode
      ? DarkThemeColors.textSecondary
      : LightThemeColors.textSecondary,
    border: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
    inputBackground: isDarkMode
      ? DarkThemeColors.chatBackground
      : LightThemeColors.chatBackground,
    inputBorder: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
    blue500: isDarkMode ? DarkThemeColors.blue : LightThemeColors.blue,
    gray200: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
  };

  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(() => {
    try {
      const name = params?.name ? decodeURIComponent(String(params.name)) : undefined;
      const image = params?.image ? decodeURIComponent(String(params.image)) : undefined;
      const id = params?.other ? decodeURIComponent(String(params.other)) : undefined;
      if (name || image || id) {
        return { name, image, id, online: false };
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(false);
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
        let ch: any = null;
        // Prefer existing channel from context cache for instant render
        try {
          ch = (cachedChannels || []).find((c: any) => c?.id === channelId) || null;
        } catch {}

        const prehydrateFromCache = async (target: any) => {
          try {
            const raw = await AsyncStorage.getItem(
              StorageKeys.CHAT_MESSAGES(channelId)
            );
            if (raw) {
              const snapshot = JSON.parse(raw);
              if (Array.isArray(snapshot) && snapshot.length > 0) {
                (target as any).state?.addMessagesSorted?.(snapshot as any);
              }
            }
          } catch {}
        };

        if (ch) {
          await prehydrateFromCache(ch);
          setChannel(ch);
          // Ensure heavy network work starts after transition/animations
          setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
              ch.watch().catch(() => {});
            });
          }, 0);
        } else {
          ch = client.channel("messaging", channelId);
          await prehydrateFromCache(ch);
          setChannel(ch);
          // Kick off network watch after initial render and after interactions
          setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
              ch.watch().catch(() => {});
            });
          }, 0);
        }

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
            id: otherMember.user.id,
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

        setLoading(false);

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

  // Removed NavigationBar toggling; keep system UI stable on focus transitions

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

  if (isConnecting || (loading && !channel)) {
    if (messages && messages.length > 0) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
          <ChatHeader colors={colors} otherUser={otherUser} channelId={channelId} />
          <View style={{ flex: 1 }}>
            <FlatList
              data={messages}
              keyExtractor={(m: any) => String(m.id)}
              renderItem={({ item }: any) => (
                <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: colors.text }}>{item.text}</Text>
                </View>
              )}
              inverted
              contentContainerStyle={{ paddingTop: 0 }}
            />
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!client || !isConnected) {
    if (messages && messages.length > 0) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
          <ChatHeader colors={colors} otherUser={otherUser} channelId={channelId} />
          <View style={{ flex: 1 }}>
            <FlatList
              data={messages}
              keyExtractor={(m: any) => String(m.id)}
              renderItem={({ item }: any) => (
                <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: colors.text }}>{item.text}</Text>
                </View>
              )}
              inverted
              contentContainerStyle={{ paddingTop: 0 }}
            />
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={64} color={colors.grayText} />
          <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: colors.text }}>
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

      {/* Render header immediately; it reads channelId and otherUser snapshot */}
      <ChatHeader colors={colors} otherUser={otherUser} channelId={channelId} />

      <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(120)}>
        {(() => {
          const channelHasMessages = Boolean((channel as any)?.state?.messages?.length);
          const hasCached = Array.isArray(messages) && messages.length > 0;
          const showFallback = hasCached && !channelHasMessages;
          if (showFallback) {
            return (
              <View style={{ flex: 1 }}>
                <FlatList
                  data={messages}
                  keyExtractor={(m: any) => String(m.id)}
                  renderItem={({ item }: any) => (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ color: colors.text }}>{item.text}</Text>
                    </View>
                  )}
                  inverted
                  contentContainerStyle={{ paddingTop: 0 }}
                />
              </View>
            );
          }
          if (client && channel) {
            return (
              <OverlayProvider value={{ style: createStreamChatTheme(isDarkMode) }}>
                <Chat client={client}>
                  <Channel channel={channel}>
                    <View style={{ flex: 1 }}>
                      <MessageList
                        contentInsetAdjustmentBehavior="never"
                        additionalFlatListProps={{
                          contentContainerStyle: { paddingTop: 0 },
                          onEndReached: async () => {
                            try {
                              const msgs: any[] = (channel?.state?.messages || []) as any[];
                              const oldest = msgs && msgs.length > 0 ? msgs[0] : null;
                              if (!oldest || !(channel as any)?.query) return;
                              const res = await (channel as any).query({
                                messages: { limit: 30, id_lt: oldest.id },
                              });
                              if (res?.messages?.length) {
                                (channel as any).state?.addMessagesSorted?.(res.messages);
                              }
                            } catch {}
                          },
                          onEndReachedThreshold: 0.1,
                        }}
                      />
                      <MessageInput hasImagePicker hasFilePicker={false} compressImageQuality={0.8} />
                    </View>
                  </Channel>
                </Chat>
              </OverlayProvider>
            );
          }
          return null;
        })()}
      </Animated.View>

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
