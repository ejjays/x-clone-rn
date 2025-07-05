import { Feather } from "@expo/vector-icons"
import { Text, TouchableOpacity, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import { useEffect } from "react"
import * as Haptics from "expo-haptics"

// Define our custom reactions
export const reactions = [
  { type: "love", emoji: "❤️" },
  { type: "haha", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "kissing_heart", emoji: "😘" }, // Changed to a more standard type
  { type: "enraged", emoji: "😡" }, // Changed to a more standard type
  { type: "thumbsup", emoji: "👍" }, // Changed to a more standard type
]

interface ReactionsPickerProps {
  onSelect: (reactionType: string) => void
  onAdd?: () => void // Make onAdd optional for now
  isVisible: boolean
}

const ReactionsPicker = ({ onSelect, onAdd, isVisible }: ReactionsPickerProps) => {
  const scale = useSharedValue(0)

  // Trigger animation when visibility changes
  useEffect(() => {
    scale.value = withSpring(isVisible ? 1 : 0, { damping: 15, stiffness: 200 })
  }, [isVisible])

  // Animated style for the pop-in effect
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: withTiming(isVisible ? 1 : 0, { duration: 100 }),
    }
  })

  const handleSelect = (reactionType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSelect(reactionType)
  }

  // Hide the picker if it's not visible to prevent accidental interactions
  if (!isVisible) {
    return null
  }

  return (
    <Animated.View
      style={animatedStyle}
      // This is the new, improved styling!
      className="absolute -top-[54px] bg-gray-800/90 rounded-full p-2 shadow-lg flex-row items-center space-x-2"
    >
      {reactions.map((reaction) => (
        <TouchableOpacity key={reaction.type} onPress={() => handleSelect(reaction.type)} className="p-1">
          <Text className="text-4xl">{reaction.emoji}</Text>
        </TouchableOpacity>
      ))}

      {/* The plus button */}
      <View className="w-[2px] h-8 bg-gray-600 rounded-full mx-1" />
      <TouchableOpacity
        onPress={onAdd}
        className="w-10 h-10 bg-gray-600/80 rounded-full items-center justify-center"
      >
        <Feather name="plus" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  )
}

export default ReactionsPicker