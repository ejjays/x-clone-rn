// mobile/app/post/[postId].tsx
import { useLocalSearchParams, router } from "expo-router"
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, Send } from "lucide-react-native"
import { usePost } from "@/hooks/usePost"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import PostCard from "@/components/PostCard"
import CommentCard from "@/components/CommentCard"
import { useState } from "react"

const PostDetailsScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>()
  const insets = useSafeAreaInsets()
  const { post, isLoading, error, refetch, createComment, isCreatingComment, likeComment } = usePost(postId)
  const { currentUser } = useCurrentUser()
  const [commentText, setCommentText] = useState("")

  const handleCreateComment = () => {
    if (!commentText.trim()) return
    createComment(commentText.trim(), {
      onSuccess: () => {
        setCommentText("") // Clear input after successful post
      },
    })
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    )
  }

  if (error || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-red-500 mb-4">Could not load post.</Text>
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // A non-functional callback to prevent interactions on the main post card
  const noOp = () => {}

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#1C1E21" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 ml-4">{post.user.firstName}'s Post</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <FlatList
          data={post.comments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CommentCard comment={item} currentUser={currentUser} onLike={likeComment} />}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, flexGrow: 1 }}
          ListHeaderComponent={
            // Render the main post at the top of the comment list
            <View className="mb-4 border-b border-gray-200 pb-4">
              <PostCard
                post={post}
                currentUser={currentUser!}
                isLiked={post.likes.includes(currentUser?._id ?? "")}
                onLike={noOp}
                onDelete={noOp}
                onComment={noOp}
              />
            </View>
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500">No comments yet.</Text>
              <Text className="text-gray-400 text-sm">Be the first to comment!</Text>
            </View>
          }
        />

        {/* Comment Input Footer */}
        <View
          className="bg-white border-t border-gray-200"
          style={{ paddingBottom: insets.bottom === 0 ? 16 : insets.bottom, paddingTop: 16 }}
        >
          <View className="flex-row items-center px-4">
            <Image
              source={{ uri: currentUser?.profilePicture || "" }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1 bg-gray-100 rounded-full flex-row items-center pr-2">
              <TextInput
                className="flex-1 p-3 text-base text-gray-900"
                placeholder="Write a comment..."
                placeholderTextColor="#9CA3AF"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                onPress={handleCreateComment}
                disabled={isCreatingComment || !commentText.trim()}
                className="p-2"
              >
                {isCreatingComment ? (
                  <ActivityIndicator size="small" color="#1877F2" />
                ) : (
                  <Send size={22} color={commentText.trim() ? "#1877F2" : "#9CA3AF"} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default PostDetailsScreen