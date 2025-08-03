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

interface CommentCardProps {
  comment: Comment;
  currentUser: User | undefined;
  onLike: (commentId: string) => void; // This will be replaced or integrated
  reactToComment: (args: {
    commentId: string;
    reactionType: string | null;
  }) => void;
  currentUserCommentReaction: Reaction | null;
}

const { width: screenWidth } = Dimensions.get("window");

const CommentCard = ({
  comment,
  currentUser,
  reactToComment,
  currentUserCommentReaction,
}: CommentCardProps) => {
  const isLiked = currentUser ? comment.likes.includes(currentUser._id) : false; // Keep for now if `likes` array is still used

  const likeButtonRef = useRef<RNView>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{
    pageX: number;
    pageY: number;
  } | null>(null);

  const handleQuickPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newReaction =
      currentUserCommentReaction?.type === "like" ? null : "like";
    reactToComment({ commentId: comment._id, reactionType: newReaction });
  };

  const handleLongPress = () => {
    likeButtonRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
      setAnchorMeasurements({ pageX, pageY });
      setPickerVisible(true);
    });
  };

  const handleReactionSelect = (reactionType: ReactionName) => {
    reactToComment({ commentId: comment._id, reactionType });
    setPickerVisible(false);
  };

  const ReactionButton = () => {
    const reactionLabel =
      currentUserCommentReaction?.type === "celebrate"
        ? "Yeyy"
        : currentUserCommentReaction?.type || "Like";
    return (
      <View className="flex-row items-center">
        <LikeIcon userReaction={currentUserCommentReaction?.type} size={22} />
        <Text
          className={`font-semibold capitalize ml-2 ${
            currentUserCommentReaction?.type
              ? reactionTextColor[currentUserCommentReaction.type]
              : "text-gray-600"
          }`}
        >
          {reactionLabel}
        </Text>
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
              `https://example.com/default-avatar.png`,
          }}
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
            <Text className="text-[15px] text-gray-900 leading-[22px] mt-1">
              {comment.content}
            </Text>
          </View>

          {/* The action buttons below the bubble */}
          {/* FIX: Using specific margins 'ml-4' on each button to FORCE the spacing. */}
          <View className="flex-row items-center mt-1.5 px-3">
            <Text className="text-sm font-semibold text-gray-600">
              {formatDate(comment.createdAt)}
            </Text>

            <Pressable
              ref={likeButtonRef}
              onPress={handleQuickPress}
              onLongPress={handleLongPress}
              className="ml-4"
            >
              <ReactionButton />
            </Pressable>

            <TouchableOpacity
              onPress={() => console.log("Reply to comment:", comment._id)}
              className="ml-4"
            >
              <Text className="font-semibold text-sm text-gray-600">Reply</Text>
            </TouchableOpacity>
          </View>
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

export default CommentCard;
