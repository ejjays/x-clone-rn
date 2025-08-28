import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, EmitterSubscription, Keyboard, KeyboardEvent, Platform, TextInput, View } from 'react-native';

interface KeyboardAvoiderViewProps {
  extraSpace?: number;
  style?: any;
}

export default function KeyboardAvoiderView({ children, extraSpace = 8, style }: PropsWithChildren<KeyboardAvoiderViewProps>) {
  const translateY = useRef(new Animated.Value(0)).current;
  const subs = useRef<EmitterSubscription[]>([]);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      const input: any = (TextInput as any).State?.currentlyFocusedInput?.() || null;
      if (!input) return;
      // Measure the currently focused input to compute how far to lift
      input.measure?.((x: number, y: number, w: number, h: number, pageX: number, pageY: number) => {
        const inputBottom = pageY + h;
        const keyboardTop = e.endCoordinates?.screenY ?? 0;
        let androidPannedBy = 0;
        if (Platform.OS === 'android') {
          // Compensate for Android's own pan/resize
          androidPannedBy = Math.max(inputBottom - keyboardTop, 0);
        }
        let shift = inputBottom + extraSpace - keyboardTop;
        if (Platform.OS === 'android') shift += androidPannedBy;
        if (shift < 0) shift = 0;
        Animated.timing(translateY, {
          toValue: -shift,
          duration: e.duration ? Math.max(e.duration, 120) : 180,
          useNativeDriver: true,
        }).start();
      });
    };

    const onHide = () => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    if (Platform.OS === 'ios') {
      subs.current = [
        Keyboard.addListener('keyboardWillShow', onShow),
        Keyboard.addListener('keyboardWillHide', onHide),
      ];
    } else {
      subs.current = [
        Keyboard.addListener('keyboardDidShow', onShow),
        Keyboard.addListener('keyboardDidHide', onHide),
      ];
    }

    return () => {
      subs.current.forEach(s => s.remove());
      subs.current = [];
    };
  }, [extraSpace, translateY]);

  return (
    <Animated.View style={[{ flex: 1, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

