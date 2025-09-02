// mobile/components/chat/ChatHeader.tsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface ChatHeaderProps {
  colors: any;
  otherUser: { name?: string; image?: string; online?: boolean; id?: string } | null;
  channelId?: string;
}

export default function ChatHeader({ colors, otherUser, channelId }: ChatHeaderProps) {
  return (
    <View className="flex-row items-center p-4 border-b bg-white" style={{ borderBottomColor: colors.border, backgroundColor: colors.background }}>
      <TouchableOpacity onPressIn={() => router.back()} className="mr-3">
        <Ionicons name="arrow-back" size={24} color={colors.grayText} />
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
        <Text className="font-semibold text-xl" numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.text }}>
          {otherUser?.name || "Chat"}
        </Text>
        {otherUser && (
          <Text className="text-sm" style={{ color: colors.grayText }}>
            {otherUser.online ? "Online" : "Offline"}
          </Text>
        )}
      </View>
      <TouchableOpacity className="p-2" onPress={() => channelId && router.push({ pathname: `/call/${channelId}`, params: otherUser?.id ? { other: otherUser.id } : {} })}>
        <Ionicons name="call-outline" size={24} color={colors.grayText} />
      </TouchableOpacity>
      <TouchableOpacity className="p-2 ml-2" onPress={() => channelId && router.push({ pathname: `/call/${channelId}`, params: otherUser?.id ? { other: otherUser.id } : {} })}>
        <Ionicons name="videocam-outline" size={24} color={colors.grayText} />
      </TouchableOpacity>
    </View>
  );
}