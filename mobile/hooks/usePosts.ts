// mobile/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";
import type { Post, User } from "@/types";
import { Alert } from "react-native";

export const usePosts = (username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const queryKey = username ? ["posts", username] : ["posts"];

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

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => postApi.likePost(api, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      console.error("Like error:", err);
      Alert.alert("Error", "Could not like the post.");
    },
  });

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