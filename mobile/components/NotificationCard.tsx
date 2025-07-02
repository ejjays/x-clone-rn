import type { Notification } from "@/types"
import { Feather } from "@expo/vector-icons"
import { View, Text, Alert, Image, TouchableOpacity } from "react-native"

interface NotificationCardProps {
  notification: Notification
  onDelete: (notificationId: string) => void
}

const NotificationCard = ({ notification, onDelete }: NotificationCardProps) => {
  const getNotificationText = () => {
    const name = `${notification.from.firstName} ${notification.from.lastName}`
    switch (notification.type) {
      case "like":
        return (
          <Text className="text-gray-900 text-base leading-6">
            <Text className="font-semibold">{name}</Text>
            <Text> liked your post.</Text>
          </Text>
        )
      case "comment":
        return (
          <Text className="text-gray-900 text-base leading-6">
            <Text className="font-semibold">{name}</Text>
            <Text> commented on your post: "</Text>
            <Text className="text-gray-600">{notification.comment?.content}</Text>
            <Text>"</Text>
          </Text>
        )
      case "follow":
        return (
          <Text className="text-gray-900 text-base leading-6">
            <Text className="font-semibold">{name}</Text>
            <Text> started following you.</Text>
          </Text>
        )
      default:
        return <Text className="text-gray-900 text-base leading-6">New notification</Text>
    }
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return (
          <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 rounded-full items-center justify-center border-2 border-white">
            <Feather name="heart" size={14} color="white" />
          </View>
        )
      case "comment":
        return (
          <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full items-center justify-center border-2 border-white">
            <Feather name="message-circle" size={14} color="white" />
          </View>
        )
      case "follow":
        return (
          <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full items-center justify-center border-2 border-white">
            <Feather name="user-plus" size={14} color="white" />
          </View>
        )
      default:
        return (
          <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-500 rounded-full items-center justify-center border-2 border-white">
            <Feather name="bell" size={14} color="white" />
          </View>
        )
    }
  }

  const handleDelete = () => {
    Alert.alert("Delete Notification", "Are you sure you want to delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(notification._id),
      },
    ])
  }

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    }
    if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    }
    if (diffInDays < 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <TouchableOpacity className="bg-white px-4 py-4" activeOpacity={0.7}>
      <View className="flex-row">
        {/* Profile Picture with Badge - Made Bigger */}
        <View className="relative mr-4">
          <Image source={{ uri: notification.from.profilePicture }} className="w-16 h-16 rounded-full" />
          {getNotificationIcon()}
        </View>

        {/* Content */}
        <View className="flex-1 mr-3">
          {getNotificationText()}

          {/* Post Preview (if applicable) */}
          {notification.post && (
            <View className="mt-3 p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700 text-sm" numberOfLines={2}>
                {notification.post.content}
              </Text>
              {notification.post.image && (
                <Image
                  source={{ uri: notification.post.image }}
                  className="w-full h-28 rounded-md mt-2"
                  resizeMode="cover"
                />
              )}
            </View>
          )}

          {/* Timestamp with better formatting */}
          <Text className="text-gray-500 text-sm mt-2">{formatNotificationDate(notification.createdAt)}</Text>
        </View>

        {/* More Options */}
        <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={handleDelete}>
          <Feather name="more-horizontal" size={22} color="#65676B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export default NotificationCard
