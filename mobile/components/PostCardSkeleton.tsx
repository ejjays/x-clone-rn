import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const PostCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View className="p-4 mb-1" style={{ backgroundColor: colors.background }}>
      {/* Header Skeleton */}
      <View className="flex-row items-center mb-4">
        <View style={{backgroundColor: colors.surface}} className="w-12 h-12 rounded-full" />
        <View className="flex-1 ml-3">
          <View style={{backgroundColor: colors.surface}} className="w-3/4 h-4 rounded mb-2" />
          <View style={{backgroundColor: colors.surface}} className="w-1/4 h-3 rounded" />
        </View>
      </View>

      {/* Content Skeleton */}
      <View className="space-y-2 mb-4">
        <View style={{backgroundColor: colors.surface}} className="w-full h-4 rounded" />
        <View style={{backgroundColor: colors.surface}} className="w-5/6 h-4 rounded" />
      </View>

      {/* Image Skeleton */}
      <View style={{backgroundColor: colors.surface}} className="w-full h-72 rounded-lg mb-2" />

      {/* Actions Skeleton */}
      <View className="flex-row justify-around py-2 border-t border-gray-100 mt-2">
        <View style={{backgroundColor: colors.surface}} className="w-1/4 h-6 rounded-full" />
        <View style={{backgroundColor: colors.surface}} className="w-1/4 h-6 rounded-full" />
        <View style={{backgroundColor: colors.surface}} className="w-1/4 h-6 rounded-full" />
      </View>
    </View>
  );
};

export default PostCardSkeleton;