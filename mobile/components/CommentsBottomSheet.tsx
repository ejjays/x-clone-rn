import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const mockComments = [
  {
    id: "1",
    user: "Test User 1",
    avatar:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop&crop=face",
    text: "This is a very insightful discussion! I appreciate the different perspectives shared.",
  },
  {
    id: "2",
    user: "Test User 2",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    text: "Finally waiting for someone to talk about this here in the Phils",
  },
  {
    id: "3",
    user: "Test User 3",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    text: "Yes Lord!! I am very excited for your coming lord. I OFFER you my life and I will follow you till the end.",
  },
  {
    id: "4",
    user: "Test User 4",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg",
    text: "So inspiring!",
  },
  {
    id: "5",
    user: "Test User 5",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    text: "Wow, I never knew this.",
  },
  {
    id: "6",
    user: "Test User6",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    text: "Can't wait for the next one!",
  },
];

interface CommentsBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onClose: () => void;
  bottomOffset: number;
}

const CommentsBottomSheet = ({
  bottomSheetRef,
  onClose,
  bottomOffset,
}: CommentsBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { height: screenHeight } = Dimensions.get("window");

  const totalBottomOffset = bottomOffset + insets.bottom;
  const availableHeight = screenHeight - insets.top - totalBottomOffset;

  const snapPoints = useMemo(() => [availableHeight * 0.9], [availableHeight]);

  const renderComment = ({ item }: { item: (typeof mockComments)[0] }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={[styles.commentBubble, { backgroundColor: colors.surface }]}>
        <Text style={[styles.commentUser, { color: colors.text }]}>
          {item.user}
        </Text>
        <Text style={[styles.commentText, { color: colors.text }]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      topInset={insets.top}
      bottomInset={totalBottomOffset}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: colors.border },
      ]}
      backgroundStyle={[
        styles.bottomSheetBackground,
        { backgroundColor: colors.background },
      ]}
      style={styles.bottomSheet}
      bounces={false}
      overshootTop={false}
      android_keyboardInputMode="adjustResize"
    >
      <View
        style={[styles.headerContainer, { borderBottomColor: colors.border }]}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>
          Comments
        </Text>
      </View>
      <BottomSheetFlatList
        data={mockComments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    zIndex: 9999,
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleIndicator: {
    width: 40,
    height: 4,
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  commentUser: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
});

export default CommentsBottomSheet;
