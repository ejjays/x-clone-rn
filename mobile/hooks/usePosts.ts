// mobile/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";
import type { Post, User } from "@/types";
import { Alert } from "react-native";

export const usePosts = (username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  // This queryKey logic allows the hook to fetch all posts OR just a specific user's posts
  const queryKey = username ? ["posts", username] : ["posts"];

  // Reverted back to useQuery to correctly fetch posts
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery<Post[]>({
    queryKey,
    queryFn: async () => {
      const response = username ? await postApi.getUserPosts(api, username) : await postApi.getPosts(api);
      return response.data.posts;
    },
  });

  // This handles liking/unliking a post
  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => postApi.likePost(api, postId),
    // THE REAL-TIME FIX: After a like succeeds, invalidate the ['posts'] query to refetch data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      console.error("Like error:", err);
      Alert.alert("Error", "Could not like the post.");
    },
  });

  // This handles deleting a post
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.deletePost(api, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      console.error("Delete error:", err);
      Alert.alert("Error", "Could not delete the post.");
    },
  });

  // This helper function checks if the current user has liked a post
  const checkIsLiked = (likes: string[], currentUser: User | null | undefined) => {
    if (!currentUser) return false;
    return likes.includes(currentUser._id);
  };

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
    toggleLike: toggleLikeMutation.mutate,
    deletePost: deletePostMutation.mutate,
    checkIsLiked,
  };
};