import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  useWindowDimensions,
  Pressable,
} from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { useEffect } from "react"
import * as Haptics from "expo-haptics"

export const reactions = [
  { type: "love", emoji: "❤️" },
  { type: "haha", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "kissing_heart", emoji: "😘" },
  { type: "enraged", emoji: "😡" },
  { type: "thumbsup", emoji: "👍" },
]

interface ReactionsPickerProps {
  isVisible: boolean
  onClose: () => void
  onSelect: (reactionType: string) => void
  anchorMeasurements: { pageX: number; pageY: number; width: number } | null
}

// --- FIX #1: Adjusted the width for a cleaner look without the plus button ---
const PICKER_WIDTH = 280
const PICKER_HEIGHT = 60

const ReactionsPicker = ({
  isVisible,
  onClose,
  onSelect,
  anchorMeasurements,
}: ReactionsPickerProps) => {
  const scale = useSharedValue(0)
  const { width: screenWidth } = useWindowDimensions()

  useEffect(() => {
    if (isVisible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      scale.value = withSpring(1, { damping: 15, stiffness: 200 })
    } else {
      scale.value = withTiming(0, { duration: 150 })
    }
  }, [isVisible])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: isVisible
        ? withTiming(1, { duration: 100 })
        : withTiming(0, { duration: 150 }),
    }
  })

  const handleSelect = (reactionType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSelect(reactionType)
  }

  let pickerStyle = {}
  if (anchorMeasurements) {
    const { pageX, pageY, width: anchorWidth } = anchorMeasurements
    let left = pageX + anchorWidth / 2 - PICKER_WIDTH / 2
    let top = pageY - PICKER_HEIGHT - 10

    if (left < 10) left = 10
    if (left + PICKER_WIDTH > screenWidth) {
      left = screenWidth - PICKER_WIDTH - 10
    }

    pickerStyle = { top, left }
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
          {/* --- FIX #2: Removed the separator and plus button --- */}
          <View className="bg-gray-800/90 rounded-full p-2 shadow-lg flex-row items-center justify-center space-x-2">
            {reactions.map((reaction) => (
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
  )
}

export default ReactionsPicker