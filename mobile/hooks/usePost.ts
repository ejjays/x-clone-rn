// mobile/hooks/usePost.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi, commentApi } from "../utils/api";
import type { Post } from "@/types";
import { useCurrentUser } from "./useCurrentUser";

export const usePost = (postId: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const queryKey = ["post", postId];

  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useQuery<Post>({
    queryKey,
    queryFn: async () => {
      const response = await postApi.getPost(api, postId);
      return response.data.post;
    },
    enabled: !!postId, // Only run the query if postId is available
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => commentApi.createComment(api, postId, content),
    onSuccess: (response) => {
      const newComment = response.data.comment;
      queryClient.setQueryData(queryKey, (oldData: Post | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          comments: [newComment, ...(oldData.comments || [])],
        };
      });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentApi.likeComment(api, commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousPost = queryClient.getQueryData<Post>(queryKey);

      if (!currentUser) {
        return { previousPost };
      }

      queryClient.setQueryData<Post>(queryKey, (oldPost) => {
        if (!oldPost) return undefined;
        return {
          ...oldPost,
          comments: oldPost.comments.map((c) => {
            if (c._id === commentId) {
              const isLiked = c.likes.includes(currentUser._id);
              const newLikes = isLiked
                ? c.likes.filter((id) => id !== currentUser._id)
                : [...c.likes, currentUser._id];
              return { ...c, likes: newLikes };
            }
            return c;
          }),
        };
      });
      return { previousPost };
    },
    onError: (_err, _commentId, context) => {
      queryClient.setQueryData(queryKey, context?.previousPost);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
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