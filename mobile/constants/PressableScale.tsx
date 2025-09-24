import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface PressableScaleProps {
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number; // Added to allow disabling default opacity
}

const PressableScale: React.FC<PressableScaleProps> = ({
  onPress,
  onLongPress,
  children,
  scaleTo = 0.97,
  style,
  activeOpacity = 1, // Default to 1 to remove opacity effect
}) => {
  const animatedScale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(animatedScale, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 100,
      bounciness: 0,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 100,
      bounciness: 0,
    }).start();
  };

  const handlePressIn = () => {
    animateIn();
  };

  const handlePressOut = () => {
    animateOut();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={activeOpacity}
      style={[style, { transform: [{ scale: animatedScale }] }]} // Apply external style and animated scale directly to TouchableOpacity
    >
      {children}
    </TouchableOpacity>
  );
};

export default PressableScale;