import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@clerk/clerk-expo";

export default function MenuScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentUser, isLoading } = useCurrentUser();
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="px-4 py-4 flex-row justify-between items-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text className="text-3xl font-bold" style={{ color: colors.text }}>
          Menu
        </Text>
        <View className="flex-row space-x-8">
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings" size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="w-4" />
          <TouchableOpacity onPress={() => router.push("(tabs)/search")}>
            <FontAwesome name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 mt-2">
        <View style={{ backgroundColor: colors.surface, borderRadius: 12 }}>
          {
            isLoading ? (
              <View className="flex-row items-center p-4">
                <Text style={{ color: colors.text }}>Loading user data...</Text>
              </View>
            ) : currentUser ? (
              <TouchableOpacity
                onPress={() => router.push(`/user/${currentUser?.id}`)}
                className="flex-row items-center p-4"
              >
                <Image
                  source={{ uri: currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent((currentUser?.firstName || "") + " " + (currentUser?.lastName || ""))}&background=1877F2&color=fff&size=40` }}
                  className="w-12 h-12 rounded-full"
                />
                <Text
                  className="text-xl font-bold ml-4"
                  style={{ color: colors.text }}
                >
                  {currentUser?.firstName} {currentUser?.lastName}
                </Text>
                <View className="ml-auto">
                  <View className="bg-gray-700 rounded-full p-2">
                    <FontAwesome name="chevron-down" size={16} color={colors.text} />
                  </View>
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                    <Text className="text-white text-xs font-bold">1</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center p-4">
                <Text style={{ color: colors.text }}>User not found.</Text>
              </View>
            )
          }
          <View
            className="h-px mx-4"
            style={{ backgroundColor: colors.border }}
          />
          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center">
              <FontAwesome name="plus" size={24} color={colors.text} />
            </View>
            <View className="ml-4">
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Create new profile or Page
              </Text>
              <Text className="text-sm" style={{ color: colors.text }}>
                Switch between profiles with one login.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
