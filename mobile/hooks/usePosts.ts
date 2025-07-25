import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";
import type { Post, User, Reaction } from "@/types";
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

  const reactToPostMutation = useMutation({
    mutationFn: ({ postId, reactionType }: { postId: string; reactionType: string }) =>
      postApi.reactToPost(api, postId, reactionType),
    onMutate: async ({ postId, reactionType }) => {
      if (!currentUser) return;

      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData<Post[]>(queryKey);

      queryClient.setQueryData<Post[]>(queryKey, (oldPosts = []) =>
        oldPosts.map((post) => {
          if (post._id !== postId) return post;

          const newReactions = [...post.reactions];
          const existingReactionIndex = newReactions.findIndex((r) => r.user?._id === currentUser._id);

          if (existingReactionIndex > -1) {
            if (newReactions[existingReactionIndex].type === reactionType) {
              newReactions.splice(existingReactionIndex, 1);
            } else {
              newReactions[existingReactionIndex].type = reactionType;
            }
          } else {
            newReactions.push({
              _id: new Date().toISOString(), // Temporary ID for optimistic update
              user: currentUser,
              type: reactionType,
            } as Reaction);
          }
          return { ...post, reactions: newReactions };
        })
      );

      return { previousPosts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
      Alert.alert("Error", "Could not update reaction. Please try again.");
    },
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

  const getCurrentUserReaction = (reactions: Reaction[], currentUser: User | null | undefined) => {
    if (!currentUser) return null;
    return reactions.find((r) => r.user?._id === currentUser._id) || null;
  };

  return {
    posts: posts || [],
    isLoading,
    error,
    refetch,
    reactToPost: reactToPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    getCurrentUserReaction,
  };
};