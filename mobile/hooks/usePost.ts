// mobile/hooks/usePost.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, createComment as createCommentApi, likeComment as apiLikeComment } from "@/utils/api";
import { router } from "expo-router";

export const usePost = (postId: string) => {
  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });

  const createCommentMutation = useMutation({
    mutationFn: (commentText: string) => createCommentApi(postId, commentText),
    onSuccess: () => {
      // Refreshes the single post details page
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      // THE FIX: This also tells the main feed to refresh
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Failed to create comment:", error);
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => apiLikeComment(commentId),
    onSuccess: () => {
        // Refreshes the single post details page to show comment like
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => {
        console.error("Failed to like comment:", error);
    }
  });

  return {
    post,
    isLoading,
    error,
    refetch,
    createComment: createCommentMutation.mutate,
    isCreatingComment: createCommentMutation.isPending,
    likeComment: likeCommentMutation.mutate,
  };
};