import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import Stories from "@/components/Stories";
import { usePosts } from "@/hooks/usePosts";
import { useUserSync } from "@/hooks/useUserSync";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const { refetch: refetchPosts } = usePosts();

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetchPosts();
    setIsRefetching(false);
  };

  useUserSync();

  return (
    <View className="flex-1 bg-gray-200">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-white">
        <Text className="text-3xl font-bold text-blue-600">facebook</Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
            <Feather name="plus" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
            <Feather name="search" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
            <Feather name="message-circle" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            tintColor={"#1DA1F2"}
          />
        }
      >
        <View className="bg-white">
          <PostComposer />
        </View>
        <View className="h-2.5 bg-gray-200" />
        <View className="bg-white">
          <Stories />
        </View>
        <View className="h-2.5 bg-gray-200" />
        <PostsList />
      </ScrollView>
    </View>
  );
};
export default HomeScreen;