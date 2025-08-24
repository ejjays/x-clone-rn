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
import { useTheme } from "@/context/ThemeContext";
import LikeIcon from "@/assets/icons/LikeIcon";

// Comment skeleton component
const CommentSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-start px-4 mb-4">
      <View
        style={{ backgroundColor: colors.surface }}
        className="w-10 h-10 rounded-full"
      />
      <View className="flex-1 ml-3">
        <View
          style={{ backgroundColor: colors.surface }}
          className="rounded-2xl px-3.5 py-2.5 mb-2"
        >
          <View
            style={{ backgroundColor: colors.border }}
            className="w-1/4 h-3 rounded mb-2"
          />
          <View
            style={{ backgroundColor: colors.border }}
            className="w-full h-4 rounded mb-1"
          />
          <View
            style={{ backgroundColor: colors.border }}
            className="w-3/4 h-4 rounded"
          />
        </View>
        <View className="flex-row items-center px-3">
          <View
            style={{ backgroundColor: colors.border }}
            className="w-12 h-3 rounded mr-4"
          />
          <View
            style={{ backgroundColor: colors.border }}
            className="w-8 h-3 rounded mr-4"
          />
          <View
            style={{ backgroundColor: colors.border }}
            className="w-10 h-3 rounded"
          />
        </View>
      </View>
    </View>
  );
};

const PostDetailsScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  if (!postId) {
    return (
      <View
        style={[styles.containerCenter, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.text }}>Post not found.</Text>
      </View>
    );
  }

  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const {
    post,
    isLoading,
    error,
    refetch,
    createComment,
    isCreatingComment,
    reactToPost,
    reactToComment,
  } = usePost(postId);
  const { currentUser } = useCurrentUser();
  const [commentText, setCommentText] = useState("");

  const handleCreateComment = () => {
    if (!commentText.trim() || !createComment) return;
    createComment(commentText.trim(), {
      onSuccess: () => {
        setCommentText("");
      },
    });
  };

  const handleLikePost = () => {
    if (post) {
      const currentUserReaction = post.reactions.find(
        (r) => r.user?._id === currentUser?._id
      );
      const newReaction = currentUserReaction?.type === "like" ? null : "like";
      reactToPost({ postId: post._id, reactionType: newReaction });
    }
  };

  const HEADER_HEIGHT = 60;

  // Show error state
  if (error && !post) {
    return (
      <View
        style={[styles.containerCenter, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.error }} className="mb-4">
          Could not load post.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.blue }}
          className="px-4 py-2 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate reactions
  const currentUserReaction = post?.reactions.find(
    (r) => r.user?._id === currentUser?._id
  );
  const isLiked = currentUserReaction?.type === "like";
  const likeCount =
    post?.reactions.filter((r) => r.type === "like").length || 0;
  const isOwnPost = post?.user._id === currentUser?._id;

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-2"
        style={{
          height: HEADER_HEIGHT,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity onPressIn={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4" style={{ color: colors.text }}>
          {post?.user.firstName || "User"}'s Post
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === "ios" ? HEADER_HEIGHT : 0}
      >
        <FlatList
          data={isLoading ? Array(3).fill(null) : post?.comments || []}
          keyExtractor={(item, index) =>
            isLoading ? `skeleton-${index}` : item._id
          }
          renderItem={({ item, index }) => {
            if (isLoading) {
              return <CommentSkeleton />;
            }

            const currentUserCommentReaction = item.reactions?.find(
              (r) => r.user?._id === currentUser?._id
            );
            return (
              <CommentCard
                comment={item}
                currentUser={currentUser}
                reactToComment={reactToComment}
                currentUserCommentReaction={currentUserCommentReaction}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={styles.listContentContainer}
          ListHeaderComponent={
            <View
              className="mb-4 pb-4"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              {/* --- POST HEADER --- */}
              <View className="flex-row px-4 pt-2 pb-2 items-center">
                <Image
                  source={
                    post?.user.profilePicture
                      ? { uri: post.user.profilePicture }
                      : require("../../assets/images/default-avatar.png")
                  }
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text
                    className="font-bold text-base"
                    style={{ color: colors.text }}
                  >
                    {post?.user.firstName} {post?.user.lastName}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {post ? formatDate(post.createdAt) : ""}
                  </Text>
                </View>
                {isOwnPost && (
                  <TouchableOpacity className="p-2">
                    <Trash size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* --- POST CONTENT --- */}
              {post?.content && (
                <Text
                  className="text-base leading-5 px-4 mb-3"
                  style={{ color: colors.text }}
                >
                  {post.content}
                </Text>
              )}

              {/* --- POST IMAGE (Full aspect ratio) --- */}
              {post?.image && (
                <Image
                  source={{ uri: post.image }}
                  className="w-full"
                  style={{ aspectRatio: 1, backgroundColor: colors.surface }}
                  resizeMode="cover"
                />
              )}

              {/* --- MODERN POST ACTIONS --- */}
              <View className="flex-row justify-around py-3 mt-2 px-4">
                <TouchableOpacity
                  onPress={handleLikePost}
                  className="flex-row items-center space-x-2"
                >
                  <LikeIcon
                    userReaction={currentUserReaction?.type}
                    size={22}
                  />
                  <Text
                    className={`font-medium ml-1`}
                    style={{
                      color: isLiked ? "#E0245E" : colors.textSecondary,
                    }}
                  >
                    {formatNumber(likeCount)} Like
                  </Text>
                </TouchableOpacity>
                <View className="flex-row items-center space-x-2">
                  <CommentIcon size={22} color={colors.textSecondary} />
                  <Text
                    className="font-medium ml-1"
                    style={{ color: colors.textSecondary }}
                  >
                    {formatNumber(post?.comments?.length || 0)} Comment
                  </Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <ShareIcon size={22} color={colors.textSecondary} />
                  <Text
                    className="font-medium ml-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Share
                  </Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.containerCenter}>
                <Text style={{ color: colors.textSecondary }}>
                  No comments yet.
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-sm">
                  Be the first to comment!
                </Text>
              </View>
            ) : null
          }
        />

        {/* Comment Input Footer */}
        <View
          style={{
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom === 0 ? 16 : insets.bottom,
            paddingTop: 16,
          }}
        >
          <View className="flex-row items-center px-4">
            <Image
              source={
                currentUser?.profilePicture
                  ? { uri: currentUser.profilePicture }
                  : require("../../assets/images/default-avatar.png")
              }
              className="w-10 h-10 rounded-full mr-3"
            />
            <View
              className="flex-1 rounded-full flex-row items-center pr-2"
              style={{ backgroundColor: colors.surface }}
            >
              <TextInput
                className="flex-1 p-3 text-base"
                style={{ color: colors.text }}
                placeholder="Write a comment..."
                placeholderTextColor={colors.textMuted}
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
                  <ActivityIndicator size="small" color={colors.blue} />
                ) : (
                  <Send
                    size={22}
                    color={commentText.trim() ? colors.blue : colors.textMuted}
                  />
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
