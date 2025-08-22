// mobile/components/chat/MessageBubble.tsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import { REACTION_TO_EMOJI, formatMessageTime } from "@/utils/chatFormat";

interface MessageBubbleProps {
  message: any;
  index: number;
  messages: any[];
  currentUserId?: string;
  colors: any;
  otherUser: any;
  onLongPress: (message: any) => void;
}

export default function MessageBubble({ message, index, messages, currentUserId, colors, otherUser, onLongPress }: MessageBubbleProps) {
  const isFromCurrentUser = message.user?.id === currentUserId;
  const attachment = message.attachments?.[0];
  const quoted = message.quoted_message;

  const messageAbove = index < messages.length - 1 ? messages[index + 1] : null;
  const messageBelow = index > 0 ? messages[index - 1] : null;

  const shouldShowTimestamp = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    const timeDiff =
      new Date(currentMessage.created_at).getTime() -
      new Date(previousMessage.created_at).getTime();
    return timeDiff > 30 * 60 * 1000;
  };

  const showTimestamp = shouldShowTimestamp(message, messageAbove);
  const isFirstInGroup = showTimestamp || !messageAbove || messageAbove.user?.id !== message.user.id;
  const isLastInGroup = !messageBelow || messageBelow.user?.id !== message.user.id || shouldShowTimestamp(messageBelow, message);
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

  const hasReactions = (message.reaction_counts && Object.keys(message.reaction_counts).length > 0) || (message.latest_reactions && message.latest_reactions.length > 0);

  const ReactionComponent = () => {
    if (!hasReactions) return null;

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
      <View
        style={{
          position: "absolute",
          bottom: -4,
          right: isFromCurrentUser ? 6 : undefined,
          left: isFromCurrentUser ? undefined : 6,
          flexDirection: "row",
          backgroundColor: colors.background,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 999,
          zIndex: 1,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        {uniqueEmojis.slice(0, 3).map((emoji, idx) => (
          <Text key={`${emoji}-${idx}`} className="text-sm" style={{ marginLeft: idx === 0 ? 0 : 4 }}>
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

      <View className={`flex-row items-end ${isLastInGroup ? "mb-2" : "mb-0.5"}`}>
        <View className={`flex-1 flex-row items-end ${isFromCurrentUser ? "justify-end pr-1" : "justify-start pl-1"}`}>
          {!isFromCurrentUser && (
            <View className="mr-2" style={{ width: 32 }}>
              {showAvatar && otherUser?.image && (
                <Image source={{ uri: otherUser.image }} className="w-8 h-8 rounded-full" />
              )}
            </View>
          )}

          <View
            className={`max-w-[80%]`}
            style={{ overflow: "visible", position: "relative", paddingBottom: hasReactions ? 14 : 0 }}
          >
            <TouchableOpacity onLongPress={() => onLongPress(message)} delayLongPress={200} activeOpacity={0.8}>
              <View
                className={`px-4 py-2.5 ${getBubbleStyle()} ${isFromCurrentUser ? "shadow-sm" : ""}`}
                style={{ backgroundColor: isFromCurrentUser ? colors.blue500 : colors.gray200, overflow: "visible" }}
              >
                {quoted && (
                  <View
                    className="mb-2 px-3 py-2 rounded-xl border"
                    style={{
                      backgroundColor: isFromCurrentUser ? "rgba(255,255,255,0.12)" : colors.cardBackground,
                      borderColor: colors.border,
                    }}
                  >
                    <Text className="text-xs mb-1 font-semibold" style={{ color: isFromCurrentUser ? "#E5E7EB" : colors.grayText }} numberOfLines={1}>
                      {quoted.user?.name || "User"}
                    </Text>
                    <Text className="text-xs" style={{ color: isFromCurrentUser ? "#F3F4F6" : colors.text }} numberOfLines={2}>
                      {quoted.attachments?.[0]
                        ? quoted.attachments?.[0].type === "image"
                          ? "Photo"
                          : quoted.attachments?.[0].type === "video"
                          ? "Video"
                          : "Attachment"
                        : quoted.text || ""}
                    </Text>
                  </View>
                )}

                {attachment && attachment.type === "image" && (
                  <Image
                    source={{ uri: attachment.asset_url || attachment.thumb_url }}
                    className="w-48 h-48 rounded-lg mb-2"
                  />
                )}

                {message.text && (
                  <Text className={`text-lg leading-6`} style={{ color: isFromCurrentUser ? "white" : colors.text }}>
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
}