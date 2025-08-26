import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { InteractionManager } from "react-native";
import { useApiClient, userApi } from "../utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: () => {
      if (process.env.EXPO_PUBLIC_DEBUG_LOGS === "1") {
        console.log("✅ User synced successfully. Triggering refetch for current user...");
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("❌ User sync failed:", error);
    },
  });

  // Trigger ONCE per sign-in session to avoid infinite loops on 503
  useEffect(() => {
    if (isSignedIn && !syncUserMutation.isPending && !syncUserMutation.isSuccess) {
      const task = InteractionManager.runAfterInteractions(() => {
        if (process.env.EXPO_PUBLIC_DEBUG_LOGS === "1") {
          console.log("🔄 Attempting to sync user to backend database...");
        }
        syncUserMutation.mutate();
      });
      return () => task.cancel();
    }
  }, [isSignedIn]);

  return {
    isSyncing: syncUserMutation.isPending,
  };
};