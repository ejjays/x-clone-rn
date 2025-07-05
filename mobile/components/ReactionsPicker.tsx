import { Feather } from "@expo/vector-icons"
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

const PICKER_WIDTH = 320 // Approximate width of the picker
const PICKER_HEIGHT = 60 // Approximate height of the picker

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
      opacity: isVisible ? withTiming(1, { duration: 100 }) : withTiming(0, { duration: 150 }),
    }
  })

  const handleSelect = (reactionType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSelect(reactionType)
  }

  // --- Smart Positioning Logic ---
  let pickerStyle = {}
  if (anchorMeasurements) {
    const { pageX, pageY, width: anchorWidth } = anchorMeasurements

    // Default to centering above the anchor
    let left = pageX + anchorWidth / 2 - PICKER_WIDTH / 2
    let top = pageY - PICKER_HEIGHT - 10 // 10px offset from the bubble

    // Boundary checks to prevent overflow
    if (left < 10) {
      left = 10 // Margin from left edge
    }
    if (left + PICKER_WIDTH > screenWidth) {
      left = screenWidth - PICKER_WIDTH - 10 // Margin from right edge
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
          <View className="bg-gray-800/90 rounded-full p-2 shadow-lg flex-row items-center space-x-2">
            {reactions.map((reaction) => (
              <TouchableOpacity
                key={reaction.type}
                onPress={() => handleSelect(reaction.type)}
                className="p-1"
              >
                <Text className="text-4xl">{reaction.emoji}</Text>
              </TouchableOpacity>
            ))}
            <View className="w-[2px] h-8 bg-gray-600 rounded-full mx-1" />
            <TouchableOpacity
              onPress={onClose} // Let's make the plus button close it for now
              className="w-10 h-10 bg-gray-600/80 rounded-full items-center justify-center"
            >
              <Feather name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}

export default ReactionsPicker