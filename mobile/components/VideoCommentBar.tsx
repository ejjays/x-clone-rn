import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

interface VideoCommentBarProps {
  onCommentPress: () => void;
}

export const COMMENT_BAR_HEIGHT = 60;

export const VideoCommentBar: React.FC<VideoCommentBarProps> = ({ onCommentPress }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.commentBarContainer,
        {
          paddingBottom: insets.bottom,
          height: COMMENT_BAR_HEIGHT + insets.bottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[styles.commentInput, { backgroundColor: colors.surface }]}
        onPress={onCommentPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.commentPlaceholder, { color: colors.textSecondary }]}>Add a comment...</Text>
        <Ionicons name="send" size={20} color={colors.blue} style={styles.sendIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  commentBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
  },
  commentPlaceholder: {
    flex: 1,
    fontSize: 16,
  },
  sendIcon: {
    marginLeft: 12,
  },
});