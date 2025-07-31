// mobile/components/PostCard.tsx
import type { Post, User, Reaction, ReactionName } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  type View as RNView,
  Pressable,
  Dimensions,
} from "react-native";
import CommentIcon from "../assets/icons/Comment";
import ShareIcon from "../assets/icons/ShareIcon";
import { useRef, useState, useEffect, useCallback } from "react";
import PostReactionsPicker from "./PostReactionsPicker";
import * as Haptics from "expo-haptics";
import LikeIcon from "../assets/icons/LikeIcon";
import { Video, ResizeMode } from "expo-av";
import { reactionComponents, reactionTextColor } from "@/utils/reactions";
import { FontAwesome } from "@expo/vector-icons";

const getDynamicPostTextStyle = (content: string): string => {
  if (content.length <= 60) {
    return "text-2xl font-semibold";
  } else if (content.length > 60 && content.length <= 150) {
    return "text-xl font-semibold";
  } else {
    return "text-lg font-normal";
  }
};

interface PostCardProps {
  post: Post;
  reactToPost: (args: { postId: string; reactionType: string | null }) => void;
  onDelete: (postId: string) => void;
  onComment: (postId: string) => void;
  currentUser: User;
  currentUserReaction: Reaction | null;
  onOpenPostMenu: (post: Post) => void; 
}

const { width: screenWidth } = Dimensions.get("window");

const PostCard = ({
  currentUser,
  onDelete,
  reactToPost,
  post,
  onComment,
  currentUserReaction,
  onOpenPostMenu, 
}: PostCardProps) => {
  const isOwnPost = post.user._id === currentUser._id;
  const likeButtonRef = useRef<RNView>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{
    pageX: number;
    pageY: number;
  } | null>(null);

  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(true);

  useEffect(() => {
    if (post.image) {
      setIsMediaLoading(true);
      Image.getSize(
        post.image,
        (width, height) => {
          const calculatedHeight = Math.round((screenWidth / width) * height);
          setImageHeight(calculatedHeight);
          setIsMediaLoading(false);
        },
        (error) => {
          console.error(`Couldn't get image size for ${post.image}:`, error);
          setImageHeight(200);
          setIsMediaLoading(false);
        }
      );
    } else if (post.video) {
      setIsMediaLoading(true);
      setVideoHeight(Math.round(screenWidth * 0.5));
    } else {
      setImageHeight(null);
      setVideoHeight(null);
      setIsMediaLoading(false);
    }
  }, [post.image, post.video]);

  const handleVideoLoad = (playbackStatus: any) => {
    if (
      playbackStatus &&
      playbackStatus.isLoaded &&
      playbackStatus.naturalSize
    ) {
      const { width, height } = playbackStatus.naturalSize;
      const calculatedHeight = Math.round((screenWidth / width) * height);
      setVideoHeight(calculatedHeight);
    }
    setIsMediaLoading(false);
  };

  const handleVideoError = (error: any) => {
    console.error(`Video Error for post ${post._id} (${post.video}):`, error);
    setIsMediaLoading(false);
  };

  const handleQuickPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newReaction = currentUserReaction?.type === "like" ? null : "like";
    reactToPost({ postId: post._id, reactionType: newReaction });
  };

  const handleLongPress = () => {
    likeButtonRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
      setAnchorMeasurements({ pageX, pageY });
      setPickerVisible(true);
    });
  };

  const handleReactionSelect = (reactionType: ReactionName) => {
    reactToPost({ postId: post._id, reactionType });
    setPickerVisible(false);
  };

  const getTopThreeReactions = () => {
    if (!post.reactions || post.reactions.length === 0) {
      return [];
    }

    const reactionCounts = post.reactions.reduce(
      (acc, reaction) => {
        if (reaction && reaction.type) {
          acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        }
        return acc;
      },
      {} as Record<ReactionName, number>
    );

    return Object.entries(reactionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)
      .slice(0, 3);
  };

  const ReactionButton = () => {
    const reactionLabel =
      currentUserReaction?.type === "celebrate"
        ? "Yeyy"
        : currentUserReaction?.type || "Like";
    return (
      <View className="flex-row items-center">
        <LikeIcon userReaction={currentUserReaction?.type} size={22} />
        <Text
          className={`font-semibold capitalize ml-2 ${
            currentUserReaction?.type
              ? reactionTextColor[currentUserReaction.type]
              : "text-gray-500"
          }`}
        >
          {reactionLabel}
        </Text>
      </View>
    );
  };

  return (
    <>
      <View>
        {/* Post Header */}
        <View className="flex-row px-2 py-3 items-center">
          <Image
            source={{ uri: post.user.profilePicture || "" }}
            className="w-14 h-14 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-lg">
              {post.user.firstName} {post.user.lastName}
            </Text>
            <Text className="text-gray-500 text-sm">
              {formatDate(post.createdAt)}
            </Text>
          </View>
          {isOwnPost && (
            <TouchableOpacity
              onPress={() => onOpenPostMenu(post)} // Call the new prop
              className="p-2"
            >
              <FontAwesome name="ellipsis-h" size={20} color="#657786" />
            </TouchableOpacity>
          )}
        </View>

        {/* Post Content */}
        {post.content && (
          <Text
            className={`my-3 text-gray-800 px-2 ${
              !post.image && !post.video
                ? getDynamicPostTextStyle(post.content)
                : "text-lg font-normal"
            }`}
          >
            {post.content}
          </Text>
        )}
      </View>

      {/* Media Display */}
      {isMediaLoading && (post.image || post.video) && (
        <View
          style={{
            width: screenWidth,
            height: 200,
            backgroundColor: "#e0e0e0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Loading media...</Text>
        </View>
      )}

      {post.image && !isMediaLoading && imageHeight !== null && (
        <Image
          source={{ uri: post.image }}
          style={{ width: screenWidth, height: imageHeight }}
          resizeMode="contain"
        />
      )}
      {post.video && !isMediaLoading && videoHeight !== null && (
        <Video
          source={{ uri: post.video }}
          style={{ width: screenWidth, height: videoHeight }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onLoad={handleVideoLoad}
          onError={handleVideoError}
        />
      )}

      <View className="bg-white">
        {/* Reactions and Comments Count */}
        {((post.reactions && post.reactions.length > 0) ||
          (post.comments && post.comments.length > 0)) && (
          <View className="flex-row justify-between items-center px-4 py-1">
            {post.reactions && post.reactions.length > 0 ? (
              <View className="flex-row items-center">
                <View className="flex-row">
                  {getTopThreeReactions().map((reaction) => {
                    const Emoji =
                      reactionComponents[
                        reaction as keyof typeof reactionComponents
                      ];
                    if (!Emoji) {
                      return null;
                    }
                    return <Emoji key={reaction} width={20} height={20} />;
                  })}
                </View>
                <Text className="text-gray-500 text-base ml-2">
                  {formatNumber(post.reactions.length)}
                </Text>
              </View>
            ) : (
              <View />
            )}

            {post.comments && post.comments.length > 0 && (
              <Text className="text-gray-500 text-base">
                {formatNumber(post.comments.length)}{" "}
                {post.comments.length === 1 ? "comment" : "comments"}
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

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2.5"
            onPress={() => onComment(post._id)}
          >
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
