import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";
import { useEffect } from "react";
import { getPusher } from "../utils/pusher"; // Corrected import
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
    const pusher = getPusher();

    if (!pusher) {
      console.warn("Pusher has not been initialized yet.");
      return;
    }

    const channel = pusher.subscribe("posts-channel");

    const handleNewPost = (newPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: Post[] | undefined) => {
        return oldData ? [newPost, ...oldData] : [newPost];
      });
    };

    const handlePostLiked = (updatedPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: Post[] | undefined) => {
        // Return an empty array if oldData is undefined
        if (!oldData) return [];
        return oldData.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        );
      });
    };

    const handleNewComment = (updatedPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: Post[] | undefined) => {
        // Return an empty array if oldData is undefined
        if (!oldData) return [];
        return oldData.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        );
      });
    };

    const handlePostDeleted = (deletedPostId: string) => {
      queryClient.setQueryData(queryKey, (oldData: Post[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter((post) => post._id !== deletedPostId);
      });
    };

    channel.bind("new-post", handleNewPost);
    channel.bind("post-liked", handlePostLiked);
    channel.bind("new-comment", handleNewComment);
    channel.bind("post-deleted", handlePostDeleted);

    // This is for the presence channel to see who is online
    const presenceChannel = pusher.subscribe("presence-global");

    presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
      console.log("Online users:", Object.keys(members.members));
    });

    presenceChannel.bind("pusher:member_added", (member: any) => {
      console.log("User online:", member.id);
    });

    presenceChannel.bind("pusher:member_removed", (member: any) => {
      console.log("User offline:", member.id);
    });

    return () => {
      if (pusher) {
        pusher.unsubscribe("posts-channel");
        pusher.unsubscribe("presence-global");
      }
    };
  }, [queryClient, queryKey]);

  const likePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.likePost(api, postId),
    onSuccess: () => {
      // No need to invalidate, Pusher handles the update!
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.deletePost(api, postId),
    onSuccess: () => {
      // No need to invalidate, Pusher handles the update!
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