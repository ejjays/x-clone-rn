import LottieView from 'lottie-react-native';
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStreamChat } from "@/context/StreamChatContext";
import { Ionicons, FontAwesome5, FontAwesome6, Entypo, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TextInput,
  View,
  Image,
  InteractionManager,
  Pressable,
} from "react-native";
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";
import { useTheme } from "@/context/ThemeContext";
import { LightThemeColors, DarkThemeColors } from "@/constants/Colors"; 
import { useFocusEffect } from "@react-navigation/native";
import ChatHeader from "@/components/chat/ChatHeader";
import ReactionPickerModal from "@/components/chat/ReactionPickerModal";
import { Channel, MessageList, ReactionList } from "stream-chat-expo"; 
import { StyleSheet } from 'react-native';

const reactionListStyles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    borderRadius: 10,
    padding: 5,
  },
});

const CustomReactionList = props => (
  <View style={reactionListStyles.container}>
    <ReactionList {...props} supportedReactions={customReactions} />
  </View>
); 
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, interpolate, Extrapolate } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import CustomMessageInput from "@/components/chat/CustomMessageInput";

const MOCK_EMOJIS = ["👍", "❤️", "🔥", "🤣", "🥲", "😡"];

const LikeIcon = () => <Text style={{ fontSize: 20 }}>👍</Text>;
const LoveIcon = () => <Text style={{ fontSize: 20 }}>❤️</Text>;
const FireIcon = () => <Text style={{ fontSize: 20 }}>🔥</Text>;
const HahaIcon = () => <Text style={{ fontSize: 20 }}>🤣</Text>;
const SmileTearIcon = () => <Text style={{ fontSize: 20 }}>🥲</Text>;
const AngryIcon = () => <Text style={{ fontSize: 20 }}>😡</Text>;

const customReactions = [
  { type: 'like', Icon: LikeIcon, name: 'like' },
  { type: 'love', Icon: LoveIcon, name: 'love' },
  { type: 'fire', Icon: FireIcon, name: 'fire' },
  { type: 'haha', Icon: HahaIcon, name: 'haha' },
  { type: 'smile_tear', Icon: SmileTearIcon, name: 'smile_tear' },
  { type: 'angry', Icon: AngryIcon, name: 'angry' }
];

const CustomDateHeader = ({ dateString }) => (
  <Text style={{ color: 'white' }}>{dateString}</Text>
);

const CustomInlineDateSeparator = ({ dateString }) => (
  <Text style={{ 
    color: 'red', 
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500'
  }}>
    {dateString}
  </Text>
);

const getIconForActionType = (actionType) => {
  switch (actionType) {
    case 'deleteMessage':
      return <Entypo name="trash" size={20} color="white" />;
    case 'editMessage':
      return <MaterialIcons name="edit" size={20} color="white" />;
    case 'pinMessage':
      return <FontAwesome5 name="map-pin" size={20} color="white" />;
    case 'copyMessage':
      return <Ionicons name="copy" size={20} color="white" />;
    case 'flagMessage':
      return <Ionicons name="flag-outline" size={20} color="white" />;
    case 'muteUser':
      return <Ionicons name="volume-mute-outline" size={20} color="white" />;
    case 'blockUser':
      return <Ionicons name="ban-outline" size={20} color="white" />;
    case 'reply':
      return <Ionicons name="arrow-undo-outline" size={20} color="white" />;
    case 'quotedReply':
      return <FontAwesome6 name="reply" size={20} color="white" />;
    case 'threadReply':
      return <FontAwesome6 name="threads" size={20} color="white" />;
    default:
      return <Ionicons name="mail-unread" size={20} color="white" />;
  }
};

