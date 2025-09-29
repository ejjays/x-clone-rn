// mobile/components/chat/ChatHeader.tsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface ChatHeaderProps {
  colors: any;
  otherUser: { name?: string; image?: string; online?: boolean; id?: string } | null;
  channelId?: string;
  onBack?: () => void;
}

export default function ChatHeader({ colors, otherUser, channelId, onBack }: ChatHeaderProps) {
  return (
    <View className="flex-row items-center p-4 border-b bg-white" style={{ borderBottomColor: colors.border, backgroundColor: colors.background }}>
      <TouchableOpacity onPress={onBack || (() => router.back())} className="mr-3">
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text className="font-semibold text-xl" numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.text }}>
            {otherUser?.name || "Chat"}
          </Text>
          {/* We do not have verified flag here; if you pass it via params, enable below */}
          {/* {otherUser?.isVerified ? <VerifiedBadge style={{ marginLeft: 6 }} size={14} /> : null} */}
        </View>
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