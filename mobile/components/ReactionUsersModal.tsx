import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface ReactionUsersModalProps {
  isVisible: boolean;
  onClose: () => void;
  // You might want to pass data about the reactions or users here later
}

const ReactionUsersModal: React.FC<ReactionUsersModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Users who reacted</Text>
            {/* Content for displaying users will go here */}
            <Text style={{ color: colors.text, marginTop: 10 }}>No users found yet!</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.1)', // Example, adjust as needed
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReactionUsersModal;
