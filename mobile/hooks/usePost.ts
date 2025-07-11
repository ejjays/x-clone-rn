// mobile/hooks/usePost.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi, commentApi } from "../utils/api";
import type { Post, Reaction, User } from "@/types";
import { useCurrentUser } from "./useCurrentUser";
import { Alert } from "react-native";

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
    enabled: !!postId,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => commentApi.createComment(api, postId, content),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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

  const reactToPostMutation = useMutation({
    mutationFn: ({ postId, reactionType }: { postId: string; reactionType: string }) =>
      postApi.reactToPost(api, postId, reactionType),
    onMutate: async ({ reactionType }) => {
      if (!currentUser) return;

      await queryClient.cancelQueries({ queryKey });
      const previousPost = queryClient.getQueryData<Post>(queryKey);

      queryClient.setQueryData<Post>(queryKey, (oldPost) => {
        if (!oldPost) return undefined;

        const newReactions = [...(oldPost.reactions || [])];
        const existingReactionIndex = newReactions.findIndex((r) => r.user?._id === currentUser._id);

        if (existingReactionIndex > -1) {
          // If the new reaction is the same as the old, remove it (unlike)
          if (newReactions[existingReactionIndex].type === reactionType) {
            newReactions.splice(existingReactionIndex, 1);
          } else {
            // Otherwise, update the reaction type
            newReactions[existingReactionIndex].type = reactionType;
          }
        } else {
          // Add a new reaction
          newReactions.push({
            _id: new Date().toISOString(),
            user: currentUser,
            type: reactionType,
          } as Reaction);
        }
        return { ...oldPost, reactions: newReactions };
      });

      return { previousPost };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKey, context.previousPost);
      }
      Alert.alert("Error", "Could not update reaction. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
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
    reactToPost: reactToPostMutation.mutate,
    likeComment: likeCommentMutation.mutate,
  };
};