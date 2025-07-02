import type { Comment } from "@/types"
import { formatDate } from "@/utils/formatters"
import { Feather } from "@expo/vector-icons"
import { View, Text, Image, TouchableOpacity } from "react-native"

interface CommentCardProps {
  comment: Comment
}

const CommentCard = ({ comment }: CommentCardProps) => {
  return (
    <View className="flex-row items-start space-x-3 mb-6">
      <Image source={{ uri: comment.user.profilePicture }} className="w-10 h-10 rounded-full" />
      <View className="flex-1">
        <View className="bg-white rounded-2xl px-4 py-3 shadow-sm">
          <View className="flex-row items-center space-x-2 mb-1">
            <Text className="font-semibold text-gray-900 text-sm">
              {comment.user.firstName} {comment.user.lastName}
            </Text>
            <Text className="text-gray-500 text-xs">@{comment.user.username}</Text>
          </View>
          <Text className="text-gray-800 text-base leading-5">{comment.content}</Text>
        </View>

        <View className="flex-row items-center space-x-6 mt-2 px-4">
          <Text className="text-xs text-gray-500">{formatDate(comment.createdAt)}</Text>
          <TouchableOpacity className="flex-row items-center space-x-1">
            <Feather name="heart" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 font-medium">Like</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-xs text-gray-500 font-medium">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default CommentCard
