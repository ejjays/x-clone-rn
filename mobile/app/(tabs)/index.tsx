import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import Stories from "@/components/Stories";
import { usePosts } from "@/hooks/usePosts";
import { useUserSync } from "@/hooks/useUserSync";
import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

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
      className="flex-1 bg-gray-100" // Use a light gray for the main background
      showsVerticalScrollIndicator={false}
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

      {/* Subtle Divider */}
      <View className="h-2 bg-gray-200" />

      <View className="bg-white">
        <Stories />
      </View>

      {/* Subtle Divider */}
      <View className="h-2 bg-gray-200" />

      <PostsList />
    </ScrollView>
  );
};
export default HomeScreen;