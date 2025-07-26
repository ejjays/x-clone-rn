import type React from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
} from "react-native";
import type { ReactionName } from "@/types";
import { reactionComponents } from "@/utils/reactions";
import * as Haptics from "expo-haptics";

interface PostReactionsPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (reactionType: ReactionName) => void;
  anchorMeasurements: { pageX: number; pageY: number } | null;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const reactions: { type: ReactionName; label: string }[] = [
  { type: "like", label: "Like" },
  { type: "love", label: "Love" },
  { type: "celebrate", label: "Celebrate" },
  { type: "wow", label: "Wow" },
  { type: "haha", label: "Haha" },
  { type: "sad", label: "Sad" },
  { type: "angry", label: "Angry" },
];

const PostReactionsPicker: React.FC<PostReactionsPickerProps> = ({
  isVisible,
  onClose,
  onSelect,
  anchorMeasurements,
}) => {
  const handleReactionPress = (reactionType: ReactionName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(reactionType);
  };

  if (!isVisible || !anchorMeasurements) {
    return null;
  }

  // Calculate dynamic pickerWidth based on content
  const emojiDisplayWidth = 32 + 2 * 8; // 32px emoji + 8px padding on each side for TouchableOpacity = 48px
  const numberOfEmojis = reactions.length;

  // Calculate the total width needed for emojis and spacing.
  // Using space-between means we need enough padding for the ends, and the space between will be distributed.
  const minimumContentWidth = numberOfEmojis * emojiDisplayWidth;
  const containerHorizontalPadding = 16 * 2; // Increased padding to 16px on each side = 32px total

  const calculatedPickerWidth =
    minimumContentWidth + containerHorizontalPadding;

  // Ensure pickerWidth doesn't exceed screen width minus some margin
  const screenMargin = 20; // 10px on each side for overall screen safety margin
  const maxPickerWidth = screenWidth - screenMargin;

  const pickerWidth = Math.min(calculatedPickerWidth, maxPickerWidth);

  const pickerHeight = 60; // Still sufficient based on emoji height + padding

  // Calculate position to center the picker above the button
  let left = anchorMeasurements.pageX - pickerWidth / 2;
  let top = anchorMeasurements.pageY - pickerHeight - 10;

  // Ensure picker stays within screen bounds
  if (left < 10) left = 10;
  if (left + pickerWidth > screenWidth - 10)
    left = screenWidth - pickerWidth - 10;
  // If picker is too high, position it below the anchor
  if (top < 50) top = anchorMeasurements.pageY + 50;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <View
          style={{
            position: "absolute",
            left,
            top,
            width: pickerWidth, // Use the dynamically calculated width
            height: pickerHeight,
            backgroundColor: "white",
            borderRadius: 30,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center", // Changed to space-around for even distribution
            paddingHorizontal: 16, // Increased padding to provide more buffer on sides
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {reactions.map((reaction) => {
            const ReactionComponent = reactionComponents[reaction.type];
            return (
              <TouchableOpacity
                key={reaction.type}
                onPress={() => handleReactionPress(reaction.type)}
                style={{
                  padding: 8, // This padding is factored into emojiDisplayWidth
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.7}
              >
                <ReactionComponent width={32} height={32} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
};

export default PostReactionsPicker;
