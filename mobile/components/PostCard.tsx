import type { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { Heart, Share2, Trash } from "lucide-react-native";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import CommentIcon from "../assets/icons/Comment"; 

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  isLiked?: boolean;
  currentUser: User;
}

const PostCard = ({ currentUser, onDelete, onLike, post, isLiked, onComment }: PostCardProps) => {
  const isOwnPost = post.user._id === currentUser._id;

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(post._id),
      },
    ]);
  };

  return (
    <View className="bg-white">
      {/* Post Header */}
      <View className="flex-row p-4 items-center">
        <Image source={{ uri: post.user.profilePicture || "" }} className="w-12 h-12 rounded-full mr-3" />
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-base">
            {post.user.firstName} {post.user.lastName}
          </Text>
          <Text className="text-gray-500 text-sm">{formatDate(post.createdAt)}</Text>
        </View>
        {isOwnPost && (
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Trash size={20} color="#657786" />
          </TouchableOpacity>
        )}
      </View>

      {/* Post Content */}
      {post.content && <Text className="text-gray-900 text-base leading-5 px-4 mb-3">{post.content}</Text>}

      {/* Post Image */}
      {post.image && <Image source={{ uri: post.image }} className="w-full h-72" resizeMode="cover" />}

      {/* Post Actions */}
      <View className="flex-row justify-around py-2 border-t border-gray-100 mt-2">
        <TouchableOpacity className="flex-row items-center space-x-2" onPress={() => onLike(post._id)}>
          <Heart size={22} color={isLiked ? "#E0245E" : "#657786"} fill={isLiked ? "#E0245E" : "none"} />
          <Text className={`font-medium ml-1 ${isLiked ? "text-red-500" : "text-gray-500"}`}>
            {formatNumber(post.likes?.length || 0)} Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center space-x-2" onPress={() => onComment(post)}>
          {/* Use the new custom CommentIcon component */}
          <CommentIcon size={22} color="#657786" />
          <Text className="text-gray-500 font-medium ml-1">{formatNumber(post.comments?.length || 0)} Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center space-x-2">
          <Share2 size={22} color="#657786" />
          <Text className="text-gray-500 font-medium ml-1">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;