// mobile/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";
import { useEffect } from "react";
import { socket } from "../utils/socket";
import { Post } from "@/types";

export const usePosts = (username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const queryKey = username ? ["userPosts", username] : ["posts"];

  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () =>
      username ? postApi.getUserPosts(api, username) : postApi.getPosts(api),
    select: (response) => response.data.posts,
  });

  useEffect(() => {
    const handleNewPost = (newPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: Post[] | undefined) => {
        return oldData ? [newPost, ...oldData] : [newPost];
      });
    };

    const handlePostLiked = (updatedPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: Post[] | undefined) => {
        return oldData
          ? oldData.map((post) =>
              post._id === updatedPost._id ? updatedPost : post
            )
          : [];
      });
    };

    const handleNewComment = (updatedPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: Post[] | undefined) => {
        return oldData
          ? oldData.map((post) =>
              post._id === updatedPost._id ? updatedPost : post
            )
          : [];
      });
    };

    const handlePostDeleted = (deletedPostId: string) => {
      queryClient.setQueryData(queryKey, (oldData: Post[] | undefined) => {
        return oldData
          ? oldData.filter((post) => post._id !== deletedPostId)
          : [];
      });
    };

    socket.on("newPost", handleNewPost);
    socket.on("postLiked", handlePostLiked);
    socket.on("newComment", handleNewComment);
    socket.on("postDeleted", handlePostDeleted);

    return () => {
      socket.off("newPost", handleNewPost);
      socket.off("postLiked", handlePostLiked);
      socket.off("newComment", handleNewComment);
      socket.off("postDeleted", handlePostDeleted);
    };
  }, [queryClient, queryKey]);

  const likePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.likePost(api, postId),
    onSuccess: () => {
      // We don't need to invalidate queries anymore, as the cache is updated via sockets
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.deletePost(api, postId),
    onSuccess: () => {
      // We don't need to invalidate queries anymore, as the cache is updated via sockets
    },
  });

  const checkIsLiked = (postLikes: string[], currentUser: any) => {
    const isLiked = currentUser && postLikes.includes(currentUser._id);
    return isLiked;
  };

  return {
    posts: postsData || [],
    isLoading,
    error,
    refetch,
    toggleLike: (postId: string) => likePostMutation.mutate(postId),
    deletePost: (postId: string) => deletePostMutation.mutate(postId),
    checkIsLiked,
  };
};