import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { Alert } from "react-native";
import type { User } from "@/types";

export const useFollow = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: (userClerkId: string) => userApi.followUser(api, userClerkId),
    onMutate: async (userClerkId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["authUser"] });
      await queryClient.cancelQueries({ queryKey: ["allUsers"] });

      // Snapshot the previous values
      const previousAuthUser = queryClient.getQueryData(["authUser"]);
      const previousAllUsers = queryClient.getQueryData(["allUsers"]);

      // Get the allUsers array directly (it's already transformed by the select function)
      const allUsersArray = previousAllUsers as User[];

      // Safety check - make sure it's an array
      if (!Array.isArray(allUsersArray)) {
        console.warn("allUsers is not an array:", allUsersArray);
        return { previousAuthUser, previousAllUsers };
      }

      // Find the target user by clerkId to get their _id
      const targetUser = allUsersArray.find(
        (user: User) => user.clerkId === userClerkId
      );

      if (!targetUser) {
        console.warn("Target user not found for optimistic update");
        return { previousAuthUser, previousAllUsers };
      }

      // Optimistically update the current user's following list using the target user's _id
      queryClient.setQueryData(["authUser"], (old: any) => {
        if (!old?.data) return old;

        const currentFollowing = old.data.following || [];
        const isCurrentlyFollowing = currentFollowing.includes(targetUser._id);

        return {
          ...old,
          data: {
            ...old.data,
            following: isCurrentlyFollowing
              ? currentFollowing.filter((id: string) => id !== targetUser._id)
              : [...currentFollowing, targetUser._id],
          },
        };
      });

      // Optimistically update the target user's followers count in allUsers
      queryClient.setQueryData(["allUsers"], (oldUsers: any) => {
        if (!Array.isArray(oldUsers)) return oldUsers;

        return oldUsers.map((user: User) => {
          if (user._id === targetUser._id) {
            const currentFollowers = user.followers || [];
            const currentAuthUser = (previousAuthUser as any)?.data;

            if (!currentAuthUser) return user;

            const isCurrentlyFollowing = currentFollowers.includes(
              currentAuthUser._id
            );

            return {
              ...user,
              followers: isCurrentlyFollowing
                ? currentFollowers.filter(
                    (id: string) => id !== currentAuthUser._id
                  )
                : [...currentFollowers, currentAuthUser._id],
            };
          }
          return user;
        });
      });

      return { previousAuthUser, previousAllUsers };
    },
    onError: (error: any, userClerkId: string, context: any) => {
      // Roll back the optimistic updates
      queryClient.setQueryData(["authUser"], context?.previousAuthUser);
      queryClient.setQueryData(["allUsers"], context?.previousAllUsers);

      console.error("Follow/Unfollow error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update follow status"
      );
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
    onSuccess: (data) => {
      console.log("Follow/Unfollow successful:", data.data.message);
    },
  });

  const followUser = (userClerkId: string) => {
    followMutation.mutate(userClerkId);
  };

  return {
    followUser,
    isLoading: false,
    error: followMutation.error,
  };
};
