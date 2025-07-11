// mobile/components/CommentsBottomSheet.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';

const mockComments = [
  { id: '1', user: 'Jane Doe', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', text: 'This is amazing! 🤩' },
  { id: '2', user: 'John Smith', avatar: 'https://randomuser.me/api/portraits/men/5.jpg', text: 'Great content, keep it up!' },
  { id: '3', user: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/6.jpg', text: 'Love this! ❤️ This is a slightly longer comment to see how the text wrapping looks within the new message bubble style that we are implementing. It should wrap nicely and look great.' },
  { id: '4', user: 'Sarah Lee', avatar: 'https://randomuser.me/api/portraits/women/7.jpg', text: 'So inspiring!' },
  { id: '5', user: 'Mike Brown', avatar: 'https://randomuser.me/api/portraits/men/8.jpg', text: 'Wow, I never knew this.' },
  { id: '6', user: 'Emily White', avatar: 'https://randomuser.me/api/portraits/women/9.jpg', text: 'Can\'t wait for the next one!' },
  { id: '7', user: 'Chris Green', avatar: 'https://randomuser.me/api/portraits/men/10.jpg', text: 'Absolutely fantastic work.' },
  { id: '8', user: 'Jessica Blue', avatar: 'https://randomuser.me/api/portraits/women/11.jpg', text: 'This made my day.' },
];

interface CommentsBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onClose: () => void;
}

const CommentsBottomSheet = ({ bottomSheetRef, onClose }: CommentsBottomSheetProps) => {
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const renderComment = ({ item }: { item: typeof mockComments[0] }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.commentBubble}>
        <Text style={styles.commentUser}>{item.user}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
      )}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Comments ({mockComments.length})</Text>
      </View>
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        {mockComments.map((comment) => (
          <View key={comment.id}>
            {renderComment({ item: comment })}
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#F0F2F5', // A light grey, similar to messenger
  },
  headerContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1E21',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1, // Allow the bubble to take remaining space
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  commentUser: {
    fontWeight: '600',
    fontSize: 14,
    color: '#050505',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    color: '#050505',
    lineHeight: 20, // Improved line spacing for readability
  },
});

export default CommentsBottomSheet;