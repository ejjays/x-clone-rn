import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

const mockComments = [
  { id: '1', user: 'Jane Doe', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', text: 'This is amazing! 🤩' },
  { id: '2', user: 'John Smith', avatar: 'https://randomuser.me/api/portraits/men/5.jpg', text: 'Great content, keep it up!' },
  { id: '3', user: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/6.jpg', text: 'Love this! ❤️' },
  { id: '4', user: 'Sarah Lee', avatar: 'https://randomuser.me/api/portraits/women/7.jpg', text: 'So inspiring!' },
  { id: '5', user: 'Mike Brown', avatar: 'https://randomuser.me/api/portraits/men/8.jpg', text: 'Wow, I never knew this.' },
  { id: '6', user: 'Emily White', avatar: 'https://randomuser.me/api/portraits/women/9.jpg', text: 'Can\'t wait for the next one!' },
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
      <View style={styles.commentTextContainer}>
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
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Comments</Text>
        <FlatList
          data={mockComments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  list: {
    marginTop: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
  },
});

export default CommentsBottomSheet;