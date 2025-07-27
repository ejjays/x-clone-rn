// mobile/app/(tabs)/index.tsx
import PostsList from "@/components/PostsList"
import PostComposer from "@/components/PostComposer"
import Stories from "@/components/Stories"
import { usePosts } from "@/hooks/usePosts"
import { useUserSync } from "@/hooks/useUserSync"
import { router } from "expo-router"
import { useState, useRef } from "react"
import { RefreshControl, ScrollView, View, Alert } from "react-native"
import PostActionBottomSheet, { PostActionBottomSheetRef } from "@/components/PostActionBottomSheet";
import { Post } from "@/types";

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false)
  const { refetch: refetchPosts, deletePost } = usePosts()
  const postActionBottomSheetRef = useRef<PostActionBottomSheetRef>(null);
  const [selectedPostForMenu, setSelectedPostForMenu] = useState<Post | null>(null);

  // This function now just navigates
  const handleOpenComments = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const handlePullToRefresh = async () => {
    setIsRefetching(true)
    await refetchPosts()
    setIsRefetching(false)
  }

  const handleOpenPostMenu = (post: Post) => {
    setSelectedPostForMenu(post);
    // Reduce the delay to make the opening feel more immediate
    setTimeout(() => {
      postActionBottomSheetRef.current?.open();
    }, 10); // Changed to 10ms
  };

  const handleCloseBottomSheet = () => {
    // This function is called by PostActionBottomSheet when it closes.
    // We only need to reset the selected post here.
    setSelectedPostForMenu(null);
  };

  const handleDeletePost = () => {
    if (selectedPostForMenu) {
      deletePost(selectedPostForMenu._id);
      postActionBottomSheetRef.current?.close(); // Explicitly close after action
    }
  };

  // Temporarily make this a non-functional copy text option
  const handleCopyText = (text: string) => {
    Alert.alert("Copy Functionality", "This feature is temporarily disabled.");
    postActionBottomSheetRef.current?.close(); // Explicitly close after action
  };

  useUserSync()

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-gray-100"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handlePullToRefresh} colors={["#1877F2"]} tintColor="#1877F2" />
        }
      >
        <View className="bg-white">
          <PostComposer animatedPlaceholder={false} />
          <Stories />
        </View>
        <View className="h-1.5 bg-gray-200" />
        <PostsList onOpenComments={handleOpenComments} onOpenPostMenu={handleOpenPostMenu} />
      </ScrollView>
      <PostActionBottomSheet
        ref={postActionBottomSheetRef}
        onClose={handleCloseBottomSheet}
        onDelete={handleDeletePost}
        onCopyText={handleCopyText}
        postContent={selectedPostForMenu?.content}
      />
    </View>
  )
}

export default HomeScreen