// mobile/components/PostsList.tsx
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { View, Text, TouchableOpacity } from "react-native";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";

interface PostsListProps {
  username?: string;
  onOpenComments?: (post: Post) => void;
}

const PostsList = ({ username, onOpenComments }: PostsListProps) => {
  // --- FIX START ---
  // We need to know when the user is loading, so we get `isUserLoading` here
  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { posts, isLoading: isPostsLoading, error, refetch, toggleLike, deletePost, checkIsLiked } = usePosts(username);

  // Show skeleton placeholders if EITHER posts are loading OR the user is loading.
  if (isPostsLoading || isUserLoading) {
    return (
      <View>
        {[...Array(3)].map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </View>
    );
  }
  // --- FIX END ---

  if (error) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-500 mb-4">Failed to load posts</Text>
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // This is a safety check. If for some reason the user isn't loaded, we don't render anything.
  if (!currentUser) {
    return null;
  }
  
  if (posts.length === 0) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-500">No posts yet</Text>
      </View>
    );
  }

  return (
    <View className="bg-white">
      {posts.map((post: Post, index: number) => (
        <View key={post._id}>
          <PostCard
            post={post}
            onLike={toggleLike}
            onDelete={deletePost}
            onComment={onOpenComments || (() => {})}
            currentUser={currentUser}
            isLiked={checkIsLiked(post.likes, currentUser)}
          />
          {/* Thin divider between posts, but not after the last post */}
          {index < posts.length - 1 && <View className="h-1 bg-gray-200" />}
        </View>
      ))}
    </View>
  );
};

export default PostsList;