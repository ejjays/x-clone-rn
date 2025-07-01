import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import Stories from "@/components/Stories";
import { usePosts } from "@/hooks/usePosts";
import { useUserSync } from "@/hooks/useUserSync";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-blue-600">facebook</Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
            <Feather name="search" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
            <Feather name="message-circle" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            tintColor={"#1DA1F2"}
          />
        }
      >
        <PostComposer />
        <Stories />
        <View className="mt-2" />
        <PostsList />
      </ScrollView>
    </SafeAreaView>
  );
};
export default HomeScreen;