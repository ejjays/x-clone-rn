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

  const reactToCommentMutation = useMutation({
    mutationFn: ({ commentId, reactionType }: { commentId: string; reactionType: string | null }) =>
      commentApi.reactToComment(api, commentId, reactionType),
    onMutate: async ({ commentId, reactionType }) => {
      if (!currentUser) return;

      await queryClient.cancelQueries({ queryKey });
      const previousPost = queryClient.getQueryData<Post>(queryKey);

      queryClient.setQueryData<Post>(queryKey, (oldPost) => {
        if (!oldPost) return undefined;

        return {
          ...oldPost,
          comments: oldPost.comments.map((comment) => {
            if (comment._id === commentId) {
              const newReactions = [...(comment.reactions || [])];
              const existingReactionIndex = newReactions.findIndex((r) => r.user?._id === currentUser._id);

              if (existingReactionIndex > -1) {
                if (reactionType === null) {
                  // Remove reaction if reactionType is null
                  newReactions.splice(existingReactionIndex, 1);
                } else if (newReactions[existingReactionIndex].type === reactionType) {
                  // If the new reaction is the same as the old, remove it (toggle off)
                  newReactions.splice(existingReactionIndex, 1);
                } else {
                  // Otherwise, update the reaction type
                  newReactions[existingReactionIndex].type = reactionType;
                }
              } else if (reactionType !== null) {
                // Add a new reaction if reactionType is not null
                newReactions.push({
                  _id: new Date().toISOString(),
                  user: currentUser,
                  type: reactionType,
                } as Reaction);
              }
              return { ...comment, reactions: newReactions };
            }
            return comment;
          }),
        };
      });

      return { previousPost };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKey, context.previousPost);
      }
      Alert.alert("Error", "Could not update comment reaction. Please try again.");
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
    reactToComment: reactToCommentMutation.mutate,
  };
};