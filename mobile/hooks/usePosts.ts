import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";
import { useEffect } from "react";
import { getPusher } from "../utils/pusher";
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

    // --- Define Handlers ---
    const handleNewPost = (newPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        // Add new post and prevent duplicates
        const posts = [newPost, ...(oldData || [])];
        return posts.filter(
          (post, index, self) => index === self.findIndex((p) => p._id === post._id)
        );
      });
    };

    const handlePostUpdate = (updatedPost: Post) => {
      queryClient.setQueryData(queryKey, (oldData: any) =>
        (oldData || []).map((post: Post) =>
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    };

    const handlePostDeleted = (deletedPostId: string) => {
      queryClient.setQueryData(queryKey, (oldData: any) =>
        (oldData || []).filter((post: Post) => post._id !== deletedPostId)
      );
    };

    // --- Bind Events ---
    const channel = pusher.subscribe("posts-channel");
    channel.bind("new-post", handleNewPost);
    channel.bind("post-liked", handlePostUpdate);
    channel.bind("new-comment", handlePostUpdate);
    channel.bind("post-deleted", handlePostDeleted);

    const presenceChannel = pusher.subscribe("presence-global");
    presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
      console.log("Successfully subscribed to presence channel! Online users:", Object.keys(members.members));
    });
    presenceChannel.bind("pusher:member_added", (member: any) => {
      console.log("User online:", member.id);
    });
    presenceChannel.bind("pusher:member_removed", (member: any) => {
      console.log("User offline:", member.id);
    });
     presenceChannel.bind("pusher:subscription_error", (error: any) => {
      console.error("Presence channel auth failed:", error);
    });


    // --- Cleanup on Unmount ---
    return () => {
      channel.unbind_all(); // Important: remove all bindings
      pusher.unsubscribe("posts-channel");
      pusher.unsubscribe("presence-global");
    };
  }, []); // 👈 The empty array is the key to fixing the re-rendering loop!

  // --- Mutations and Helpers ---
  const likePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.likePost(api, postId),
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