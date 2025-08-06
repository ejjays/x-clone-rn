import PostsList from "@/components/PostsList";
import PostComposer from "@/components/PostComposer";
import Stories from "@/components/Stories";
import { usePosts } from "@/hooks/usePosts";
import { useUserSync } from "@/hooks/useUserSync";
import { router } from "expo-router";
import { useState, useRef } from "react";
import { RefreshControl, ScrollView, View, Alert } from "react-native";
import PostActionBottomSheet, {
  type PostActionBottomSheetRef,
} from "@/components/PostActionBottomSheet";
import type { Post } from "@/types";
import { useScroll } from "@/context/ScrollContext";
import { useTheme } from "@/context/ThemeContext";

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const { refetch: refetchPosts, deletePost } = usePosts();
  const postActionBottomSheetRef = useRef<PostActionBottomSheetRef>(null);
  const [selectedPostForMenu, setSelectedPostForMenu] = useState<Post | null>(
    null
  );
  const { handleScroll } = useScroll();
  const { isDarkMode, colors } = useTheme();
  const [isReactionPickerVisible, setIsReactionPickerVisible] = useState(false);

  const handleOpenComments = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetchPosts();
    setIsRefetching(false);
  };

  const handleOpenPostMenu = (post: Post) => {
    setSelectedPostForMenu(post);
    setTimeout(() => {
      postActionBottomSheetRef.current?.open();
    }, 10);
  };

  const handleCloseBottomSheet = () => {
    setSelectedPostForMenu(null);
  };

  const handleDeletePost = () => {
    if (selectedPostForMenu) {
      deletePost(selectedPostForMenu._id);
      postActionBottomSheetRef.current?.close();
    }
  };

  const handleCopyText = (text: string) => {
    Alert.alert("Copy Functionality", "This feature is temporarily disabled.");
    postActionBottomSheetRef.current?.close();
  };

  const handleReactionPickerVisibilityChange = (isVisible: boolean) => {
    setIsReactionPickerVisible(isVisible);
  };

  useUserSync();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={1}
        scrollEnabled={!isReactionPickerVisible}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            colors={["#1877F2"]}
            tintColor={"#1877F2"}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <View style={{ backgroundColor: colors.background }}>
          <PostComposer animatedPlaceholder={false} />
          <Stories />
        </View>
        <View className="h-1" style={{ backgroundColor: isDarkMode ? '#141414' : colors.border }} />
        <PostsList
          onOpenComments={handleOpenComments}
          onOpenPostMenu={handleOpenPostMenu}
          onReactionPickerVisibilityChange={handleReactionPickerVisibilityChange}
        />
      </ScrollView>
      <PostActionBottomSheet
        ref={postActionBottomSheetRef}
        onClose={handleCloseBottomSheet}
        onDelete={handleDeletePost}
        onCopyText={handleCopyText}
        postContent={selectedPostForMenu?.content}
      />
    </View>
  );
};

export default HomeScreen;
