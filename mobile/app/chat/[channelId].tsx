// mobile/app/chat/[channelId].tsx
import ReactionsPicker from "@/components/ReactionsPicker";
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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { Layout } from "react-native-reanimated";

export default function ChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const { client, isConnected, isConnecting } = useStreamChat();
  const { currentUser } = useCurrentUser();
  const insets = useSafeAreaInsets();

  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{ pageX: number; pageY: number; width: number } | null>(null);
  const messageRefs = useRef<{ [key: string]: View | null }>({});

  useEffect(() => {
    if (!client || !isConnected || !channelId || !currentUser) {
      setLoading(false);
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

        setLoading(false);

        return () => {
          ch.off("message.new", handleEvent);
          ch.off("message.updated", handleEvent);
          ch.off("message.deleted", handleEvent);
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
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height + 20),
    )
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0))
    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [])

  const sendMessage = async () => {
    if (!channel || !newMessage.trim() || sending) return
    setSending(true)
    try {
      await channel.sendMessage({ text: newMessage.trim() })
      setNewMessage("")
    } catch (error) {
      console.error("❌ Error sending message:", error)
      Alert.alert("Error", "Failed to send message.")
    } finally {
      setSending(false)
    }
  }

  // --- REACTION LOGIC FIX ---
  // This function now handles both adding and removing reactions with an optimistic update.
  const handleReaction = async (reactionType: string) => {
    if (!channel || !selectedMessage) return;

    const existingReaction = selectedMessage.latest_reactions?.find(
      (r: any) => r.type === reactionType && r.user_id === currentUser.clerkId
    );

    // Optimistic UI update
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id !== selectedMessage.id) return msg;

        let newReactions = [...(msg.latest_reactions || [])];

        if (existingReaction) {
          // Remove the reaction
          newReactions = newReactions.filter(
            (r) => !(r.type === reactionType && r.user_id === currentUser.clerkId)
          );
        } else {
          // Add the new reaction
          newReactions.push({ type: reactionType, user_id: currentUser.clerkId });
        }
        return { ...msg, latest_reactions: newReactions };
      })
    );
    
    setSelectedMessage(null); // Hide picker immediately

    try {
      if (existingReaction) {
        // If it existed, send a delete request to the server
        await channel.deleteReaction(selectedMessage.id, existingReaction.type);
      } else {
        // Otherwise, send a new reaction request
        await channel.sendReaction(selectedMessage.id, { type: reactionType });
      }
    } catch (error) {
      console.error("❌ Failed to send/delete reaction:", error);
      Alert.alert("Error", "Could not update reaction.");
      // Note: You could add logic here to revert the optimistic UI update on error
    }
  };

  const handleLongPress = (message: any) => {
    const ref = messageRefs.current[message.id]
    if (ref) {
      ref.measure((_x, _y, width, height, pageX, pageY) => {
        setAnchorMeasurements({ pageX, pageY, width })
        setSelectedMessage(message)
      })
    }
  }

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) return `TODAY AT ${format(date, "h:mm a").toUpperCase()}`
    if (isYesterday(date)) return `YESTERDAY AT ${format(date, "d MMM 'AT' h:mm a").toUpperCase()}`
    return format(date, "d MMM yyyy 'AT' h:mm a").toUpperCase()
  }

  const shouldShowTimestamp = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true
    const timeDiff = new Date(currentMessage.created_at).getTime() - new Date(previousMessage.created_at).getTime()
    return timeDiff > 30 * 60 * 1000
  }

  const renderMessage = ({ item: message, index }: { item: any; index: number }) => {
    const isFromCurrentUser = message.user?.id === currentUser?.clerkId;
    const hasReactions = message.latest_reactions && message.latest_reactions.length > 0;

    const messageAbove = index < messages.length - 1 ? messages[index + 1] : null;
    const messageBelow = index > 0 ? messages[index - 1] : null;

    const showTimestamp = shouldShowTimestamp(message, messageAbove)
    const isFirstInGroup = showTimestamp || !messageAbove || messageAbove.user?.id !== message.user.id
    const isLastInGroup = !messageBelow || messageBelow.user?.id !== message.user.id || shouldShowTimestamp(messageBelow, message)
    const showAvatar = isLastInGroup

    const getBubbleStyle = () => {
      let style = "rounded-3xl"
      if (isFirstInGroup && isLastInGroup) return style
      if (isFromCurrentUser) {
        if (isFirstInGroup) style += " rounded-br-lg"
        else if (isLastInGroup) style += " rounded-tr-lg"
        else style += " rounded-tr-lg rounded-br-lg"
      } else {
        if (isFirstInGroup) style += " rounded-bl-lg"
        else if (isLastInGroup) style += " rounded-tl-lg"
        else style += " rounded-tl-lg rounded-bl-lg"
      }
      return style
    }

    const ReactionComponent = () => {
      if (!hasReactions) return null

      const emojiMap: { [key: string]: string } = { love: "❤️", haha: "😂", wow: "😮", kissing_heart: "😘", enraged: "😡", thumbsup: "👍" }
      const reactionEmojis = message.latest_reactions.map((r: any) => emojiMap[r.type]).filter(Boolean)
      const uniqueEmojis = [...new Set(reactionEmojis)];

      if (!uniqueEmojis.length) return null
      
      return (
        <View className="absolute -bottom-2.5 -right-2 bg-white rounded-full p-0.5 shadow flex-row">
           {uniqueEmojis.slice(0, 3).map((emoji, idx) => (
             <Text key={idx} className="text-sm" style={{ transform: [{ translateX: -idx * 4 }] }}>{emoji}</Text>
           ))}
        </View>
      )
    }

    return (
      <Animated.View layout={Layout.duration(200)}>
        {showTimestamp && (
          <View className="items-center my-6">
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-gray-500 text-xs font-medium tracking-wide">
                {formatMessageTime(new Date(message.created_at))}
              </Text>
            </View>
          </View>
        )}

        <View className={`flex-row items-end ${isLastInGroup ? "mb-2" : "mb-0.5"}`}>
          <View className={`flex-1 flex-row items-end ${isFromCurrentUser ? "justify-end pr-1" : "justify-start pl-1"}`}>
            {!isFromCurrentUser && (
              <View className="mr-2" style={{ width: 32 }}>
                {showAvatar && otherUser?.image && <Image source={{ uri: otherUser.image }} className="w-8 h-8 rounded-full" />}
              </View>
            )}

            <View
              className={`max-w-[80%] ${hasReactions ? "pb-4" : ""}`}
              ref={(el) => (messageRefs.current[message.id] = el)}
            >
              <TouchableOpacity onLongPress={() => handleLongPress(message)} delayLongPress={200} activeOpacity={0.8}>
                <View
                  className={`px-4 py-2.5 ${getBubbleStyle()} ${
                    isFromCurrentUser ? "bg-blue-500 shadow-sm" : "bg-gray-200"
                  }`}
                >
                  <Text className={`text-lg leading-6 ${isFromCurrentUser ? "text-white" : "text-gray-900"}`}>
                    {message.text}
                  </Text>
                </View>
                <ReactionComponent />
              </TouchableOpacity>
            </View>

            {isFromCurrentUser && <View style={{ width: 8 }} />}
          </View>
        </View>
      </Animated.View>
    )
  }

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
    );
  }

  if (!client || !isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">Connection Issue</Text>
          <Text className="text-gray-500 text-center">
            Unable to connect to chat service. Please check your internet connection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        {otherUser?.image && (
          <View className="relative mr-3">
            <Image source={{ uri: otherUser.image }} className="w-12 h-12 rounded-full" />
            {otherUser.online && (
              <View className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </View>
        )}
        <View className="flex-1 min-w-0">
          <Text className="font-semibold text-gray-900 text-xl" numberOfLines={1} ellipsizeMode="tail">
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
            className="flex-1 bg-white px-2"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: keyboardHeight > 0 ? 20 : 16 }}
            inverted
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => {
              Keyboard.dismiss()
              setSelectedMessage(null)
            }}
          />

          {/* Message Input */}
          <View
            className="flex-row items-end border-t border-gray-200 bg-white px-4"
            style={{
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 16),
              marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
            }}
          >
            <View className="flex-1 mr-3">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-full px-4 py-3 text-base text-gray-900 bg-gray-50"
                multiline
                maxLength={500}
                editable={!sending}
                textAlignVertical="top"
                style={{ minHeight: 48, maxHeight: 120 }}
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

      <ReactionsPicker
        isVisible={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onSelect={handleReaction}
        anchorMeasurements={anchorMeasurements}
      />
    </View>
  )
}