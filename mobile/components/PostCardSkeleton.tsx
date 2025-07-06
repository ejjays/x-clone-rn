import React from "react";
import { View } from "react-native";

const PostCardSkeleton = () => {
  return (
    <View className="bg-white p-4 mb-1">
      {/* Header Skeleton */}
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 rounded-full bg-gray-200" />
        <View className="flex-1 ml-3">
          <View className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
          <View className="w-1/4 h-3 bg-gray-200 rounded" />
        </View>
      </View>

      {/* Content Skeleton */}
      <View className="space-y-2 mb-4">
        <View className="w-full h-4 bg-gray-200 rounded" />
        <View className="w-5/6 h-4 bg-gray-200 rounded" />
      </View>

      {/* Image Skeleton */}
      <View className="w-full h-72 bg-gray-200 rounded-lg mb-2" />

      {/* Actions Skeleton */}
      <View className="flex-row justify-around py-2 border-t border-gray-100 mt-2">
        <View className="w-1/4 h-6 bg-gray-200 rounded-full" />
        <View className="w-1/4 h-6 bg-gray-200 rounded-full" />
        <View className="w-1/4 h-6 bg-gray-200 rounded-full" />
      </View>
    </View>
  );
};

export default PostCardSkeleton;