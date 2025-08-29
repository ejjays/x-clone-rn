import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, Dimensions, Keyboard, KeyboardEvent, TextInput, View } from 'react-native';

interface AndroidKeyboardAvoiderProps {
  extraSpace?: number;
  style?: any;
}

export default function AndroidKeyboardAvoider({ children, extraSpace = 8, style }: PropsWithChildren<AndroidKeyboardAvoiderProps>) {
  const paddingBottom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const computeAndAnimate = (keyboardTop: number, duration?: number) => {
      const input: any = (TextInput as any).State?.currentlyFocusedInput?.() || null;
      if (!input) return;
      requestAnimationFrame(() => {
        input.measure?.((_x: number, _y: number, _w: number, h: number, _px: number, py: number) => {
          const inputBottom = py + h;
          const required = Math.max(inputBottom + extraSpace - keyboardTop, 0);
          Animated.timing(paddingBottom, {
            toValue: required,
            duration: duration ? Math.max(duration, 120) : 160,
            useNativeDriver: false,
          }).start();
        });
      });
    };

    const onShow = (e: KeyboardEvent) => {
      const end: any = e.endCoordinates;
      const keyboardTop = end?.screenY ?? Dimensions.get('window').height;
      computeAndAnimate(keyboardTop, e.duration);
    };

    const onHide = () => {
      Animated.timing(paddingBottom, {
        toValue: 0,
        duration: 140,
        useNativeDriver: false,
      }).start();
    };

    const s1 = Keyboard.addListener('keyboardDidShow', onShow);
    const s2 = Keyboard.addListener('keyboardDidHide', onHide);
    const s3 = Keyboard.addListener('keyboardDidChangeFrame', onShow);

    // Some keyboards change height without show/hide
    const dim = Dimensions.addEventListener('change', () => {
      const winH = Dimensions.get('window').height;
      computeAndAnimate(winH, 140);
    });

    return () => {
      s1.remove();
      s2.remove();
      // @ts-ignore
      s3.remove?.();
      // @ts-ignore
      dim?.remove?.();
    };
  }, [extraSpace, paddingBottom]);

  return (
    <Animated.View style={[{ flex: 1, paddingBottom }, style]}>
      {children}
    </Animated.View>
  );
}

