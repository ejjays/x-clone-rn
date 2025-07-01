import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";
import { useEffect } from "react";
import { getPusher } from "../utils/pusher";
import { Post } from "@/types";

export const usePosts = (username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  // This queryKey is stable and will not cause re-renders on its own.
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

  // This useEffect will now run ONLY ONCE, creating a stable Pusher connection.
  useEffect(() => {
    const pusher = getPusher();
    if (!pusher) {
      console.warn("Pusher has not been initialized yet.");
      return;
    }

    const channel = pusher.subscribe("posts-channel");
    const presenceChannel = pusher.subscribe("presence-global");

    // --- Robust Cache Handlers ---

    // Handles new posts
    const handleNewPost = (newPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        // Ensure oldData is an array before trying to spread it.
        const posts = Array.isArray(oldData) ? oldData : [];
        // Add the new post and filter out any potential duplicates.
        return [newPost, ...posts].filter(
          (post, index, self) => index === self.findIndex((p) => p._id === post._id)
        );
      });
    };

    // Handles updates (likes, new comments)
    const handlePostUpdate = (updatedPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        // Ensure oldData is an array before mapping.
        if (!Array.isArray(oldData)) return [];
        return oldData.map((post: Post) =>
          post._id === updatedPost._id ? updatedPost : post
        );
      });
    };

    // Handles post deletion
    const handlePostDeleted = (deletedPostId: string) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        // Ensure oldData is an array before filtering.
        if (!Array.isArray(oldData)) return [];
        return oldData.filter((post: Post) => post._id !== deletedPostId);
      });
    };


    // --- Bind Events to Handlers ---
    channel.bind("new-post", handleNewPost);
    channel.bind("post-liked", handlePostUpdate);
    channel.bind("new-comment", handlePostUpdate);
    channel.bind("post-deleted", handlePostDeleted);
    
    // Optional: Log presence events for debugging
    presenceChannel.bind("pusher:subscription_succeeded", () => console.log("Presence channel subscribed!"));
    presenceChannel.bind("pusher:subscription_error", (err: any) => console.error("Presence auth failed!", err));


    // --- Cleanup on Unmount ---
    // This will run when the user navigates away from the screen.
    return () => {
      channel.unbind_all();
      pusher.unsubscribe("posts-channel");
      pusher.unsubscribe("presence-global");
    };
  }, [queryClient, queryKey]); // Dependencies are stable, so this effect runs once.

  
  // --- Mutations ---
  const likePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.likePost(api, postId),
    // No onSuccess invalidation needed, Pusher handles the UI update!
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.deletePost(api, postId),
  });

  const checkIsLiked = (postLikes: string[], currentUser: any) => {
    return currentUser && postLikes.includes(currentUser._id);
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