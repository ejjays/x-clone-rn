// mobile/components/CommentCard.tsx
import type { Comment, User } from "@/types"
import { formatDate } from "@/utils/formatters"
import { View, Text, Image, TouchableOpacity } from "react-native"

interface CommentCardProps {
  comment: Comment
  currentUser: User | undefined
  onLike: (commentId: string) => void
}

const CommentCard = ({ comment, currentUser, onLike }: CommentCardProps) => {
  const isLiked = currentUser ? comment.likes.includes(currentUser._id) : false

  return (
    // Added horizontal padding to the root view
    <View className="flex-row items-start space-x-3 mb-4 px-4">
      <Image
        source={{ uri: comment.user.profilePicture || `https://ui-avatars.com/api/?name=${comment.user.firstName}` }}
        className="w-10 h-10 rounded-full"
      />
      <View className="flex-1">
        {/* Added a little more vertical padding (py-3) */}
        <View className="bg-gray-100 rounded-2xl px-4 py-3">
          <Text className="font-semibold text-gray-900 text-base leading-tight">
            {comment.user.firstName} {comment.user.lastName}
          </Text>
          {/* I have removed the @username text from here */}
          <Text className="text-gray-800 text-base leading-6 mt-1">{comment.content}</Text>
        </View>

        {/* Increased spacing between action items with space-x-5 */}
        <View className="flex-row items-center space-x-5 mt-2 px-3">
          <Text className="text-xs text-gray-500">{formatDate(comment.createdAt)}</Text>
          <TouchableOpacity onPress={() => onLike(comment._id)}>
            <Text className={`font-bold text-xs ${isLiked ? "text-blue-500" : "text-gray-600"}`}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Reply to comment:", comment._id)}>
            <Text className="font-bold text-xs text-gray-600">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default CommentCard