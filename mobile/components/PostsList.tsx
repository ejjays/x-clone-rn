import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { View, Text, TouchableOpacity } from "react-native";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme

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
  const { isDarkMode } = useTheme(); // Use useTheme hook

  const colors = {
    background: isDarkMode ? "#111827" : "#ffffff",
    surface: isDarkMode ? "#1f2937" : "#f3f4f6",
    text: isDarkMode ? "#ffffff" : "#111827",
    textSecondary: isDarkMode ? "#d1d5db" : "#6b7280",
    textMuted: isDarkMode ? "#9ca3af" : "#9ca3af",
    border: isDarkMode ? "#374151" : "#e5e7eb",
    blue: "#3b82f6",
    icon: isDarkMode ? "#ffffff" : "#000000",
  };

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
          <Text className="text-white font-semibold">Retry</Text>
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
            onOpenPostMenu={onOpenPostMenu} // Pass the new prop down to PostCard
          />
          {index < posts.length - 1 && <View className="h-1" style={{ backgroundColor: colors.border }} />}
        </View>
      ))}
    </View>
  );
};

export default PostsList;
