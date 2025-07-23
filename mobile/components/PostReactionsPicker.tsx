import { Text, TouchableOpacity, View, Modal, useWindowDimensions, Pressable, } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, } from "react-native-reanimated";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import LikeEmoji from "../assets/icons/reactions/LikeEmoji";
import HeartEmoji from "../assets/icons/reactions/HeartEmoji";
import CelebrateEmoji from "../assets/icons/reactions/CelebrateEmoji";
import CareEmoji from "../assets/icons/reactions/WowEmoji";
import LaughingEmoji from "../assets/icons/reactions/LaughingEmoji";
import CryingEmoji from "../assets/icons/reactions/CryingEmoji";
import AngryEmoji from "../assets/icons/reactions/AngryEmoji";
import { ReactionName } from "../types";

interface PostReactionsPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (reactionType: ReactionName) => void;
  anchorMeasurements: { pageX: number; pageY: number; width: number } | null;
}

const REACTIONS = [
  { name: 'like', icon: LikeEmoji },
  { name: 'heart', icon: HeartEmoji },
  { name: 'celebrate', icon: CelebrateEmoji },
  { name: 'care', icon: CareEmoji },
  { name: 'laughing', icon: LaughingEmoji },
  { name: 'crying', icon: CryingEmoji },
  { name: 'angry', icon: AngryEmoji },
];

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

  const handleSelect = (reactionType: ReactionName) => {
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
            {REACTIONS.map((reaction) => {
              const IconComponent = reaction.icon;
              return (
                <TouchableOpacity
                  key={reaction.name}
                  onPress={() => handleSelect(reaction.name)}
                  className="p-1"
                >
                  <IconComponent width={32} height={32} />
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default PostReactionsPicker;