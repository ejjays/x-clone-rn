import type { User } from "@/types"
import { Feather } from "@expo/vector-icons"
import { View, Text, Image, TouchableOpacity, Alert } from "react-native"

interface UserCardProps {
  user: User
  onFollow?: (userId: string) => void
  onMessage?: (user: User) => void
  isFollowing?: boolean
}

const UserCard = ({ user, onFollow, onMessage, isFollowing }: UserCardProps) => {
  const handleFollow = () => {
    if (onFollow) {
      onFollow(user._id)
    }
  }

  const handleMessage = () => {
    if (onMessage) {
      onMessage(user)
    } else {
      Alert.alert("Message", `Start a conversation with ${user.firstName} ${user.lastName}`)
    }
  }

  const handleMoreOptions = () => {
    Alert.alert("Options", `More options for ${user.firstName} ${user.lastName}`, [
      { text: "View Profile", onPress: () => console.log("View profile") },
      { text: "Block User", style: "destructive", onPress: () => console.log("Block user") },
      { text: "Cancel", style: "cancel" },
    ])
  }

  // Fallback profile picture if user doesn't have one
  const profilePicture =
    user.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`

  return (
    <TouchableOpacity className="flex-row items-center p-4 bg-white" activeOpacity={0.7}>
      {/* Profile Picture */}
      <Image
        source={{ uri: profilePicture }}
        className="w-16 h-16 rounded-full mr-4"
        defaultSource={{
          uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`,
        }}
      />

      {/* User Info */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-gray-500 text-sm">@{user.username}</Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
          onPress={handleMessage}
        >
          <Feather name="message-circle" size={18} color="#1C1E21" />
        </TouchableOpacity>

        <TouchableOpacity className="w-8 h-8 items-center justify-center" onPress={handleMoreOptions}>
          <Feather name="more-horizontal" size={20} color="#65676B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export default UserCard
