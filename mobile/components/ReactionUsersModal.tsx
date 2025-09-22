import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Image,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { FontAwesome6 } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ReactionUsersModalProps {
  isVisible: boolean;
  onClose: () => void;
  reactions: { userId: string; reaction: string }[] | undefined;
}

const ReactionUsersModal: React.FC<ReactionUsersModalProps> = ({
  isVisible,
  onClose,
  reactions,
}) => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();

  const modalBackgroundColor =
    colorScheme === "dark" ? "#2c2d2e" : colors.card;

  // Dummy user data (replace with actual data fetching later)
  const users = [
    { id: "1", name: "Christian Edica", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
    { id: "2", name: "Hans Raven Ramos", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
    { id: "3", name: "Kristine Managat", avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
    // Add more users as needed
  ];

  // Function to get user info by ID
  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId);
  };

  // Group reactions by type
  const groupedReactions = (reactions || []).reduce((acc: any, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = [];
    }
    acc[reaction.reaction].push(reaction.userId);
    return acc;
  }, {});

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: modalBackgroundColor },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Reactions
              </Text>
              <Pressable
                onPress={onClose}
                style={[styles.closeIcon, { backgroundColor: "#636363" }]}
              >
                <FontAwesome6 name="xmark" size={16} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView>
              {Object.entries(groupedReactions).map(
                ([reaction, userIds], index) => (
                  <View key={index}>
                    {userIds.map((userId) => {
                      const user = getUserById(userId);
                      if (!user) return null; // Handle case where user is not found

                      return (
                        <View key={userId} style={styles.reactionItem}>
                          <Image
                            style={styles.avatar}
                            source={{ uri: user.avatar }}
                          />
                          <Text style={{ color: colors.text }}>{user.name}</Text>
                          <Text>{reaction}</Text> {/* Display the reaction */}
                        </View>
                      );
                    })}
                  </View>
                )
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.4,
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  closeIcon: {
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
});

export default ReactionUsersModal;
