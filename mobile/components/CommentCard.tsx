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
      {/* FIX: A left margin 'ml-3' creates a guaranteed space from the profile picture. */}
      <View className="flex-1 ml-3">

        {/* The gray comment bubble with slightly more padding */}
        <View className="bg-gray-100 rounded-2xl px-3.5 py-2.5">
          {/* FIX: Name is now bold and text-sm (14px) */}
          <Text className="font-bold text-sm text-gray-900">
            {comment.user.firstName} {comment.user.lastName}
          </Text>
          {/* FIX: Comment text is now larger (15px) with better line height */}
          <Text className="text-[15px] text-gray-900 leading-[22px] mt-1">{comment.content}</Text>
        </View>

        {/* The action buttons below the bubble */}
        {/* FIX: Using specific margins 'ml-4' on each button to FORCE the spacing. */}
        <View className="flex-row items-center mt-1.5 px-3">
          <Text className="text-sm font-semibold text-gray-600">{formatDate(comment.createdAt)}</Text>
          
          <TouchableOpacity onPress={() => onLike(comment._id)} className="ml-4">
            <Text className={`font-semibold text-sm ${isLiked ? "text-blue-500" : "text-gray-600"}`}>Like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => console.log("Reply to comment:", comment._id)} className="ml-4">
            <Text className="font-semibold text-sm text-gray-600">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CommentCard;