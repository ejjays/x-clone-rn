import type React from "react";
import { View, TouchableOpacity } from "react-native";
import type { ReactionName } from "@/types";
import { reactionComponents } from "@/utils/reactions";
import * as Haptics from "expo-haptics";

interface ReactionsPickerProps {
  onReactionSelect: (reactionType: ReactionName) => void;
  selectedReaction?: ReactionName | null;
}

const reactions: { type: ReactionName; label: string }[] = [
  { type: "like", label: "Like" },
  { type: "love", label: "Love" },
  { type: "celebrate", label: "Yeyy" }, // Changed label from "Celebrate" to "Yeyy"
  { type: "wow", label: "Wow" },
  { type: "haha", label: "Haha" },
  { type: "sad", label: "Sad" },
  { type: "angry", label: "Angry" },
];

const ReactionsPicker: React.FC<ReactionsPickerProps> = ({
  onReactionSelect,
  selectedReaction,
}) => {
  const handleReactionPress = (reactionType: ReactionName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReactionSelect(reactionType);
  };

  return (
    <View className="flex-row justify-around items-center bg-white rounded-full py-2 px-4 shadow-lg">
      {reactions.map((reaction) => {
        const ReactionComponent = reactionComponents[reaction.type];
        const isSelected = selectedReaction === reaction.type;

        return (
          <TouchableOpacity
            key={reaction.type}
            onPress={() => handleReactionPress(reaction.type)}
            className={`p-2 rounded-full ${isSelected ? "bg-blue-100" : "bg-transparent"}`}
            activeOpacity={0.7}
          >
            <ReactionComponent
              width={28}
              height={28}
              style={{
                transform: [{ scale: isSelected ? 1.2 : 1 }],
              }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ReactionsPicker;
