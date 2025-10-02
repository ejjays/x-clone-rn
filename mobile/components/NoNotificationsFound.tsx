import LottieView from "lottie-react-native";
import { Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { LightThemeColors, DarkThemeColors } from "../constants/Colors";

const NoNotificationsFound = () => {
  const { colorScheme } = useColorScheme();
  const themeColors =
    colorScheme === "dark" ? DarkThemeColors : LightThemeColors;

  return (
    <View
      className="flex-1 items-center justify-center px-12 mt-12"
      style={{ minHeight: 200, backgroundColor: themeColors.background }}
    >
      <View className="items-center">
        {/* BIG Animated Lottie Bell - Main Highlight */}
        <View className="w-96 h-96 mt-8 mb-2">
          <LottieView
            source={require("../assets/animations/empty-notifications.json")}
            style={{
              width: "100%",
              height: "100%",
            }}
            loop={true}
            autoPlay={true}
            speed={1.0}
            resizeMode="contain"
          />
        </View>

        <Text
          className="text-2xl font-bold mb-4"
          style={{ color: themeColors.text }}
        >
          No notifications yet
        </Text>
        <Text
          className="text-center text-base leading-6 max-w-sm"
          style={{ color: themeColors.textSecondary }}
        >
          When people like, comment, or follow you, it will appear here.
        </Text>
      </View>
    </View>
  );
};

export default NoNotificationsFound;
