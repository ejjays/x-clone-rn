import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";

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

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  const handlePress = () => {
    // Add a subtle press animation
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

    onToggle();
  };

  // Animated values for the slider position
  const sliderPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 55], // Adjusted for smaller size: 5px from left to 55px from left (90px - 30px - 5px margin)
  });

  // Background color animation
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#71717a"], // white to zinc-500
  });

  // Slider background color animation
  const sliderBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fb923c", "#18181b"], // orange-400 to zinc-900
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
            width: 90, // Reduced width
            height: 40, // Reduced height
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
              width: 30, // Reduced width
              height: 30, // Reduced height
              top: 5, // Centered vertically
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
              left: 10, // Adjusted position
              top: 10, // Adjusted position
              opacity: sunOpacity,
            }}
          >
            <FontAwesome6 name="sun" size={20} color="#ffffff" />
          </Animated.View>

          {/* Moon icon (right side) - Fixed the color issue */}
          <Animated.View
            className="absolute"
            style={{
              right: 10, // Adjusted position
              top: 10, // Adjusted position
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
  );
};

export default CustomThemeToggle;
