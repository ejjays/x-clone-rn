
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import PostComposer from './PostComposer';
import Stories from './Stories';
import { useTheme } from '@/context/ThemeContext';

export const HEADER_HEIGHT = 220; // Adjust as needed

const CollapsibleHeader = ({ scrollY }) => {
  const { colors, isDarkMode } = useTheme();

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View style={[styles.header, { backgroundColor: colors.background }, headerStyle]}>
        <PostComposer animatedPlaceholder={false} />
        <Stories />
        <View className="h-1" style={{ backgroundColor: isDarkMode ? '#141414' : colors.border }} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
    elevation: 1,
  },
});

export default CollapsibleHeader;
