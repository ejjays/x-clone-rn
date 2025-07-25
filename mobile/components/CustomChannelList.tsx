import { useStreamChat } from "@/context/StreamChatContext"
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomChannelListProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  searchQuery?: string;
}

interface ChannelMember {
  user?: {
    id: string;
    name?: string;
    image?: string;
    online?: boolean;
  };
}

interface StreamMessage {
  user?: {
    id: string;
  };
  text?: string;
}

interface ChannelState {
  members: { [key: string]: ChannelMember } | ChannelMember[];
  messages: StreamMessage[];
  last_message_at?: string;
}

interface Channel {
  id: string;
  state: ChannelState;
}

export default function CustomChannelList({
  onRefresh,
  refreshing = false,
  searchQuery = "",
}: CustomChannelListProps) {
  const { channels, isConnecting } = useStreamChat();
  const { currentUser } = useCurrentUser();
  const [processedChannels, setProcessedChannels] = useState<any[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<any[]>([]);

  useEffect(() => {
    if (!channels || !currentUser) return;

    const processed = channels.map((channel: Channel) => {
      const membersArray = Array.isArray(channel.state.members)
        ? channel.state.members
        : Object.values(channel.state.members || {});

      const otherMember = membersArray.find(
        (member: ChannelMember) => member?.user?.id !== currentUser.clerkId
      );

      const messagesArray = Array.isArray(channel.state.messages)
        ? channel.state.messages
        : Object.values(channel.state.messages || {});

      const lastMessage = messagesArray[messagesArray.length - 1];

      return {
        id: channel.id,
        name: otherMember?.user?.name || "Unknown User",
        image:
          otherMember?.user?.image ||
          `https://getstream.io/random_png/?name=${
            otherMember?.user?.name || "user"
          }`,
        lastMessage: lastMessage?.text || "No messages yet",
        lastMessageTime: channel.state.last_message_at
          ? formatDistanceToNow(new Date(channel.state.last_message_at), {
              addSuffix: true,
            })
          : "",
        isFromCurrentUser: lastMessage?.user?.id === currentUser.clerkId,
        online: otherMember?.user?.online || false,
      };
    });

    setProcessedChannels(processed);
  }, [channels, currentUser]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChannels(processedChannels);
    } else {
      const filtered = processedChannels.filter((channel) => {
        const nameMatch = channel.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const messageMatch = channel.lastMessage
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return nameMatch || messageMatch;
      });
      setFilteredChannels(filtered);
    }
  }, [processedChannels, searchQuery]);

  const renderChannelItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View className="relative mr-4">
        <Image
          source={{ uri: item.image }}
          className="w-16 h-16 rounded-full"
        />
        {item.online && (
          <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      <View className="flex-1 min-w-0 mr-2">
        {/* --- ⬆️ TEXT SIZE INCREASED HERE --- */}
        <Text
          className="font-semibold text-gray-900 text-lg mb-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        {/* --- ⬆️ TEXT SIZE INCREASED HERE --- */}
        <Text className="text-gray-500 text-base" numberOfLines={1}>
          {item.isFromCurrentUser ? "You: " : ""}
          {item.lastMessage}
        </Text>
      </View>

      <View className="flex-shrink-0">
        {item.lastMessageTime && (
          <Text className="text-gray-400 text-xs">{item.lastMessageTime}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isConnecting && channels.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading conversations...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredChannels}
      keyExtractor={(item) => item.id}
      renderItem={renderChannelItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2563EB"
          colors={["#2563EB"]}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No conversations yet.</Text>
        </View>
      }
    />
  );
}