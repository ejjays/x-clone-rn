import type { Notification } from "@/types";
import {
  Bell,
  Heart,
  MessageCircle,
  MoreHorizontal,
  UserPlus,
} from "lucide-react-native";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

const NotificationCard = ({
  notification,
  onDelete,
}: NotificationCardProps) => {
  const { colors } = useTheme(); // Use useTheme hook

  const getNotificationText = () => {
    const name = `${notification.from.firstName} ${notification.from.lastName}`;
    switch (notification.type) {
      case "like":
        return (
          <Text className="text-base leading-6" style={{ color: colors.text }}>
            <Text className="font-semibold">{name}</Text>
            <Text> liked your post.</Text>
          </Text>
        );
      case "comment":
        return (
          <Text className="text-base leading-6" style={{ color: colors.text }}>
            <Text className="font-semibold">{name}</Text>
            <Text> commented on your post: "</Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {notification.comment?.content}
            </Text>
            <Text>"</Text>
          </Text>
        );
      case "follow":
        return (
          <Text className="text-base leading-6" style={{ color: colors.text }}>
            <Text className="font-semibold">{name}</Text>
            <Text> started following you.</Text>
          </Text>
        );
      default:
        return (
          <Text className="text-base leading-6" style={{ color: colors.text }}>
            New notification
          </Text>
        );
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return (
          <View
            className="  w-9 h-9 bg-red-500 rounded-full items-center justify-center border-2"
            style={{
              borderColor: colors.background,
              transform: [{ translateY: -20 }],
            }}
          >
            <Heart size={14} color="white" />
          </View>
        );
      case "comment":
        return (
          <View
            className="  w-9 h-9 bg-blue-500 rounded-full items-center justify-center border-2"
            style={{
              borderColor: colors.background,
              transform: [{ translateY: -20 }],
            }}
          >
            <MessageCircle size={14} color="white" />
          </View>
        );
      case "follow":
        return (
          <View
            className="  w-9 h-9 bg-green-500 rounded-full items-center justify-center border-2"
            style={{
              borderColor: colors.background,
              transform: [{ translateY: -20 }],
            }}
          >
            <UserPlus size={14} color="white" />
          </View>
        );
      default:
        return (
          <View
            className="  w-9 h-9 bg-gray-500 rounded-full items-center justify-center border-2"
            style={{
              borderColor: colors.background,
              transform: [{ translateY: -20 }],
            }}
          >
            <Bell size={14} color="white" />
          </View>
        );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => onDelete(notification._id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }
    if (diffInDays < 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <TouchableOpacity
      className="px-4 py-4"
      activeOpacity={0.7}
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row">
        {/* Profile Picture with Badge - Made Bigger */}
        <View
          className="relative mr-4"
          style={{
            overflow: "visible",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <Image
            source={
              notification.from.profilePicture
                ? { uri: notification.from.profilePicture }
                : require("../assets/images/default-avatar.png")
            }
            className="w-20 h-20 rounded-full"
          />
          {getNotificationIcon()}
        </View>

        {/* Content */}
        <View className="flex-1 mr-3">
          {getNotificationText()}

          {/* Post Preview (if applicable) */}
          {notification.post && (
            <View
              className="mt-3 p-3 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="text-sm"
                numberOfLines={2}
                style={{ color: colors.textSecondary }}
              >
                {notification.post.content}
              </Text>
              {notification.post && notification.post.image ? (
                <Image
                  source={{ uri: notification.post.image }}
                  className="w-full h-28 rounded-md mt-2"
                  resizeMode="cover"
                />
              ) : null}
            </View>
          )}

          {/* Timestamp with better formatting */}
          <Text
            className="text-sm mt-2"
            style={{ color: colors.textSecondary }}
          >
            {formatNotificationDate(notification.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;
