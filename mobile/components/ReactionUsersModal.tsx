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
import type { Reaction } from "../types";
import VerifiedBadge from "./VerifiedBadge";

// Import SVG emoji components
import LikeEmoji from "../assets/icons/reactions/LikeEmoji";
import HeartEmoji from "../assets/icons/reactions/HeartEmoji";
import CelebrateEmoji from "../assets/icons/reactions/CelebrateEmoji";
import WowEmoji from "../assets/icons/reactions/WowEmoji";
import LaughingEmoji from "../assets/icons/reactions/LaughingEmoji";
import CryingEmoji from "../assets/icons/reactions/CryingEmoji";
import AngryEmoji from "../assets/icons/reactions/AngryEmoji";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ReactionUsersModalProps {
  isVisible: boolean;
  onClose: () => void;
  reactions: Reaction[] | undefined; // Changed to use the proper Reaction type
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

  // Group reactions by type and count them
  const groupedReactions = (reactions || []).reduce((acc: any, reaction) => {
    if (!acc[reaction.type]) {
      acc[reaction.type] = [];
    }
    acc[reaction.type].push(reaction);
    return acc;
  }, {});

  // Get reaction emoji mapping
  const getReactionEmojiComponent = (reactionType: string) => {
    const emojiMap: { [key: string]: React.FC<any> } = {
      like: LikeEmoji,
      love: HeartEmoji,
      celebrate: CelebrateEmoji,
      wow: WowEmoji,
      haha: LaughingEmoji,
      sad: CryingEmoji,
      angry: AngryEmoji,
    };
    const EmojiComponent = emojiMap[reactionType];
    return EmojiComponent ? <EmojiComponent width={28} height={28} /> : null;
  };

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
                Reactions ({reactions?.length || 0})
              </Text>
              <Pressable
                onPress={onClose}
                style={[styles.closeIcon, { backgroundColor: "#636363" }]}
              >
                <FontAwesome6 name="xmark" size={16} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {reactions && reactions.length > 0 ? (
                // Show all reactions grouped by type
                Object.entries(groupedReactions).map(
                  ([reactionType, reactionList], groupIndex) => (
                    <View key={groupIndex}>
                      
                      {/* Users who made this reaction */}
                      {(reactionList as Reaction[]).map((reaction) => (
                        <View key={reaction._id} style={styles.reactionItem}>
                          <Image
                            style={styles.avatar}
                            source={{
                              uri: reaction.user.profilePicture || 
                                   `https://ui-avatars.com/api/?name=${reaction.user.firstName}+${reaction.user.lastName}&background=random`,
                            }}
                          />
                          <View style={styles.userInfo}>
                            <View style={styles.nameContainer}>
                              <Text style={[styles.userName, { color: colors.text }]}>
                                {reaction.user.firstName} {reaction.user.lastName}
                              </Text>
                              {reaction.user.isVerified && (
                                <VerifiedBadge size={16} />
                              )}
                            </View>
                          </View>
                          <View style={styles.reactionEmoji}>
                            {getReactionEmojiComponent(reaction.type)}
                          </View>
                        </View>
                      ))}
                    </View>
                  )
                )
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No reactions yet
                  </Text>
                </View>
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
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: screenWidth * 0.9,  
    maxHeight: screenHeight * 0.6,
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
    marginBottom: 15,
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
    paddingVertical: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  username: {
    fontSize: 14,
    marginTop: 2,
  },
  reactionEmoji: {
    marginLeft: 'auto',
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
  },
});

export default ReactionUsersModal;
