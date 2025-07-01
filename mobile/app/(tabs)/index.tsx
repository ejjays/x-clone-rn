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
    <ScrollView
      className="flex-1 bg-gray-100"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handlePullToRefresh}
          tintColor={"#1DA1F2"}
        />
      }
    >
      {/* Custom Header */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-white">
        <Text className="text-4xl font-bold text-blue-600">pcmi</Text>
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

      <View className="bg-white">
        <PostComposer />
      </View>

      {/* Subtle Divider */}
      <View className="h-1.5 bg-gray-200" />

      <View className="bg-white">
        <Stories />
      </View>

      {/* Subtle Divider */}
      <View className="h-1.5 bg-gray-200" />

      <PostsList />
    </ScrollView>
  );
};
export default HomeScreen;