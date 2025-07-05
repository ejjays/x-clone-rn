import { Feather } from "@expo/vector-icons"
import { Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

// Define our custom reactions
export const reactions = [
  { type: "love", emoji: "❤️" },
  { type: "haha", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "kiss", emoji: "😘" },
  { type: "angry", emoji: "😡" },
  { type: "like", emoji: "👍" },
]

interface ReactionsPickerProps {
  onSelect: (reactionType: string) => void
  onAdd: () => void
}

const ReactionsPicker = ({ onSelect, onAdd }: ReactionsPickerProps) => {
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      className="absolute -top-12 bg-white rounded-full p-2 shadow-lg"
      style={{
        // This style ensures it centers itself above the message
        left: "50%",
        transform: [{ translateX: -140 }], // Adjust this based on the total width of your picker
      }}
    >
      <View className="flex-row items-center space-x-2">
        {reactions.map((reaction) => (
          <TouchableOpacity key={reaction.type} onPress={() => onSelect(reaction.type)}>
            <Text className="text-3xl">{reaction.emoji}</Text>
          </TouchableOpacity>
        ))}
        {/* The plus button */}
        <TouchableOpacity
          onPress={onAdd}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center border-2 border-gray-200"
        >
          <Feather name="plus" size={20} color="#65676B" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

export default ReactionsPicker