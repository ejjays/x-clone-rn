import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { View, Text, TouchableOpacity, FlatList, ListRenderItem, RefreshControl } from "react-native";
import PostCard from "./PostCard";
import PostCardSkeleton from "././PostCardSkeleton";
import ReelsStrip from "@/components/ReelsStrip";
import { useTheme } from "@/context/ThemeContext";

interface PostsListProps {
  username?: string;
  onOpenComments?: (postId: string) => void;
  onOpenPostMenu: (post: Post) => void;
  onReactionPickerVisibilityChange?: (isVisible: boolean) => void;
  edgeToEdgeMedia?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  contentBottomPadding?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  refreshControlBackgroundColor?: string;
}

const PostsList = ({
  username,
  onOpenComments,
  onOpenPostMenu,
  onReactionPickerVisibilityChange,
  edgeToEdgeMedia,
  ListHeaderComponent,
  contentBottomPadding,
  refreshing,
  onRefresh,
  refreshControlBackgroundColor,
}: PostsListProps) => {
  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const {
    posts,
    isLoading: isPostsLoading,
    error,
    refetch,
    reactToPost,
    deletePost,
    getCurrentUserReaction,
  } = usePosts(username);
  const { colors, isDarkMode } = useTheme(); // Use useTheme hook

  if (isPostsLoading || isUserLoading) {
    return (
      <View style={{ backgroundColor: colors.background }}>
        {[...Array(3)].map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="p-8 items-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text className="mb-4" style={{ color: colors.textMuted }}>
          Failed to load posts
        </Text>
        <TouchableOpacity
          className="px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.blue }}
          onPress={() => refetch()}
        >
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (posts.length === 0) {
    return (
      <View
        className="p-8 items-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.textMuted }}>No posts yet</Text>
      </View>
    );
  }

  const filteredPosts = posts.filter((post: Post) => !post.video);
  const firstFour = filteredPosts.slice(0, 4);
  const rest = filteredPosts.slice(4);

  const renderItem: ListRenderItem<Post> = ({ item, index }) => {
    const insertReels = index === 3; // after the 4th post (0-based index)
    return (
      <View>
        <PostCard
          post={item}
          reactToPost={reactToPost}
          onDelete={deletePost}
          onComment={onOpenComments || (() => {})}
          currentUser={currentUser}
          currentUserReaction={getCurrentUserReaction(item.reactions, currentUser)}
          onOpenPostMenu={onOpenPostMenu}
          onReactionPickerVisibilityChange={onReactionPickerVisibilityChange}
          edgeToEdgeMedia={edgeToEdgeMedia}
        />
        {insertReels && (
          <>
            <View className="h-1" style={{ backgroundColor: isDarkMode ? '#141414' : colors.border }} />
            <ReelsStrip />
            <View className="h-1" style={{ backgroundColor: isDarkMode ? '#141414' : colors.border }} />
          </>
        )}
        {index < filteredPosts.length - 1 && !insertReels && (
          <View className="h-1" style={{ backgroundColor: isDarkMode ? '#141414' : colors.border }} />
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={filteredPosts}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{ backgroundColor: colors.background, paddingBottom: contentBottomPadding ?? 0 }}
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={6}
      windowSize={9}
      updateCellsBatchingPeriod={40}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || false}
          onRefresh={onRefresh || (() => {})}
          tintColor={colors.refreshControlColor} // Color of the refresh indicator
          progressBackgroundColor={refreshControlBackgroundColor} // Background color of the refresh indicator
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default PostsList;
