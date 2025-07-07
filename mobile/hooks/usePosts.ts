// mobile/hooks/usePosts.ts
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, likePost as apiLikePost, unlikePost as apiUnlikePost } from "@/utils/api";
import { useCurrentUser } from "./useCurrentUser";

export const usePosts = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => getPosts(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1, // Add this line
  });

  const likePostMutation = useMutation({
    mutationFn: apiLikePost,
    onSuccess: () => {
      // THE FIX: This tells the feed to refresh after a like.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Failed to like post:", error);
    }
  });

  const unlikePostMutation = useMutation({
    mutationFn: apiUnlikePost,
    onSuccess: () => {
      // THE FIX: This tells the feed to refresh after an unlike.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Failed to unlike post:", error);
    }
  });

  return {
    posts: data?.pages.flatMap((page) => page.posts) ?? [],
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
    likePost: likePostMutation.mutate,
    unlikePost: unlikePostMutation.mutate,
  };
};