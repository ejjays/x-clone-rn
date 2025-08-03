import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { View, Text, TouchableOpacity } from "react-native";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { useTheme } from "@/context/ThemeContext";

interface PostsListProps {
  username?: string;
  onOpenComments?: (postId: string) => void;
  onOpenPostMenu: (post: Post) => void; 
}

const PostsList = ({
  username,
  onOpenComments,
  onOpenPostMenu, 
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
      <View className="p-8 items-center" style={{ backgroundColor: colors.background }}>
        <Text className="mb-4" style={{ color: colors.textMuted }}>Failed to load posts</Text>
        <TouchableOpacity className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.blue }} onPress={() => refetch()}>
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
      <View className="p-8 items-center" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.textMuted }}>No posts yet</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background }}>
      {posts.map((post: Post, index: number) => (
        <View key={post._id}>
          <PostCard
            post={post}
            reactToPost={reactToPost}
            onDelete={deletePost}
            onComment={onOpenComments || (() => {})}
            currentUser={currentUser}
            currentUserReaction={getCurrentUserReaction(post.reactions, currentUser)}
            onOpenPostMenu={onOpenPostMenu}
          />
          {index < posts.length - 1 && <View className="h-1" style={{ backgroundColor: colors.border }} />}
        </View>
      ))}
    </View>
  );
};

export default PostsList;
