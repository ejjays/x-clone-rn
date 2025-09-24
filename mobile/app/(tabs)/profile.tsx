import React from "react"
import { View } from "react-native"
import { useTheme } from "@/context/ThemeContext"

export default function ProfileScreens() {
  const { colors } = useTheme();
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }} />
  );
}