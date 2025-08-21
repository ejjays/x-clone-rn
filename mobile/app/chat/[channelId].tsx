// mobile/app/chat/[channelId].tsx
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStreamChat } from "@/context/StreamChatContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useState, useRef } from "react";
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
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  // Removed useColorScheme
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, { Layout } from "react-native-reanimated";
import { pickMedia, uploadMediaToCloudinary } from "@/utils/mediaPicker";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import { LightThemeColors, DarkThemeColors } from "@/constants/Colors"; // Import both theme colors

const MOCK_EMOJIS = ["👍", "❤️", "🔥", "🤣", "🥲", "😡"];

// Map plain emojis from the picker to Stream Chat reaction types
const EMOJI_TO_REACTION: Record<string, string> = {
  "👍": "like",
  "❤️": "love",
  "🔥": "fire",
  "🤣": "haha",
  "🥲": "smile_tear",
  "😡": "angry",
};

// Map reaction types to plain emojis for rendering on message bubbles
const REACTION_TO_EMOJI: Record<string, string> = {
  like: "👍",
  love: "❤️",
  fire: "🔥",
  haha: "🤣",
  smile_tear: "🥲",
  angry: "😡",
  // legacy/aliases mapping if present in the data
  thumbsup: "👍",
  enraged: "😡",
  kissing_heart: "❤️",
};

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const channelId = (params as any)?.channelId as string | undefined;
  const { client, isConnected, isConnecting } = useStreamChat();
  const { currentUser } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  // Define dynamic colors based on dark mode state from context
  const colors = {
    background: isDarkMode ? DarkThemeColors.background : LightThemeColors.background,
    cardBackground: isDarkMode ? DarkThemeColors.surface : LightThemeColors.surface,
    text: isDarkMode ? DarkThemeColors.text : LightThemeColors.text,
    grayText: isDarkMode ? DarkThemeColors.textSecondary : LightThemeColors.textSecondary,
    border: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
    inputBackground: isDarkMode ? DarkThemeColors.surface : LightThemeColors.surface,
    inputBorder: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
    blue500: isDarkMode ? DarkThemeColors.blue : LightThemeColors.blue,
    gray200: isDarkMode ? DarkThemeColors.border : LightThemeColors.border, // For received message bubble
  };


  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    type: "image" | "video";
  } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{
    pageX: number;
    pageY: number;
    width: number;
  } | null>(null);
  const messageRefs = useRef<{ [key: string]: View | null }>({});

  useEffect(() => {
    if (!client || !isConnected || !channelId || !currentUser) {
      return;
    }

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
        };

        setMessages(ch.state.messages.slice().reverse());

        ch.on("message.new", handleEvent);
        ch.on("message.updated", handleEvent);
        ch.on("message.deleted", handleEvent);
        // Refresh list on reaction events as well
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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height + 20)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!channel || (!newMessage.trim() && !selectedMedia) || sending) return;

    setSending(true);
    try {
      let messageData: any = { text: newMessage.trim() };

      if (selectedMedia) {
        const mediaUrl = await uploadMediaToCloudinary(selectedMedia);
        if (mediaUrl) {
          messageData.attachments = [
            {
              type: selectedMedia.type,
              asset_url: mediaUrl,
              thumb_url: mediaUrl,
            },
          ];
        } else {
          Alert.alert(
            "Upload Failed",
            "Could not upload your media. Message not sent."
          );
          setSending(false);
          return;
        }
      }

      if (
        !messageData.text &&
        (!messageData.attachments || messageData.attachments.length === 0)
      ) {
        setSending(false);
        return;
      }

      await channel.sendMessage(messageData);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      Alert.alert("Error", "Failed to send message.");
    } finally {
      setNewMessage("");
      setSelectedMedia(null);
      setSending(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      if (!channel || !selectedMessage) return;
      const reactionType = EMOJI_TO_REACTION[emoji];
      if (!reactionType) return;

      const ownReactions: any[] = Array.isArray(selectedMessage.own_reactions)
        ? selectedMessage.own_reactions
        : [];

      const hasSameType = ownReactions.some((r: any) => r.type === reactionType);

      if (hasSameType) {
        await channel.deleteReaction(selectedMessage.id, reactionType);
      } else {
        // Remove any existing own reactions of other types, then add new
        for (const r of ownReactions) {
          if (r?.type && r.type !== reactionType) {
            try {
              await channel.deleteReaction(selectedMessage.id, r.type);
            } catch (e) {
              // continue best-effort
            }
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

  const formatMessageTime = (date: Date) => {
    if (isToday(date))
      return `TODAY AT ${format(date, "h:mm a").toUpperCase()}`;
    if (isYesterday(date))
      return `YESTERDAY AT ${format(date, "d MMM 'AT' h:mm a").toUpperCase()}`;
    return format(date, "d MMM yyyy 'AT' h:mm a").toUpperCase();
  };

  const shouldShowTimestamp = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    const timeDiff =
      new Date(currentMessage.created_at).getTime() -
      new Date(previousMessage.created_at).getTime();
    return timeDiff > 30 * 60 * 1000;
  };

  const renderMessage = ({
    item: message,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const isFromCurrentUser = message.user?.id === currentUser?.clerkId;
    const hasReactions =
      (message.reaction_counts && Object.keys(message.reaction_counts).length > 0) ||
      (message.latest_reactions && message.latest_reactions.length > 0);
    const attachment = message.attachments?.[0];

    const messageAbove =
      index < messages.length - 1 ? messages[index + 1] : null;
    const messageBelow = index > 0 ? messages[index - 1] : null;

    const showTimestamp = shouldShowTimestamp(message, messageAbove);
    const isFirstInGroup =
      showTimestamp ||
      !messageAbove ||
      messageAbove.user?.id !== message.user.id;
    const isLastInGroup =
      !messageBelow ||
      messageBelow.user?.id !== message.user.id ||
      shouldShowTimestamp(messageBelow, message);
    const showAvatar = isLastInGroup;

    const getBubbleStyle = () => {
      let style = "rounded-3xl";
      if (isFirstInGroup && isLastInGroup) return style;
      if (isFromCurrentUser) {
        if (isFirstInGroup) style += " rounded-br-lg";
        else if (isLastInGroup) style += " rounded-tr-lg";
        else style += " rounded-tr-lg rounded-br-lg";
      } else {
        if (isFirstInGroup) style += " rounded-bl-lg";
        else if (isLastInGroup) style += " rounded-tl-lg";
        else style += " rounded-tl-lg rounded-bl-lg";
      }
      return style;
    };

    const ReactionComponent = () => {
      if (!hasReactions) return null;

      // Prefer counts if available to pick top reactions
      let reactionTypes: string[] = [];
      if (message.reaction_counts) {
        reactionTypes = Object.entries(message.reaction_counts)
          .filter(([type, count]) => typeof count === "number" && count > 0)
          .sort((a: any, b: any) => b[1] - a[1])
          .map(([type]) => type as string);
      } else if (message.latest_reactions) {
        const types = message.latest_reactions.map((r: any) => r.type);
        reactionTypes = Array.from(new Set(types));
      }

      const emojis = reactionTypes
        .map((type) => REACTION_TO_EMOJI[type] || null)
        .filter((emoji): emoji is string => !!emoji);

      const uniqueEmojis = Array.from(new Set(emojis));
      if (uniqueEmojis.length === 0) return null;

      return (
        <View className="absolute -bottom-2.5 -right-2 rounded-full p-0.5 shadow flex-row" style={{ backgroundColor: colors.background }}>
          {uniqueEmojis.slice(0, 3).map((emoji, idx) => (
            <Text
              key={`${emoji}-${idx}`}
              className="text-sm"
              style={{ transform: [{ translateX: -idx * 4 }] }}
            >
              {emoji}
            </Text>
          ))}
        </View>
      );
    };

    return (
      <Animated.View layout={Layout.duration(200)}>
        {showTimestamp && (
          <View className="items-center my-6">
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.cardBackground }}>
              <Text className="text-xs font-medium tracking-wide" style={{ color: colors.grayText }}>
                {formatMessageTime(new Date(message.created_at))}
              </Text>
            </View>
          </View>
        )}

        <View
          className={`flex-row items-end ${isLastInGroup ? "mb-2" : "mb-0.5"}`}
        >
          <View
            className={`flex-1 flex-row items-end ${isFromCurrentUser ? "justify-end pr-1" : "justify-start pl-1"}`}
          >
            {!isFromCurrentUser && (
              <View className="mr-2" style={{ width: 32 }}>
                {showAvatar && otherUser?.image && (
                  <Image
                    source={{ uri: otherUser.image }}
                    className="w-8 h-8 rounded-full"
                  />
                )}
              </View>
            )}

            <View
              className={`max-w-[80%] ${hasReactions ? "pb-4" : ""}`}
              ref={(el) => (messageRefs.current[message.id] = el)}
            >
              <TouchableOpacity
                onLongPress={() => handleLongPress(message)}
                delayLongPress={200}
                activeOpacity={0.8}
              >
                <View
                  className={`px-4 py-2.5 ${getBubbleStyle()} ${
                    isFromCurrentUser ? "shadow-sm" : ""
                  }`}
                  style={{ backgroundColor: isFromCurrentUser ? colors.blue500 : colors.gray200 }}
                >
                  {attachment && attachment.type === "image" && (
                    <Image
                      source={{
                        uri: attachment.asset_url || attachment.thumb_url,
                      }}
                      className="w-48 h-48 rounded-lg mb-2"
                    />
                  )}

                  {message.text && (
                    <Text
                      className={`text-lg leading-6`}
                      style={{ color: isFromCurrentUser ? "white" : colors.text }}
                    >
                      {message.text}
                    </Text>
                  )}
                </View>
                <ReactionComponent />
              </TouchableOpacity>
            </View>

            {isFromCurrentUser && <View style={{ width: 8 }} />}
          </View>
        </View>
      </Animated.View>
    );
  };

  if (isConnecting || loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="50" color="#1DA1F2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!client || !isConnected) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
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
    <View className="flex-1" style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {/* Header */}
      <View className="flex-row items-center p-4 border-b bg-white" style={{ borderBottomColor: colors.border, backgroundColor: colors.background }}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.grayText} />
        </TouchableOpacity>
        {otherUser?.image && (
          <View className="relative mr-3">
            <Image
              source={{ uri: otherUser.image }}
              className="w-12 h-12 rounded-full"
            />
            {otherUser.online && (
              <View className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </View>
        )}
        <View className="flex-1 min-w-0">
          <Text
            className="font-semibold text-xl"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: colors.text }}
          >
            {otherUser?.name || "Chat"}
          </Text>
          {otherUser && (
            <Text className="text-sm" style={{ color: colors.grayText }}>
              {otherUser.online ? "Online" : "Offline"}
            </Text>
          )}
        </View>
        <TouchableOpacity className="p-2">
          <Ionicons name="call-outline" size={24} color={colors.grayText} />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-2">
          <Ionicons name="videocam-outline" size={24} color={colors.grayText} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="flex-1">
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            className="flex-1 px-2"
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: keyboardHeight > 0 ? 20 : 16,
            }}
            inverted
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => {
              Keyboard.dismiss();
              setSelectedMessage(null);
            }}
          />

          {/* Message Input */}
          <View
            className="flex-row items-end border-t px-4"
            style={{
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 16),
              marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            {/* Image Picker Button */}
            {selectedMedia ? (
              <TouchableOpacity
                onPress={() => setSelectedMedia(null)}
                className="p-3 rounded-full bg-red-500 mr-2 mb-2"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={async () => {
                  const media = await pickMedia();
                  setSelectedMedia(media);
                }}
                className="p-3 rounded-full mr-2 mb-2"
                style={{ backgroundColor: colors.gray200 }}
              >
                <Ionicons name="image-outline" size={24} color={colors.grayText} />
              </TouchableOpacity>
            )}
            <View className="flex-1 mr-3">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor={colors.grayText}
                className="rounded-full px-4 py-3 text-base"
                style={{ borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.inputBackground, borderWidth: 1 }}
                multiline
                maxLength={500}
                editable={!sending}
                textAlignVertical="top"
                autoCapitalize="sentences"
                // style={{ minHeight: 48, maxHeight: 120, borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.inputBackground, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999 }}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={(!newMessage.trim() && !selectedMedia) || sending}
              className={`p-3 rounded-full ${(!newMessage.trim() && !selectedMedia) || sending ? "bg-gray-300" : "bg-blue-500"}`}
              style={{ marginBottom: 2, backgroundColor: ((!newMessage.trim() && !selectedMedia) || sending) ? colors.gray200 : colors.blue500 }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={
                    (!newMessage.trim() && !selectedMedia) ? colors.grayText : "white"
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {selectedMessage && anchorMeasurements && (
        <Modal
          transparent={true}
          visible={!!selectedMessage}
          onRequestClose={() => setSelectedMessage(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedMessage(null)}>
            <View className="flex-1"> {/* Simplified this View */}
              <View
                style={{
                  position: "absolute",
                  top: anchorMeasurements.pageY - 60,
                  left: 0, // Span full width
                  right: 0, // Span full width
                  alignItems: "center", // Center content horizontally
                }}
              >
                <View className="flex-row rounded-full p-2 shadow-lg border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                  {MOCK_EMOJIS.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleReaction(emoji)}
                      className="px-3 py-2"
                    >
                      <Text className="text-3xl">{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}
