import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePosts } from "@/hooks/usePosts"
import type { Post } from "@/types"
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native"
import PostCard from "./PostCard"

interface PostsListProps {
  username?: string
  onOpenComments?: (post: Post) => void // Make this optional
}

const PostsList = ({ username, onOpenComments }: PostsListProps) => {
  const { currentUser, isLoading: isUserLoading } = useCurrentUser()
  const { posts, isLoading: isPostsLoading, error, refetch, toggleLike, deletePost, checkIsLiked } = usePosts(username)

  if (isUserLoading || isPostsLoading) {
    return (
      <View className="p-8 items-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text className="text-gray-500 mt-2">Loading...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-500 mb-4">Failed to load posts</Text>
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (posts.length === 0) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-500">No posts yet</Text>
      </View>
    )
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
  )
}

export default PostsList
