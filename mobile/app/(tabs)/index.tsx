import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import Stories from "@/components/Stories";
import { usePosts } from "@/hooks/usePosts";
import { useUserSync } from "@/hooks/useUserSync";
import { RefreshControl, ScrollView, View } from "react-native";
import { useRef, useState } from "react";
import type { Post } from "@/types";
// Import the ref type we created
import CommentsModal, { type CommentsModalRef } from "@/components/CommentsModal";

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const { refetch: refetchPosts } = usePosts();

  // Update the ref type here
  const commentsModalRef = useRef<CommentsModalRef>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetchPosts();
    setIsRefetching(false);
  };

  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    // This is the only change needed here
    commentsModalRef.current?.open();
  };

  useUserSync();

  return (
    <>
      <ScrollView
        className="flex-1 bg-gray-100"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            colors={["#1877F2"]}
            tintColor="#1877F2"
          />
        }
      >
        <View className="bg-white">
          <PostComposer />
        </View>

        <View className="h-1.5 bg-gray-200" />

        <View className="bg-white">
          <Stories />
        </View>

        <View className="h-1.5 bg-gray-200" />

        <PostsList onOpenComments={handleOpenComments} />
      </ScrollView>

      <CommentsModal ref={commentsModalRef} selectedPost={selectedPost} />
    </>
  );
};
export default HomeScreen;