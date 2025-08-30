import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStreamChat } from "../context/StreamChatContext";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { formatDistanceToNow } from "date-fns";

interface ChatScreenProps {
  channelId: string;
  onBack: () => void;
}

export default function ChatScreen({ channelId, onBack }: ChatScreenProps) {
  const { client } = useStreamChat();
  const { user: currentUser } = useCurrentUser();
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);

  useEffect(() => {
    if (!client || !currentUser) return;

    const initializeChannel = async () => {
      try {
        const ch = client.channel("messaging", channelId);
        await ch.watch();
        setChannel(ch);

        // Get other user info
        const members = Object.values(ch.state.members);
        const otherMember = members.find(
          (member: any) => member.user.id !== currentUser.id
        );
        if (otherMember) {
          setOtherUser(otherMember.user);
        }

        // Get messages
        const messagesArray = Object.values(ch.state.messages);
        setMessages(messagesArray.reverse());

        // Listen for new messages
        ch.on("message.new", (event: any) => {
          setMessages((prev) => [event.message, ...prev]);
        });
      } catch (error) {
        console.error("❌ Error initializing channel:", error);
      }
    };

    initializeChannel();
  }, [client, channelId, currentUser]);

  const sendMessage = async () => {
    if (!channel || !newMessage.trim()) return;

    try {
      await channel.sendMessage({
        text: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  const renderMessage = ({ item: message }: { item: any }) => {
    const isFromCurrentUser = message.user?.id === currentUser?.id;

    return (
      <View
        className={`flex-row mb-4 ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
      >
        {!isFromCurrentUser && (
          <Image
            source={{
              uri:
                message.user?.image ||
                `https://getstream.io/random_png/?name=${message.user?.name}`,
            }}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}

        <View
          className={`max-w-[70%] p-3 rounded-2xl ${
            isFromCurrentUser
              ? "bg-blue-500 rounded-br-md"
              : "bg-gray-200 rounded-bl-md"
          }`}
        >
          <Text
            className={`text-base ${isFromCurrentUser ? "text-white" : "text-gray-900"}`}
          >
            {message.text}
          </Text>
          <Text
            className={`text-xs mt-1 ${isFromCurrentUser ? "text-blue-100" : "text-gray-500"}`}
          >
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
            })}
          </Text>
        </View>

        {isFromCurrentUser && (
          <Image
            source={{
              uri:
                currentUser.imageUrl ||
                `https://getstream.io/random_png/?name=${currentUser.firstName}`,
            }}
            className="w-8 h-8 rounded-full ml-2"
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        {otherUser && (
          <>
            <Image
              source={{
                uri:
                  otherUser.image ||
                  `https://getstream.io/random_png/?name=${otherUser.name}`,
              }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 text-lg">
                {otherUser.name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {otherUser.online ? "Online" : "Offline"}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4 pt-4"
          inverted
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input */}
        <View className="flex-row items-center p-4 border-t border-gray-200">
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-3"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full ${newMessage.trim() ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Ionicons
              name="send"
              size={20}
              color={newMessage.trim() ? "white" : "gray"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
