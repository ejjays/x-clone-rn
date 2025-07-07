// mobile/components/CommentCard.tsx
import type { Comment, User } from "@/types";
import { formatDate } from "@/utils/formatters";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface CommentCardProps {
  comment: Comment;
  currentUser: User | undefined;
  onLike: (commentId: string) => void;
}

const CommentCard = ({ comment, currentUser, onLike }: CommentCardProps) => {
  const isLiked = currentUser ? comment.likes.includes(currentUser._id) : false;

  return (
    // The main container for a single comment
    <View className="flex-row items-start px-4 mb-4">
      {/* Profile picture */}
      <Image
        source={{ uri: comment.user.profilePicture || `https://ui-avatars.com/api/?name=${comment.user.firstName}` }}
        className="w-10 h-10 rounded-full"
      />

      {/* This container holds the comment bubble and the actions below it */}
      <View className="flex-1 ml-3">
        {/* The gray comment bubble with slightly adjusted padding */}
        <View className="bg-gray-100 rounded-2xl px-3.5 py-2">
          {/* Commenter's Name: Made bold and sized to match FB */}
          <Text className="font-bold text-sm text-gray-800">
            {comment.user.firstName} {comment.user.lastName}
          </Text>
          {/* Comment Text: Increased size and line height for readability */}
          <Text className="text-[15px] text-black leading-[21px] mt-0.5">{comment.content}</Text>
        </View>

        {/* The action buttons below the bubble */}
        <View className="flex-row items-center mt-1.5 px-3 space-x-4">
          {/* Timestamp: Made larger and bolder */}
          <Text className="text-sm font-semibold text-gray-500">{formatDate(comment.createdAt)}</Text>
          {/* Like Button: Made larger and bolder */}
          <TouchableOpacity onPress={() => onLike(comment._id)}>
            <Text className={`font-semibold text-sm ${isLiked ? "text-blue-500" : "text-gray-600"}`}>Like</Text>
          </TouchableOpacity>
          {/* Reply Button: Made larger and bolder */}
          <TouchableOpacity onPress={() => console.log("Reply to comment:", comment._id)}>
            <Text className="font-semibold text-sm text-gray-600">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CommentCard;