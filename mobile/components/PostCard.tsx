// mobile/components/PostCard.tsx
import type { Post, User, Reaction } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { router } from "expo-router";
import { Trash } from "lucide-react-native";
import { View, Text, Alert, Image, TouchableOpacity, View as RNView, Pressable } from "react-native";
import CommentIcon from "../assets/icons/Comment";
import ShareIcon from "../assets/icons/ShareIcon";
import { useRef, useState } from "react";
import PostReactionsPicker, { postReactions } from "./PostReactionsPicker";
import * as Haptics from 'expo-haptics';
import LikeIcon from "../assets/icons/LikeIcon"; // Import the new custom icon

interface PostCardProps {
  post: Post;
  reactToPost: (args: { postId: string; reactionType: string }) => void;
  onDelete: (postId: string) => void;
  onComment: (postId: string) => void;
  currentUser: User;
  currentUserReaction: Reaction | null;
}

const reactionEmojiMap: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

const reactionTextColor: Record<string, string> = {
  like: "text-blue-500",
  love: "text-red-500",
  haha: "text-yellow-500",
  wow: "text-yellow-500",
  sad: "text-yellow-500",
  angry: "text-red-600",
};

const PostCard = ({ currentUser, onDelete, reactToPost, post, onComment, currentUserReaction }: PostCardProps) => {
  const isOwnPost = post.user._id === currentUser._id;
  const likeButtonRef = useRef<RNView>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState(null);

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(post._id) },
    ]);
  };

  const handleQuickPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newReaction = currentUserReaction?.type === 'like' ? null : 'like';
    reactToPost({ postId: post._id, reactionType: newReaction || 'like' });
  }

  const handleLongPress = () => {
    likeButtonRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
      // @ts-ignore
      setAnchorMeasurements({ pageX, pageY });
      setPickerVisible(true);
    });
  };

  const handleReactionSelect = (reactionType: string) => {
    reactToPost({ postId: post._id, reactionType });
    setPickerVisible(false);
  };
  
  const getTopReactions = (reactions: Reaction[], max = 3) => {
    const counts: Record<string, number> = {};
    reactions.forEach(r => {
        counts[r.type] = (counts[r.type] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, max)
      .map(([type]) => reactionEmojiMap[type]);
  }

  const topReactions = getTopReactions(post.reactions);

  const ReactionButton = () => {
    if (currentUserReaction) {
      const reactionType = currentUserReaction.type;
      const emoji = reactionEmojiMap[reactionType];
      const text = reactionType.charAt(0).toUpperCase() + reactionType.slice(1);
      const colorClass = reactionTextColor[reactionType] || 'text-gray-500';

      if (reactionType === 'like') {
        return (
          <View className="flex-row items-center">
            <LikeIcon size={22} color="#1877F2" />
            <Text className={`font-semibold capitalize ml-1.5 ${colorClass}`}>
              {text}
            </Text>
          </View>
        );
      }
      
      return (
        <View className="flex-row items-center">
          <Text className="text-xl">{emoji}</Text>
          <Text className={`font-semibold capitalize ml-1.5 ${colorClass}`}>
            {text}
          </Text>
        </View>
      );
    }
    
    return (
      <View className="flex-row items-center">
        <LikeIcon size={22} color="#657786" />
        <Text className="text-gray-500 font-semibold ml-1.5">Like</Text>
      </View>
    );
  };

  return (
    <>
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
        
        {/* Reactions and Comments Count */}
        {(post.reactions.length > 0 || post.comments.length > 0) && (
          <View className="flex-row justify-between items-center px-4 pt-3 pb-1">
            {/* Left side: Reactions */}
            {post.reactions.length > 0 ? (
              <View className="flex-row items-center">
                <View className="flex-row">
                  {topReactions.map((emoji, index) => (
                    <Text key={index} className="text-lg" style={{ transform: [{translateX: -index * 4}]}}>{emoji}</Text>
                  ))}
                </View>
                <Text className="text-gray-500 text-base ml-2">{formatNumber(post.reactions.length)}</Text>
              </View>
            ) : (
                <View /> 
            )}

            {/* Right side: Comments Count */}
            {post.comments.length > 0 && (
              <Text className="text-gray-500 text-base">
                {formatNumber(post.comments.length)} {post.comments.length === 1 ? 'comment' : 'comments'}
              </Text>
            )}
          </View>
        )}

        {/* Post Actions */}
        <View className="flex-row justify-around py-1 border-t border-gray-100 mt-2">
          <Pressable
            ref={likeButtonRef}
            onPress={handleQuickPress}
            onLongPress={handleLongPress}
            className="flex-1 items-center py-2.5"
          >
            <ReactionButton />
          </Pressable>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2.5" onPress={() => onComment(post._id)}>
            <CommentIcon size={22} color="#657786" />
            <Text className="text-gray-500 font-semibold ml-1.5">Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2.5">
            <ShareIcon size={22} color="#657786" />
            <Text className="text-gray-500 font-semibold ml-1.5">Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        anchorMeasurements={anchorMeasurements}
      />
    </>
  );
};

export default PostCard;