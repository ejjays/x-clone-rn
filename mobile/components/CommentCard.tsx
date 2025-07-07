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
    // The main container for a single comment, with horizontal padding
    <View className="flex-row items-start px-4 mb-4">
      {/* Profile picture */}
      <Image
        source={{ uri: comment.user.profilePicture || `https://ui-avatars.com/api/?name=${comment.user.firstName}` }}
        className="w-10 h-10 rounded-full"
      />

      {/* This container holds the comment bubble and the actions below it */}
      {/* FIX: Added a left margin 'ml-3' to create space from the profile picture */}
      <View className="flex-1 ml-3">
        {/* The gray comment bubble */}
        <View className="bg-gray-100 rounded-2xl px-4 py-3">
          <Text className="font-semibold text-gray-900 text-base leading-tight">
            {comment.user.firstName} {comment.user.lastName}
          </Text>
          <Text className="text-gray-800 text-base leading-6 mt-1">{comment.content}</Text>
        </View>

        {/* The action buttons below the bubble */}
        {/* FIX: Added specific margins 'ml-5' to 'Like' and 'Reply' to force spacing */}
        <View className="flex-row items-center mt-2 px-3">
          <Text className="text-xs text-gray-500 font-semibold">{formatDate(comment.createdAt)}</Text>
          <TouchableOpacity onPress={() => onLike(comment._id)} className="ml-5">
            <Text className={`font-bold text-xs ${isLiked ? "text-blue-500" : "text-gray-600"}`}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Reply to comment:", comment._id)} className="ml-5">
            <Text className="font-bold text-xs text-gray-600">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CommentCard;