import React, { useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  Animated,
  Easing,
  View,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";

interface CustomThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  onWaveAnimationStart?: () => void;
  onWaveAnimationComplete?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Calculate the maximum radius needed to cover the entire screen from any corner
const MAX_RADIUS = Math.sqrt(
  SCREEN_WIDTH * SCREEN_WIDTH + SCREEN_HEIGHT * SCREEN_HEIGHT
);

const CustomThemeToggle: React.FC<CustomThemeToggleProps> = ({
  isDarkMode,
  onToggle,
  onWaveAnimationStart,
  onWaveAnimationComplete,
}) => {
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const waveScale = useRef(new Animated.Value(0)).current;
  const waveOpacity = useRef(new Animated.Value(0)).current;

  const [isAnimating, setIsAnimating] = useState(false);
  const [wavePosition, setWavePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  const handlePress = (event: any) => {
    // Get the touch position relative to the screen
    const { pageX, pageY } = event.nativeEvent;
    setWavePosition({ x: pageX, y: pageY });

    // Start wave animation
    setIsAnimating(true);
    onWaveAnimationStart?.();

    // Reset wave values
    waveScale.setValue(0);
    waveOpacity.setValue(1);

    // Press animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Wave animation
    Animated.parallel([
      Animated.timing(waveScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(waveOpacity, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      onWaveAnimationComplete?.();
      onToggle(); // Move onToggle here!
    });
  };

  // Animated values for the slider position
  const sliderPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 55],
  });

  // Background color animation
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#71717a"],
  });

  // Slider background color animation
  const sliderBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fb923c", "#18181b"],
  });

  // Sun icon opacity
  const sunOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  // Moon icon opacity
  const moonOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  // Wave scale animation
  const waveScaleInterpolated = waveScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (MAX_RADIUS * 2) / 100], // Scale to cover entire screen
  });

  // Determine wave color based on target theme (opposite of current)
  const waveColor = isDarkMode ? "#ffffff" : "#111827";

  return (
    <>
      {/* Full Screen Wave Overlay */}
      {isAnimating && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: waveColor,
              left: wavePosition.x - 50,
              top: wavePosition.y - 50,
              opacity: waveOpacity,
              transform: [{ scale: waveScaleInterpolated }],
            }}
          />
        </View>
      )}

      {/* Toggle Button */}
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          className="relative"
        >
          {/* Main toggle background */}
          <Animated.View
            className="relative rounded-full"
            style={{
              width: 90,
              height: 40,
              backgroundColor,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {/* Animated slider */}
            <Animated.View
              className="absolute rounded-full"
              style={{
                width: 30,
                height: 30,
                top: 5,
                left: sliderPosition,
                backgroundColor: sliderBackgroundColor,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            />

            {/* Sun icon (left side) */}
            <Animated.View
              className="absolute"
              style={{
                left: 10,
                top: 10,
                opacity: sunOpacity,
              }}
            >
              <FontAwesome6 name="sun" size={20} color="#ffffff" />
            </Animated.View>

            {/* Moon icon (right side) */}
            <Animated.View
              className="absolute"
              style={{
                right: 10,
                top: 10,
                opacity: moonOpacity,
              }}
            >
              <Ionicons
                name="moon"
                size={20}
                color={isDarkMode ? "#ffffff" : "#71717a"}
              />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default CustomThemeToggle;
