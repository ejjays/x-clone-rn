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
import { useRef, useState } from "react";
import PostReactionsPicker from "./PostReactionsPicker";
import * as Haptics from "expo-haptics";
import LikeIcon from "../assets/icons/LikeIcon";
import { reactionTextColor } from "@/utils/reactions";
import { useTheme } from "@/context/ThemeContext";
import { Trash } from "lucide-react-native";

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
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{
    pageX: number;
    pageY: number;
  } | null>(null);

  const isOwnComment = comment.user._id === currentUser?._id;
  const reactionCount = comment.reactions?.length || 0;

  const handleQuickPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newReaction =
      currentUserCommentReaction?.type === "like" ? null : "like";
    reactToComment({ commentId: comment._id, reactionType: newReaction });
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    likeButtonRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
      setAnchorMeasurements({ pageX, pageY });
      setPickerVisible(true);
    });
  };

  const handleReactionSelect = (reactionType: ReactionName) => {
    reactToComment({ commentId: comment._id, reactionType });
    setPickerVisible(false);
  };

  const handleDelete = () => {
    if (onDelete && isOwnComment) {
      onDelete(comment._id);
    }
  };

  const ReactionButton = () => {
    const reactionLabel =
      currentUserCommentReaction?.type === "celebrate"
        ? "Yeyy"
        : currentUserCommentReaction?.type || "Like";

    const textColor = currentUserCommentReaction?.type
      ? reactionTextColor[currentUserCommentReaction.type]
      : colors.textSecondary;

    return (
      <View className="flex-row items-center">
        <LikeIcon userReaction={currentUserCommentReaction?.type} size={18} />
        {reactionCount > 0 && (
          <Text
            className="font-medium text-xs ml-1"
            style={{ color: textColor }}
          >
            {reactionCount}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <View className="flex-row items-start px-4 mb-4">
        {/* Profile picture */}
        <Image
          source={{
            uri:
              comment.user.profilePicture ||
              `https://ui-avatars.com/api/?name=${comment.user.firstName}+${comment.user.lastName}&background=random`,
          }}
          className="w-10 h-10 rounded-full"
          style={{ backgroundColor: colors.surface }}
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
          </View>

          {/* Action buttons below the bubble with modern styling */}
          <View className="flex-row items-center mt-2 px-3">
            {/* Timestamp */}
            <Text
              className="text-xs font-medium"
              style={{ color: colors.textSecondary }}
            >
              {formatDate(comment.createdAt)}
            </Text>

            {/* Like/Reaction button */}
            <Pressable
              ref={likeButtonRef}
              onPress={handleQuickPress}
              onLongPress={handleLongPress}
              className="ml-4 flex-row items-center"
              style={{ minWidth: 40 }}
            >
              <ReactionButton />
              <Text
                className="font-medium text-xs ml-1"
                style={{
                  color: currentUserCommentReaction?.type
                    ? reactionTextColor[currentUserCommentReaction.type]
                    : colors.textSecondary,
                }}
              >
                Like
              </Text>
            </Pressable>

            {/* Reply button */}
            <TouchableOpacity
              onPress={() => console.log("Reply to comment:", comment._id)}
              className="ml-4"
            >
              <Text
                className="font-medium text-xs"
                style={{ color: colors.textSecondary }}
              >
                Reply
              </Text>
            </TouchableOpacity>

            {/* Delete button for own comments */}
            {isOwnComment && onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                className="ml-auto p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Show reactions if any */}
          {comment.reactions && comment.reactions.length > 0 && (
            <View className="flex-row items-center mt-1 px-3">
              <View
                className="flex-row items-center px-2 py-1 rounded-full"
                style={{ backgroundColor: colors.backgroundSecondary }}
              >
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {comment.reactions.length}{" "}
                  {comment.reactions.length === 1 ? "reaction" : "reactions"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Reaction picker modal */}
      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        anchorMeasurements={anchorMeasurements}
      />
    </>
  );
};

export default CommentCard;
