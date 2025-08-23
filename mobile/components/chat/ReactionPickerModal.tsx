import {
  Modal,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useEffect } from "react";

interface ReactionPickerModalProps {
  visible: boolean;
  anchor: { pageX: number; pageY: number; width: number } | null;
  colors: any;
  emojis: string[];
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export default function ReactionPickerModal({
  visible,
  anchor,
  colors,
  emojis,
  onPick,
  onClose,
}: ReactionPickerModalProps) {
  const translateY = useSharedValue(0);
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    if (visible && anchor) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 250 });
    } else {
      translateY.value = 50;
    }
  }, [visible, anchor]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible || !anchor) return null;

  const emojiContentWidth = 30;
  const emojiPaddingHorizontal = 12;
  const singleEmojiButtonWidth = emojiContentWidth + 2 * emojiPaddingHorizontal;

  const containerPaddingHorizontal = 8;

  const pickerContentWidth = emojis.length * singleEmojiButtonWidth;
  const pickerWidth = pickerContentWidth + 2 * containerPaddingHorizontal;

  const horizontalScreenPadding = 16;

  let idealLeft = anchor.pageX + anchor.width / 2 - pickerWidth / 2;

  let leftPosition = Math.max(horizontalScreenPadding, idealLeft);

  leftPosition = Math.min(
    leftPosition,
    screenWidth - pickerWidth - horizontalScreenPadding
  );

  if (pickerWidth > screenWidth - 2 * horizontalScreenPadding) {
    leftPosition = horizontalScreenPadding;
  }

  return (
    <Modal transparent visible onRequestClose={onClose} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1">
          <Animated.View
            style={[
              {
                position: "absolute",
                top: anchor.pageY - 60,
                left: leftPosition,
              },
              animatedStyle,
            ]}
          >
            <View
              className="flex-row rounded-full p-2 shadow-lg border"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              {emojis.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => onPick(emoji)}
                  className="px-2 py-0.4"
                >
                  <Text className="text-3xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
