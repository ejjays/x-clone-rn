// mobile/components/chat/ReactionPickerModal.tsx
import { Modal, TouchableWithoutFeedback, View, Text, TouchableOpacity } from "react-native";

interface ReactionPickerModalProps {
  visible: boolean;
  anchor: { pageY: number } | null;
  colors: any;
  emojis: string[];
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export default function ReactionPickerModal({ visible, anchor, colors, emojis, onPick, onClose }: ReactionPickerModalProps) {
  if (!visible || !anchor) return null;
  return (
    <Modal transparent visible onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1">
          <View style={{ position: "absolute", top: anchor.pageY - 60, left: 0, right: 0, alignItems: "center" }}>
            <View className="flex-row rounded-full p-2 shadow-lg border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
              {emojis.map((emoji) => (
                <TouchableOpacity key={emoji} onPress={() => onPick(emoji)} className="px-3 py-2">
                  <Text className="text-3xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}