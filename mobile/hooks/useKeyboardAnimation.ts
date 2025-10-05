import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export const useKeyboardAnimation = (offset = 0) => {
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
    onEnd: (e) => {
      'worklet';
      if (e.state === 'CLOSED') {
        keyboardHeight.value = 0;
      } else {
        keyboardHeight.value = e.height;
      }
    }
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: withSpring(keyboardHeight.value + offset),
    };
  });

  return animatedStyle;
};
