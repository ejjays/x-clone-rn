import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, Dimensions, EmitterSubscription, Keyboard, KeyboardEvent, Platform, TextInput, View } from 'react-native';

interface KeyboardAvoiderViewProps {
  extraSpace?: number;
  style?: any;
}

export default function KeyboardAvoiderView({ children, extraSpace = 6, style }: PropsWithChildren<KeyboardAvoiderViewProps>) {
  const translateY = useRef(new Animated.Value(0)).current;
  const subs = useRef<EmitterSubscription[]>([]);

  useEffect(() => {
    const computeAndAnimate = (keyboardTop: number, duration?: number) => {
      const input: any = (TextInput as any).State?.currentlyFocusedInput?.() || null;
      if (!input) return;
      input.measure?.((x: number, y: number, w: number, h: number, pageX: number, pageY: number) => {
        const inputBottom = pageY + h;
        let shift = inputBottom + extraSpace - keyboardTop;
        if (Platform.OS === 'android') shift = Math.max(shift, 0);
        if (shift < 0) shift = 0;
        Animated.timing(translateY, {
          toValue: -shift,
          duration: duration ? Math.max(duration, 120) : 180,
          useNativeDriver: true,
        }).start();
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
      // Some Android keyboards change height without firing another show/hide event
      const dimSub = Dimensions.addEventListener('change', () => {
        const winH = Dimensions.get('window').height;
        computeAndAnimate(winH, 140);
      });
      // @ts-ignore - RN new API returns object with remove, old returns function
      subs.current.push({ remove: () => dimSub?.remove?.() });
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

