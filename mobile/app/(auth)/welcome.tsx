// mobile/app/(auth)/welcome.tsx
import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

export default function Welcome() {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View className="flex-1 px-8 justify-center">
        {/* WELCOME ILLUSTRATION */}
        <View className="items-center mb-14">
          <Image
            source={require("../../assets/images/welcome-illustration.png")}
            className="w-80 h-80"
            resizeMode="contain"
          />
        </View>

        {/* TITLE */}
        <View className="mb-10">
          <Text
            className="text-3xl font-poppins-black text-center leading-tight mb-4"
            style={{ color: colors.text }}
          >
            Pag-ibig Christian Ministries Inc.
          </Text>
          <Text
            className="text-center text-lg font-poppins-regular px-4 leading-7"
            style={{ color: colors.textSecondary }}
          >
            Welcome Kapatid! 👋 Glad to see you here. Login or create an account to continue.
          </Text>
        </View>

        {/* BUTTONS */}
        <View className="flex-row gap-4 mt-6">
          <TouchableOpacity
            className="flex-1 rounded-2xl py-4"
            style={{ backgroundColor: colors.blue }}
            onPressIn={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text className="font-bold text-lg text-center" style={{ color: "#ffffff" }}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-2xl py-4"
            style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
            onPressIn={() => router.push("/(auth)/register")}
            activeOpacity={0.85}
          >
            <Text className="font-semibold text-lg text-center" style={{ color: colors.text }}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}