import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, Dimensions, EmitterSubscription, Keyboard, KeyboardEvent, Platform, TextInput, View } from 'react-native';

interface KeyboardAvoiderViewProps {
  extraSpace?: number; // additional pixels to keep between input and keyboard
  baseGap?: number; // persistent bottom gap even when keyboard is closed
  style?: any;
}

export default function KeyboardAvoiderView({ children, extraSpace = 6, baseGap = 0, style }: PropsWithChildren<KeyboardAvoiderViewProps>) {
  if (Platform.OS === 'android') {
    // Prevent double-handling: Stream Channel (keyboardBehavior="height") handles lift smoothly
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }
  const translateY = useRef(new Animated.Value(0)).current; // used primarily for iOS
  const paddingBottom = useRef(new Animated.Value(baseGap)).current; // used for Android to preserve own background
  const subs = useRef<EmitterSubscription[]>([]);

  useEffect(() => {
    const computeAndAnimate = (keyboardTop: number, duration?: number) => {
      const input: any = (TextInput as any).State?.currentlyFocusedInput?.() || null;
      if (!input) return;
      input.measure?.((x: number, y: number, w: number, h: number, pageX: number, pageY: number) => {
        const inputBottom = pageY + h;
        const required = inputBottom + extraSpace - keyboardTop;
        if (Platform.OS === 'ios') {
          const shift = Math.max(required, 0);
          Animated.timing(translateY, {
            toValue: -shift,
            duration: duration ? Math.max(duration, 120) : 180,
            useNativeDriver: true,
          }).start();
        } else {
          // Android: adjust bottom padding instead of translating the whole view, preserving own background space
          const pad = Math.max(baseGap, required);
          Animated.timing(paddingBottom, {
            toValue: pad > 0 ? pad : baseGap,
            duration: duration ? Math.max(duration, 120) : 160,
            useNativeDriver: false,
          }).start();
        }
      });
    };

    const onShow = (e: KeyboardEvent) => {
      const input: any = (TextInput as any).State?.currentlyFocusedInput?.() || null;
      if (!input) return;
      const end = e.endCoordinates as any;
      const keyboardTop = end?.screenY ?? Dimensions.get('window').height;
      computeAndAnimate(keyboardTop, e.duration);
    };

    const onHide = () => {
      if (Platform.OS === 'ios') {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(paddingBottom, {
          toValue: baseGap,
          duration: 140,
          useNativeDriver: false,
        }).start();
      }
    };

    if (Platform.OS === 'ios') {
      subs.current = [
        Keyboard.addListener('keyboardWillShow', onShow),
        Keyboard.addListener('keyboardWillHide', onHide),
        Keyboard.addListener('keyboardWillChangeFrame', onShow),
      ];
    } else {
      subs.current = [];
    }

    return () => {
      subs.current.forEach(s => s.remove());
      subs.current = [];
    };
  }, [extraSpace, translateY]);

  return (
    <Animated.View
      style={[
        { flex: 1, transform: [{ translateY }], paddingBottom },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

