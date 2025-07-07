import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  useWindowDimensions,
  Pressable,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";

export const postReactions = [
  { type: "like", emoji: "👍" },
  { type: "love", emoji: "❤️" },
  { type: "haha", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "sad", emoji: "😢" },
  { type: "angry", emoji: "😡" },
];

interface PostReactionsPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (reactionType: string) => void;
  anchorMeasurements: { pageX: number; pageY: number; width: number } | null;
}

const PICKER_WIDTH = 320;
const PICKER_HEIGHT = 60;

const PostReactionsPicker = ({
  isVisible,
  onClose,
  onSelect,
  anchorMeasurements,
}: PostReactionsPickerProps) => {
  const scale = useSharedValue(0);
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    if (isVisible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      scale.value = withTiming(0, { duration: 150 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: isVisible
        ? withTiming(1, { duration: 100 })
        : withTiming(0, { duration: 150 }),
    };
  });

  const handleSelect = (reactionType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(reactionType);
    onClose();
  };

  let pickerStyle = {};
  if (anchorMeasurements) {
    const { pageX, pageY } = anchorMeasurements;
    let left = pageX - PICKER_WIDTH / 2 + 30; // Center it on the button
    let top = pageY - PICKER_HEIGHT - 10; // Position above the button

    // Ensure it doesn't go off-screen
    if (left < 10) left = 10;
    if (left + PICKER_WIDTH > screenWidth) {
      left = screenWidth - PICKER_WIDTH - 10;
    }

    pickerStyle = { top, left };
  }

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <Animated.View
          style={[
            { position: "absolute", width: PICKER_WIDTH },
            animatedStyle,
            pickerStyle,
          ]}
        >
          <View className="bg-white rounded-full p-2 shadow-lg flex-row items-center justify-around border border-gray-200">
            {postReactions.map((reaction) => (
              <TouchableOpacity
                key={reaction.type}
                onPress={() => handleSelect(reaction.type)}
                className="p-1"
              >
                <Text className="text-4xl">{reaction.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default PostReactionsPicker;