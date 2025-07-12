// mobile/components/CommentsBottomSheet.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockComments = [
  { id: '1', user: 'Joey Aromin', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop&crop=face', text: 'one thing I disagree sa mga sinabi mo. yung mga dati pang reports ng mga aliens ay totoo maaring hindi lahat pero totoo ito. hindi nga lang sila ‘aliens’ rather the correct term is devil. angels and demons have always been here around us' },
  { id: '2', user: 'soshabby.ph', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', text: 'Finally waiting for someone to talk about this here in the Phils' },
  { id: '3', user: 'Anthony Bautista Asoy', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', text: 'Yes Lord!! I am very excited for your coming lord. I OFFER you my life and I will follow you till the end.' },
  { id: '4', user: 'Sarah Lee', avatar: 'https://randomuser.me/api/portraits/women/7.jpg', text: 'So inspiring!' },
  { id: '5', user: 'Mike Brown', avatar: 'https://randomuser.me/api/portraits/men/8.jpg', text: 'Wow, I never knew this.' },
  { id: '6', user: 'Emily White', avatar: 'https://randomuser.me/api/portraits/women/9.jpg', text: 'Can\'t wait for the next one!' },
];

interface CommentsBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onClose: () => void;
}

const CommentsBottomSheet = ({ bottomSheetRef, onClose }: CommentsBottomSheetProps) => {
  const { top: topInset } = useSafeAreaInsets();
  
  // This snap point setup is correct. 80% for initial open, 95% is the max it can expand to.
  const snapPoints = useMemo(() => ['80%', '95%'], []);

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
      index={-1} // Start closed
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      // FIX: Added topInset to respect the device's safe area (e.g., status bar)
      topInset={topInset}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
      )}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Comments</Text>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#E0E0E0',
    width: 40,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1E21',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentBubble: {
    backgroundColor: '#F0F2F5',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
  },
  commentUser: {
    fontWeight: '600',
    fontSize: 14,
    color: '#050505',
    marginBottom: 1,
  },
  commentText: {
    fontSize: 15,
    color: '#050505',
    lineHeight: 20,
  },
});

export default CommentsBottomSheet;