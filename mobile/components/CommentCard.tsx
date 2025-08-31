// mobile/components/CommentCard.tsx
import type { Comment, User, Reaction, ReactionName } from "@/types";
import { formatDate } from "@/utils/formatters";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Dimensions,
  type View as RNView,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import PostReactionsPicker from "./PostReactionsPicker";
import PostActionBottomSheet, {
  type PostActionBottomSheetRef,
} from "./PostActionBottomSheet";
import * as Haptics from "expo-haptics";
import LikeIcon from "../assets/icons/LikeIcon";
import {
  reactionTextColor,
  reactionComponents,
  reactionLabels,
} from "@/utils/reactions";
import { useTheme } from "@/context/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";

interface CommentCardProps {
  comment: Comment;
  currentUser: User | undefined;
  reactToComment: (args: {
    commentId: string;
    reactionType: string | null;
  }) => void;
  currentUserCommentReaction?: Reaction | undefined;
  onDelete?: (commentId: string) => void;
}

const { width: screenWidth } = Dimensions.get("window");

const CommentCard = ({
  comment,
  currentUser,
  reactToComment,
  currentUserCommentReaction,
  onDelete,
}: CommentCardProps) => {
  const { colors, isDarkMode } = useTheme();
  const likeButtonRef = useRef<RNView>(null);
  const bottomSheetRef = useRef<PostActionBottomSheetRef>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{
    pageX: number;
    pageY: number;
  } | null>(null);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const isOwnComment = comment.user._id === currentUser?._id;
  const reactionCount = comment.reactions?.length || 0;

  // Calculate image dimensions for original aspect ratio
  useEffect(() => {
    // If comment has an image attachment, calculate its dimensions
    // This is a placeholder for when you add image support to comments
    // For now, we'll handle profile pictures with proper aspect ratio
  }, []);

  const handleQuickPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newReaction =
      currentUserCommentReaction?.type === "like" ? null : "like";
    reactToComment({ commentId: comment._id, reactionType: newReaction });
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    likeButtonRef.current?.measureInWindow((x, y, width, _height) => {
      const hasValid = typeof x === "number" && typeof y === "number";
      const anchorX = hasValid ? x + (width || 0) / 2 : screenWidth / 2;
      const anchorY = hasValid ? y : 120;
      setAnchorMeasurements({ pageX: anchorX, pageY: anchorY });
      requestAnimationFrame(() => setPickerVisible(true));
    });
  };

  const handleReactionSelect = (reactionType: ReactionName) => {
    reactToComment({ commentId: comment._id, reactionType });
    setPickerVisible(false);
  };

  const handleMenuPress = () => {
    bottomSheetRef.current?.open();
  };

  const handleDelete = async () => {
    if (onDelete && isOwnComment) {
      onDelete(comment._id);
    }
  };

  const handleCopyText = async (text: string) => {
    await Clipboard.setStringAsync(text);
    // You might want to show a toast notification here
  };

  // Get top three reactions for display (similar to PostCard)
  const getTopThreeReactions = () => {
    if (!comment.reactions || comment.reactions.length === 0) {
      return [];
    }

    const reactionCounts = comment.reactions.reduce(
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

  const topReactions = getTopThreeReactions();

  const ReactionButton = () => {
    const reactionLabel =
      reactionLabels[currentUserCommentReaction?.type] || "Like";

    let textColor;
    switch (currentUserCommentReaction?.type) {
      case "like":
        textColor = "#1877F2";
        break;
      case "love":
        textColor = "#E4405F";
        break;
      case "sad":
      case "celebrate":
      case "haha":
      case "wow":
        textColor = "#FFD972";
        break;
      case "angry":
        textColor = "#FF6347";
        break;
      default:
        textColor = colors.textSecondary;
        break;
    }

    return (
      <View className="flex-row items-center">
        <LikeIcon userReaction={currentUserCommentReaction?.type} size={18} />
        <Text
          className="font-semibold capitalize ml-1 text-xs"
          style={{ color: textColor }}
        >
          {reactionLabel}
        </Text>
      </View>
    );
  };

  return (
    <>
      <View className="flex-row items-start px-4 mb-4">
        {/* Profile picture with original aspect ratio */}
        <Image
          source={{
            uri:
              comment.user.profilePicture ||
              `https://ui-avatars.com/api/?name=${comment.user.firstName}+${comment.user.lastName}&background=random`,
          }}
          className="w-10 h-10 rounded-full"
          style={{ backgroundColor: colors.surface }}
          resizeMode="cover" // Maintains aspect ratio
        />

        {/* Comment content container */}
        <View className="flex-1 ml-3">
          {/* Comment bubble with modern dark theme */}
          <View
            className="rounded-2xl px-3.5 py-2.5 max-w-[85%]"
            style={{ backgroundColor: colors.surface }}
          >
            {/* User name with proper dark theme color */}
            <Text
              className="font-bold text-sm mb-1"
              style={{ color: colors.text }}
            >
              {comment.user.firstName} {comment.user.lastName}
            </Text>

            {/* Comment text with proper dark theme color and typography */}
            <Text
              className="text-base leading-5"
              style={{ color: colors.text }}
            >
              {comment.content}
            </Text>

            {/* If comment has image attachment, show it in original aspect ratio */}
            {/* This is a placeholder for when you add image support to comments */}
            {/* You can uncomment and modify this when implementing image attachments
            {comment.image && (
              <Image
                source={{ uri: comment.image }}
                style={{
                  width: '100%',
                  height: imageHeight || 200,
                  marginTop: 8,
                  borderRadius: 8,
                }}
                resizeMode="contain" // Maintains original aspect ratio
                onLoad={(event) => {
                  const { width, height } = event.nativeEvent.source;
                  const maxWidth = screenWidth * 0.7; // 70% of screen width
                  const calculatedHeight = (height / width) * maxWidth;
                  setImageHeight(calculatedHeight);
                }}
              />
            )}
            */}
          </View>

          {/* Reactions display (similar to PostCard) */}
          {reactionCount > 0 && (
            <View className="flex-row items-center mt-1 ml-2">
              <View className="flex-row items-center">
                {/* Show top 3 reaction emojis */}
                {topReactions.map((reactionType, index) => {
                  const ReactionComponent =
                    reactionComponents[reactionType as ReactionName];
                  return (
                    <View
                      key={reactionType}
                      className="w-4 h-4 rounded-full border border-white"
                      style={{
                        marginLeft: index > 0 ? -4 : 0,
                        backgroundColor: colors.background,
                        zIndex: topReactions.length - index,
                      }}
                    >
                      <ReactionComponent width={16} height={16} />
                    </View>
                  );
                })}

                {/* Reaction count */}
                <Text
                  className="text-xs ml-2 font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  {reactionCount}
                </Text>
              </View>
            </View>
          )}

          {/* Action buttons below the bubble with modern styling */}
          <View className="flex-row items-center mt-2 px-3">
            {/* Timestamp */}
            <Text
              className="text-xs font-medium"
              style={{ color: colors.textSecondary }}
            >
              {formatDate(comment.createdAt)}
            </Text>

            {/* Like/Reaction button with same functionality as PostCard */}
            <View ref={likeButtonRef} collapsable={false} style={{ minWidth: 40 }}>
              <Pressable
                onPress={handleQuickPress}
                onLongPress={handleLongPress}
                delayLongPress={150}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="ml-4 flex-row items-center py-1"
              >
                <ReactionButton />
              </Pressable>
            </View>

            {/* Reply button */}
            <TouchableOpacity
              onPress={() => console.log("Reply to comment:", comment._id)}
              className="ml-4 py-1"
            >
              <Text
                className="font-medium text-xs"
                style={{ color: colors.textSecondary }}
              >
                Reply
              </Text>
            </TouchableOpacity>

            {/* Three dots menu (replaces trash icon) */}
            {(isOwnComment || currentUser?.isAdmin) && (
              <TouchableOpacity
                onPress={handleMenuPress}
                className="ml-auto p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome
                  name="ellipsis-h"
                  size={14}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Reaction picker modal */}
      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        anchorMeasurements={anchorMeasurements}
      />

      {/* Post Action Bottom Sheet (replaces direct delete) */}
      <PostActionBottomSheet
        ref={bottomSheetRef}
        onClose={() => {}}
        onDelete={handleDelete}
        onCopyText={handleCopyText}
        postContent={comment.content}
        isOwnPost={isOwnComment}
        isAdmin={currentUser?.isAdmin || false}
        postOwnerName={`${comment.user.firstName} ${comment.user.lastName}`}
      />
    </>
  );
};

export default CommentCard;
