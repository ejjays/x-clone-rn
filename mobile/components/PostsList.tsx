import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { useTheme } from "@/context/ThemeContext";

interface PostsListProps {
  username?: string;
  onOpenComments?: (postId: string) => void;
  onOpenPostMenu: (post: Post) => void;
  onReactionPickerVisibilityChange?: (isVisible: boolean) => void;
}

const PostsList = ({
  username,
  onOpenComments,
  onOpenPostMenu,
  onReactionPickerVisibilityChange,
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
  const { colors } = useTheme(); // Use useTheme hook

  if (!currentUser) return null;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          reactToPost={reactToPost}
          onDelete={deletePost}
          onComment={onOpenComments || (() => {})}
          currentUser={currentUser}
          currentUserReaction={getCurrentUserReaction(
            item.reactions,
            currentUser
          )}
          onOpenPostMenu={onOpenPostMenu}
          onReactionPickerVisibilityChange={onReactionPickerVisibilityChange}
        />
      )}
      ItemSeparatorComponent={() => (
        <View className="h-1" style={{ backgroundColor: "#141414" }} />
      )}
      ListEmptyComponent={() => (
        isPostsLoading || isUserLoading ? (
          <View style={{ backgroundColor: colors.background }}>
            {[...Array(3)].map((_, idx) => (
              <PostCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </View>
        ) : error ? (
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
        ) : (
          <View
            className="p-8 items-center"
            style={{ backgroundColor: colors.background }}
          >
            <Text style={{ color: colors.textMuted }}>No posts yet</Text>
          </View>
        )
      )}
      refreshControl={
        <RefreshControl
          refreshing={isPostsLoading}
          onRefresh={refetch}
          tintColor={colors.blue}
          colors={[colors.blue]}
        />
      }
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={7}
    />
  );
};

export default PostsList;
