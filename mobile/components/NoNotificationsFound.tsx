import LottieView from "lottie-react-native";
import { Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { LightThemeColors, DarkThemeColors } from "../constants/Colors";
import { useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

const NoNotificationsFound = () => {
  const { colorScheme } = useColorScheme();
  const themeColors =
    colorScheme === "dark" ? DarkThemeColors : LightThemeColors;
  const animationRef = useRef<LottieView>(null);

  useFocusEffect(
    useCallback(() => {
      if (animationRef.current) {
        animationRef.current.play();
      }

      return () => {
        if (animationRef.current) {
          animationRef.current.reset();
        }
      };
    }, [])
  );

  return (
    <View
      className="flex-1 items-center justify-center p-8"
      style={{ backgroundColor: themeColors.background }}
    >
      <View className="w-full max-w-md items-center">
        {/* Responsive Animated Lottie Bell */}
        <View className="w-full aspect-square">
          <LottieView
            ref={animationRef}
            source={require("../assets/animations/empty-notifications.json")}
            style={{
              width: "100%",
              height: "100%",
            }}
            loop={true}
            autoPlay={false}
            speed={1.0}
            resizeMode="contain"
          />
        </View>

        <Text
          className="text-2xl font-bold text-center mt-8 mb-4"
          style={{ color: themeColors.text }}
        >
          No notifications yet
        </Text>
        <Text
          className="text-center text-base leading-6"
          style={{ color: themeColors.textSecondary }}
        >
          When people like, comment, or follow you, it will appear here.
        </Text>
      </View>
    </View>
  );
};

export default NoNotificationsFound;
