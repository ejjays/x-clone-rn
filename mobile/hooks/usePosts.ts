// mobile/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";
import type { Post, User } from "@/types";
import { Alert } from "react-native";
import { useCurrentUser } from "./useCurrentUser";

export const usePosts = (username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();
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
    // THE FIX FOR INSTANT LIKES STARTS HERE
    onMutate: async (postId: string) => {
      if (!currentUser) return;

      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(queryKey);

      // 3. Optimistically update to the new value
      queryClient.setQueryData<Post[]>(queryKey, (oldPosts = []) => {
        return oldPosts.map((post) => {
          if (post._id === postId) {
            // Check if user's ID is already in the likes array
            const isLiked = post.likes.includes(currentUser._id);
            // If it is, filter it out (unlike). If not, add it (like).
            const newLikes = isLiked
              ? post.likes.filter((id) => id !== currentUser._id)
              : [...post.likes, currentUser._id];
            return { ...post, likes: newLikes };
          }
          return post;
        });
      });

      // 4. Return a context object with the snapshotted value
      return { previousPosts };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
      Alert.alert("Error", "Could not update the post. Please try again.");
    },
    // Always refetch after error or success to make sure our data is in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
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