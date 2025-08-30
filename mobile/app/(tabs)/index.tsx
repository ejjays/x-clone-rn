import PostsList from "@/components/PostsList";
import PostComposer from "@/components/PostComposer";
import React, { memo, useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { InteractionManager } from "react-native";
import Stories from "@/components/Stories";
import { usePosts } from "@/hooks/usePosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserSync } from "@/hooks/useUserSync";
import { router } from "expo-router";
import { useRef } from "react";
import { RefreshControl, ScrollView, View, Alert } from "react-native";
import PostActionBottomSheet, {
  type PostActionBottomSheetRef,
} from "@/components/PostActionBottomSheet";
import type { Post } from "@/types";
import { useScroll } from "@/context/ScrollContext";
import { useTheme } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Import useSafeAreaInsets

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const { refetch: refetchPosts, deletePost } = usePosts();
  const { currentUser } = useCurrentUser();
  const postActionBottomSheetRef = useRef<PostActionBottomSheetRef>(null);
  const [selectedPostForMenu, setSelectedPostForMenu] = useState<Post | null>(
    null
  );
  const { handleScroll } = useScroll();
  const { isDarkMode, colors } = useTheme();
  const [isReactionPickerVisible, setIsReactionPickerVisible] = useState(false);
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => setReady(true));
      return () => {
        setReady(false);
        task.cancel();
      };
    }, [])
  );

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
      {ready ? (
        <PostsList
          ListHeaderComponent={
            <View style={{ backgroundColor: colors.background }}>
              <PostComposer animatedPlaceholder={false} />
              <Stories />
              <View className="h-1" style={{ backgroundColor: isDarkMode ? '#141414' : colors.border }} />
            </View>
          }
          contentBottomPadding={insets.bottom}
          onOpenComments={handleOpenComments}
          onOpenPostMenu={handleOpenPostMenu}
          onReactionPickerVisibilityChange={handleReactionPickerVisibilityChange}
          edgeToEdgeMedia
          refreshing={isRefetching}
          onRefresh={handlePullToRefresh}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.background }} />
      )}
      <PostActionBottomSheet
  ref={postActionBottomSheetRef}
  onClose={handleCloseBottomSheet}
  onDelete={handleDeletePost}
  onCopyText={handleCopyText}
  postContent={selectedPostForMenu?.content}
  isOwnPost={selectedPostForMenu?.user._id === currentUser?._id}
  isAdmin={currentUser?.isAdmin}
  postOwnerName={selectedPostForMenu ? `${selectedPostForMenu.user.firstName} ${selectedPostForMenu.user.lastName}` : ''}
/>
    </View>
  );
};

export default memo(HomeScreen);
