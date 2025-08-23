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
import { pickMedia, uploadMediaToCloudinary } from "@/utils/mediaPicker";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import { LightThemeColors, DarkThemeColors } from "@/constants/Colors"; // Import both theme colors
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { useFocusEffect } from "@react-navigation/native";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageInput from "@/components/chat/MessageInput";
import ReactionPickerModal from "@/components/chat/ReactionPickerModal";

const MOCK_EMOJIS = ["👍", "❤️", "🔥", "🤣", "🥲", "😡"];

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const channelId = typeof params?.channelId === "string" ? (params.channelId as string) : undefined;
  const { client, isConnected, isConnecting } = useStreamChat();
  const { currentUser } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const colors = {
    background: isDarkMode ? DarkThemeColors.background : LightThemeColors.background,
    cardBackground: isDarkMode ? DarkThemeColors.surface : LightThemeColors.surface,
    text: isDarkMode ? DarkThemeColors.text : LightThemeColors.text,
    grayText: isDarkMode ? DarkThemeColors.textSecondary : LightThemeColors.textSecondary,
    border: isDarkMode ? DarkThemeColors.border : LightThemeColors.border,
    inputBackground: isDarkMode ? DarkThemeColors.surface : LightThemeColors.surface,
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
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: "image" | "video" } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [systemUIHeight, setSystemUIHeight] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [quotedMessage, setQuotedMessage] = useState<any | null>(null);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{ pageX: number; pageY: number; width: number } | null>(null);
  const messageRefs = useRef<{ [key: string]: View | null }>({});
  const inputRef = useRef<TextInput | null>(null);

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

        const membersArray = Array.isArray(ch.state.members) ? ch.state.members : Object.values(ch.state.members || {});
        const otherMember = membersArray.find((member: any) => member?.user?.id !== currentUser.clerkId);

        if (otherMember?.user) {
          setOtherUser({
            name: otherMember.user.name || "Unknown User",
            image: otherMember.user.image || `https://getstream.io/random_png/?name=${otherMember.user.name}`,
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
    try {
      const bottomInset = insets.bottom;
      setSystemUIHeight(bottomInset);
    } catch (e) {
      setSystemUIHeight(insets.bottom);
    }
  }, [insets.bottom]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      const extraPadding = Platform.OS === "android" ? systemUIHeight : 0;
      setKeyboardHeight(e.endCoordinates.height + extraPadding);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [systemUIHeight]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        // Ensure nav bar is not edge-to-edge while chatting, so background color is applied
        try {
          // Set position relative (content above nav bar) and prefer insets for swipe
          // Some devices ignore behavior; set both to maximize compatibility
          NavigationBar.setPositionAsync("relative");
          NavigationBar.setBehaviorAsync("inset-swipe");
        } catch {}
        NavigationBar.setBackgroundColorAsync("#ffffff");
        NavigationBar.setButtonStyleAsync("dark");
      }
      return () => {
        if (Platform.OS === "android") {
          try {
            // Restore edge-to-edge preference used app-wide
            NavigationBar.setPositionAsync("absolute");
            NavigationBar.setBehaviorAsync("overlay-swipe");
          } catch {}
          NavigationBar.setBackgroundColorAsync(isDarkMode ? "#000000" : "#ffffff");
          NavigationBar.setButtonStyleAsync(isDarkMode ? "light" : "dark");
        }
      };
    }, [isDarkMode])
  );

  const sendMessage = async () => {
    if (!channel || (!newMessage.trim() && !selectedMedia) || sending) return;

    setSending(true);
    try {
      let messageData: any = { text: newMessage.trim() };
      if (quotedMessage?.id) messageData.quoted_message_id = quotedMessage.id;

      if (selectedMedia) {
        const mediaUrl = await uploadMediaToCloudinary(selectedMedia);
        if (mediaUrl) {
          messageData.attachments = [{ type: selectedMedia.type, asset_url: mediaUrl, thumb_url: mediaUrl }];
        } else {
          Alert.alert("Upload Failed", "Could not upload your media. Message not sent.");
          setSending(false);
          return;
        }
      }

      if (!messageData.text && (!messageData.attachments || messageData.attachments.length === 0)) {
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
      setQuotedMessage(null);
      setSending(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      if (!channel || !selectedMessage) return;
      const reactionTypeMap: Record<string, string> = { "👍": "like", "❤️": "love", "🔥": "fire", "🤣": "haha", "🥲": "smile_tear", "😡": "angry" };
      const reactionType = reactionTypeMap[emoji];
      if (!reactionType) return;

      const ownReactions: any[] = Array.isArray(selectedMessage.own_reactions) ? selectedMessage.own_reactions : [];
      const hasSameType = ownReactions.some((r: any) => r.type === reactionType);

      if (hasSameType) {
        await channel.deleteReaction(selectedMessage.id, reactionType);
      } else {
        for (const r of ownReactions) {
          if (r?.type && r.type !== reactionType) {
            try { await channel.deleteReaction(selectedMessage.id, r.type); } catch {}
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
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
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
          <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: colors.text }}>Connection Issue</Text>
          <Text className="text-center" style={{ color: colors.grayText }}>Unable to connect to chat service. Please check your internet connection.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingBottom: 0 }} edges={['top']}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ChatHeader colors={colors} otherUser={otherUser} />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <View className="flex-1">
          <FlatList
            data={messages}
            renderItem={({ item, index }) => (
              <View ref={(el) => { if (el) { (messageRefs.current as any)[item.id] = el; } }}>
                <MessageBubble
                  message={item}
                  index={index}
                  messages={messages}
                  currentUserId={currentUser?.clerkId}
                  colors={colors}
                  otherUser={otherUser}
                  onLongPress={handleLongPress}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            className="flex-1 px-2"
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: keyboardHeight > 0 ? 16 : 80 + systemUIHeight }}
            inverted
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => { Keyboard.dismiss(); setSelectedMessage(null); }}
          />

          <MessageInput
            colors={colors}
            insetsBottom={insets.bottom}
            keyboardHeight={keyboardHeight}
            systemUIHeight={systemUIHeight}
            quotedMessage={quotedMessage}
            onCancelQuote={() => setQuotedMessage(null)}
            selectedMedia={selectedMedia}
            onClearMedia={() => setSelectedMedia(null)}
            onPickMedia={async () => { const media = await pickMedia(); setSelectedMedia(media); }}
            inputRef={inputRef}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sending={sending}
            onSend={sendMessage}
          />
        </View>
      </KeyboardAvoidingView>

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
