import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { View, Text, TouchableOpacity } from "react-native";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";

interface PostsListProps {
  username?: string;
  onOpenComments?: (postId: string) => void;
}

const PostsList = ({ username, onOpenComments }: PostsListProps) => {
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

  if (isPostsLoading || isUserLoading) {
    return (
      <View>
        {[...Array(3)].map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </View>
    );
  }

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
            reactToPost={reactToPost}
            onDelete={deletePost}
            onComment={onOpenComments || (() => {})}
            currentUser={currentUser}
            currentUserReaction={getCurrentUserReaction(post.reactions, currentUser)}
          />
          {index < posts.length - 1 && <View className="h-1 bg-gray-200" />}
        </View>
      ))}
    </View>
  );
};

export default PostsList;