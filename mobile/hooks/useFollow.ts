import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { Alert } from "react-native";

export const useFollow = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: (userId: string) => userApi.followUser(api, userId),
    onSuccess: (data, userId) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      console.log("Follow/Unfollow successful:", data.data.message);
    },
    onError: (error: any) => {
      console.error("Follow/Unfollow error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update follow status"
      );
    },
  });

  const followUser = (userId: string) => {
    followMutation.mutate(userId);
  };

  return {
    followUser,
    isLoading: followMutation.isPending,
    error: followMutation.error,
  };
};
