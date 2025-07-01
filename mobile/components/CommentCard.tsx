import { Comment } from "@/types";
import { formatDate } from "@/utils/formatters";
import { View, Text, Image } from "react-native";

interface CommentCardProps {
  comment: Comment;
}

const CommentCard = ({ comment }: CommentCardProps) => {
  return (
    <View className="flex-row items-start space-x-3 mb-4">
      <Image
        source={{ uri: comment.user.profilePicture }}
        className="size-10 rounded-full"
      />
      <View className="flex-1">
        <View className="bg-gray-100 rounded-2xl p-3">
          <Text className="font-semibold text-gray-800 mb-1">
            {comment.user.firstName} {comment.user.lastName}
          </Text>
          <Text className="text-gray-700 leading-5">{comment.content}</Text>
        </View>
        <View className="flex-row items-center space-x-3 mt-1 px-3">
          <Text className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </Text>
          <Text className="text-xs text-gray-600 font-semibold">Like</Text>
          <Text className="text-xs text-gray-600 font-semibold">Reply</Text>
        </View>
      </View>
    </View>
  );
};

export default CommentCard;