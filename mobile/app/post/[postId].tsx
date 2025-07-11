// mobile/app/post/[postId].tsx
import { useLocalSearchParams, router } from "expo-router";
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
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send, Heart, Trash } from "lucide-react-native";
import { usePost } from "@/hooks/usePost";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CommentCard from "@/components/CommentCard";
import { useState } from "react";
import { formatDate, formatNumber } from "@/utils/formatters";
import CommentIcon from "@/assets/icons/Comment";
import ShareIcon from "@/assets/icons/ShareIcon";

const PostDetailsScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  if (!postId) {
    return (
      <View style={styles.containerCenter}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  const insets = useSafeAreaInsets();
  const { post, isLoading, error, refetch, createComment, isCreatingComment, likeComment, reactToPost } = usePost(postId);
  const { currentUser } = useCurrentUser();
  const [commentText, setCommentText] = useState("");

  const handleCreateComment = () => {
    if (!commentText.trim() || !createComment) return;
    // @ts-ignore
    createComment(commentText.trim(), {
      onSuccess: () => {
        setCommentText("");
      },
    });
  };

  const handleLikePost = () => {
    if (post) {
      reactToPost({ postId: post._id, reactionType: 'like' });
    }
  };

  const HEADER_HEIGHT = 60;

  if (isLoading) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.containerCenter}>
        <Text className="text-red-500 mb-4">Could not load post.</Text>
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnPost = post.user._id === currentUser?._id;
  const currentUserReaction = post.reactions.find(r => r.user?._id === currentUser?._id);
  const isLiked = currentUserReaction?.type === 'like';
  const likeCount = post.reactions.filter(r => r.type === 'like').length;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 border-b border-gray-200" style={{ height: HEADER_HEIGHT }}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#1C1E21" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 ml-4">{post.user.firstName}'s Post</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === "ios" ? HEADER_HEIGHT : 0}
      >
        <FlatList
          data={post.comments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CommentCard comment={item} currentUser={currentUser} onLike={likeComment} />}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={styles.listContentContainer}
          ListHeaderComponent={
            <View className="mb-4 border-b border-gray-200 pb-4">
              {/* --- POST HEADER --- */}
              <View className="flex-row px-4 pt-2 pb-2 items-center">
                <Image source={{ uri: post.user.profilePicture || "" }} className="w-12 h-12 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-base">
                    {post.user.firstName} {post.user.lastName}
                  </Text>
                  <Text className="text-gray-500 text-sm">{formatDate(post.createdAt)}</Text>
                </View>
                {isOwnPost && (
                  <TouchableOpacity className="p-2">
                    <Trash size={20} color="#657786" />
                  </TouchableOpacity>
                )}
              </View>

              {/* --- POST CONTENT --- */}
              {post.content && <Text className="text-gray-900 text-base leading-5 px-4 mb-3">{post.content}</Text>}

              {/* --- POST IMAGE (Edge-to-edge) --- */}
              {post.image && <Image source={{ uri: post.image }} className="w-full h-80 bg-gray-200" resizeMode="cover" />}
              
              {/* --- POST ACTIONS --- */}
              <View className="flex-row justify-around py-3 mt-2 px-4">
                <TouchableOpacity onPress={handleLikePost} className="flex-row items-center space-x-2">
                  <Heart size={22} color={isLiked ? "#E0245E" : "#657786"} fill={isLiked ? "#E0245E" : "none"} />
                  <Text className={`font-medium ml-1 ${isLiked ? "text-red-500" : "text-gray-500"}`}>
                    {formatNumber(likeCount)} Like
                  </Text>
                </TouchableOpacity>
                <View className="flex-row items-center space-x-2">
                  <CommentIcon size={22} color="#657786" />
                  <Text className="text-gray-500 font-medium ml-1">{formatNumber(post.comments?.length || 0)} Comment</Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <ShareIcon size={22} color="#657786" />
                  <Text className="text-gray-500 font-medium ml-1">Share</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.containerCenter}>
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
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  containerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  listContentContainer: {
    paddingTop: 16,
    flexGrow: 1,
  },
});

export default PostDetailsScreen;