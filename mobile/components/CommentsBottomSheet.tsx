// mobile/components/CommentsBottomSheet.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native'; 
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext'; 

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
  bottomOffset: number; // Prop for bottom safe area offset (tab bar height)
}

const CommentsBottomSheet = ({ bottomSheetRef, onClose, bottomOffset }: CommentsBottomSheetProps) => {
  const { top: topInset } = useSafeAreaInsets();
  const { colors } = useTheme(); 
  const { height: screenHeight } = Dimensions.get('window'); 

  // Calculate the effective height available for the bottom sheet
  // This ensures the sheet doesn't go below the topInset and above the bottomOffset (tab bar)
  const availableHeight = screenHeight - topInset - bottomOffset;
  
  // Snap points are now absolute values based on the calculated available height
  const snapPoints = useMemo(() => [
    Math.max(1, availableHeight * 0.8), // 80% of available height
    Math.max(1, availableHeight * 0.95), // 95% of available height
  ], [availableHeight]);

  const renderComment = ({ item }: { item: typeof mockComments[0] }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={[styles.commentBubble, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.commentUser, { color: colors.text }]}>{item.user}</Text> 
        <Text style={[styles.commentText, { color: colors.text }]}>{item.text}</Text> 
      </View>
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} 
      snapPoints={snapPoints} // Use calculated absolute snap points
      enablePanDownToClose
      onClose={onClose}
      topInset={topInset}
      // bottomInset={bottomOffset} // REMOVED: Snap points now handle the overall height calculation
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
      )}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]} 
      backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: colors.background }]} 
      style={styles.bottomSheet}
      bounces={false} 
    >
      <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}> 
        <Text style={[styles.headerText, { color: colors.text }]}>Comments</Text> 
      </View>
      <BottomSheetFlatList 
        data={mockComments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.contentContainer} 
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    zIndex: 100,
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    width: 40,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40, // Keep original paddingBottom for internal content spacing if desired
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
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
  },
  commentUser: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 1,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
});

export default CommentsBottomSheet;