const CustomMessageActionsList = (props) => {
  const { messageActions } = props;
  return (
    <View style={{ backgroundColor: 'black', padding: 16 }}>
      {messageActions?.map((action) => (
        <Pressable 
          key={action.title}
          onPress={action.action}
          style={{ 
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <View style={{ marginRight: 12 }}>
            {getIconForActionType(action.actionType)}
          </View>
          <Text style={{ color: 'white', fontSize: 16 }}>
            {action.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const CustomEmptyState = () => {
  const { colors } = useTheme();
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
  });

  const animatedLottieStyle = useAnimatedStyle(() => {
    'worklet';
    const size = interpolate(
      keyboardHeight.value,
      [0, 300], // Input range (keyboard height)
      [200, 120], // Output range (Lottie size)
      Extrapolate.CLAMP
    );

    return {
      width: size,
      height: size,
    };
  });

  const animatedSpacerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      height: keyboardHeight.value,
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <AnimatedLottieView
          source={require('../../assets/animations/connect.json')}
          autoPlay
          loop
          style={animatedLottieStyle}
        />
        <Text style={{ color: colors.text, marginTop: 20, fontSize: 16, fontWeight: '600' }}>
          No messages here yet
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
          Be the first one to send a message!
        </Text>
      </View>
    </View>
  );
};

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

  // Track active state for immediate cleanup on blur
  const isActiveRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  const navigateBack = useCallback(() => {
    router.back();
  }, []);

  useFocusEffect(
    useCallback(() => {
      isActiveRef.current = true;
      if (Platform.OS === "android") {
        NavigationBar.setBackgroundColorAsync("black");
      }

      return () => {
        isActiveRef.current = false;
        InteractionManager.runAfterInteractions(() => {
          if (cleanupRef.current) {
            try {
              cleanupRef.current();
            } catch (e) {
              console.log('Cleanup failed', e);
            }
            cleanupRef.current = null;
          }
        });
      };
    }, [])
  );

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

  // Add this right after your state declarations
  const keyboardHeight = useSharedValue(0);
  useKeyboardHandler({
    onMove: (e) => {
      "worklet";
      keyboardHeight.value = e.height;
    },
  });

  const animatedSpacerStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      height: keyboardHeight.value,
    };
  });

  useEffect(() => {
    if (!channelId) return;

    // Defer reading cached messages to avoid blocking nav
    InteractionManager.runAfterInteractions(() => {
      if (!isActiveRef.current) return;
      (async () => {
        try {
          const raw = await AsyncStorage.getItem(
            StorageKeys.CHAT_MESSAGES(channelId)
          );
          if (raw && isActiveRef.current) {
            const snapshot = JSON.parse(raw);
            if (Array.isArray(snapshot)) setMessages(snapshot);
          }
        } catch {}
      })();
    });

    if (!client || !isConnected || !currentUser) return;

    const initializeChannel = async () => {
      if (!isActiveRef.current) return;

      try {
        let ch: any = null;

        try {
          ch = (cachedChannels || []).find((c: any) => c?.id === channelId) || null;
        } catch {}

        if (ch) {
          setChannel(ch);
          if (isActiveRef.current) {
            ch.watch().catch(() => {});
          }
        } else {
          ch = client.channel("messaging", channelId);
          setChannel(ch);
          if (isActiveRef.current) {
            ch.watch().catch(() => {});
          }
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
          if (!isActiveRef.current) return;
          const eventChannel = event.channel || ch;
          setMessages(eventChannel.state.messages.slice().reverse());
        };

        setMessages(ch.state.messages.slice().reverse());

        ch.on("message.new", handleEvent);
        ch.on("message.updated", handleEvent);
        ch.on("message.deleted", handleEvent);
        ch.on("reaction.new", handleEvent);
        ch.on("reaction.updated", handleEvent);
        ch.on("reaction.deleted", handleEvent);

        const cleanup = () => {
          try {
            ch.off("message.new", handleEvent);
            ch.off("message.updated", handleEvent);
            ch.off("message.deleted", handleEvent);
            ch.off("reaction.new", handleEvent);
            ch.off("reaction.updated", handleEvent);
            ch.off("reaction.deleted", handleEvent);
          } catch {}
        };
        cleanupRef.current = cleanup;

        setLoading(false);
        return cleanup;
      } catch (error) {
        console.error("❌ Error initializing channel:", error);
        if (isActiveRef.current) {
          Alert.alert("Error", "Failed to load chat. Please try again.");
        }
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

  if ((isConnecting && !messages.length) || (loading && !channel)) {
    if (messages && messages.length > 0) {
      // Show cached messages immediately
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
          <ChatHeader colors={colors} otherUser={otherUser} channelId={channelId} onBack={navigateBack} />
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
              removeClippedSubviews={true}
              maxToRenderPerBatch={3}
              windowSize={3}
            />
          </View>
        </SafeAreaView>
      );
    }
    
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <ChatHeader colors={colors} otherUser={otherUser} channelId={channelId} onBack={navigateBack} />
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
          <ChatHeader colors={colors} otherUser={otherUser} channelId={channelId} onBack={navigateBack} />
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
      <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={colors.background} />

      {/* Render header immediately; it reads channelId and otherUser snapshot */}
      <ChatHeader colors={colors} otherUser={otherUser} channelId={channelId} onBack={navigateBack} />

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
              <Channel 
                channel={channel}
                disableKeyboardCompatibleView={true}
                DateHeader={CustomDateHeader}
                hideStickyDateHeader={true}
                hideDateSeparators={true}
                InlineDateSeparator={CustomInlineDateSeparator}
                MessageActionList={CustomMessageActionsList}
                supportedReactions={customReactions}
                ReactionList={CustomReactionList}
              >
                <MessageList
                  EmptyStateIndicator={CustomEmptyState}
                  enableMessageGroupingByUser={false}
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
                <View>
                  <CustomMessageInput />
                </View>
                <Animated.View style={animatedSpacerStyle} />
              </Channel>
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