import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Animated,
  Easing,
  View,
} from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import switchTheme from "react-native-theme-switch-animation";

interface CustomThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const CustomThemeToggle: React.FC<CustomThemeToggleProps> = ({
  isDarkMode,
  onToggle,
}) => {
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  const startSwitchTheme = (config: {
    cx?: number;
    cy?: number;
    useFade?: boolean;
  } = {}) => {
    const { cx, cy, useFade } = config;
    switchTheme({
      switchThemeFunction: () => {
        onToggle();
      },
      animationConfig: useFade
        ? {
            type: "fade",
            duration: 500,
          }
        : {
            type: "circular",
            duration: 900,
            startingPoint:
              typeof cx === "number" && typeof cy === "number"
                ? { cx, cy }
                : { cxRatio: 0.5, cyRatio: 0.5 },
          },
    });
  };

  const handlePress = () => {
    // Simple press feedback
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

    if (buttonRef.current && typeof buttonRef.current.measure === "function") {
      try {
        buttonRef.current.measure(
          (
            x: number,
            y: number,
            width: number,
            height: number,
            px: number,
            py: number
          ) => {
            const hasValidSize = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
            const hasValidPos = Number.isFinite(px) && Number.isFinite(py);
            if (hasValidSize && hasValidPos) {
              startSwitchTheme({ cx: px + width / 2, cy: py + height / 2 });
            } else {
              // Fallback to center-based circular
              startSwitchTheme();
            }
          }
        );
      } catch (e) {
        // Fallback to center-based circular
        startSwitchTheme();
      }
    } else {
      // As a last resort, use fade which should always work
      startSwitchTheme({ useFade: true });
    }
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

  return (
    <>
      {/* Toggle Button */}
      <Animated.View style={{ transform: [{ scale: scaleValue }], zIndex: 9999 }}>
        <TouchableOpacity
          ref={buttonRef}
          onPress={handlePress}
          activeOpacity={0.8}
          className="relative"
        >
          {/* Main toggle background */}
          <View collapsable={false}>
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
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default CustomThemeToggle;