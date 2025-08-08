import PostComposer from "@/components/PostComposer";
import Stories from "@/components/Stories";
import { usePosts } from "@/hooks/usePosts";
import { useUserSync } from "@/hooks/useUserSync";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
  Alert,
} from "react-native";
import PostActionBottomSheet, {
  type PostActionBottomSheetRef,
} from "@/components/PostActionBottomSheet";
import PostCard from "@/components/PostCard";
import PostCardSkeleton from "@/components/PostCardSkeleton";
import type { Post } from "@/types";
import { useScroll } from "@/context/ScrollContext";
import { useTheme } from "@/context/ThemeContext";

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const {
    posts,
    isLoading: isPostsLoading,
    error,
    refetch: refetchPosts,
    reactToPost,
    deletePost,
    getCurrentUserReaction,
  } = usePosts();
  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
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

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => {
      if (!currentUser) return null;
      return (
        <View>
          <PostCard
            post={item}
            reactToPost={reactToPost}
            onDelete={deletePost}
            onComment={handleOpenComments}
            currentUser={currentUser}
            currentUserReaction={getCurrentUserReaction(
              item.reactions,
              currentUser
            )}
            onOpenPostMenu={handleOpenPostMenu}
            onReactionPickerVisibilityChange={
              handleReactionPickerVisibilityChange
            }
          />
        </View>
      );
    },
    [currentUser, reactToPost, deletePost]
  );

  const listHeader = useMemo(
    () => (
      <View>
        <View style={{ backgroundColor: colors.background }}>
          <PostComposer animatedPlaceholder={false} />
          <Stories />
        </View>
        <View
          className="h-1"
          style={{ backgroundColor: isDarkMode ? "#141414" : colors.border }}
        />
        {(isPostsLoading || isUserLoading) && (
          <View style={{ backgroundColor: colors.background }}>
            {[...Array(3)].map((_, idx) => (
              <PostCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </View>
        )}
      </View>
    ),
    [colors, isDarkMode, isPostsLoading, isUserLoading]
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={() => (
          <View className="h-1" style={{ backgroundColor: "#141414" }} />
        )}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
        removeClippedSubviews
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
      />
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
