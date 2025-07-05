import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { userApi, useApiClient } from "../utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: (response: any) => {
      console.log("✅ User synced successfully:", response.data.user);
    },
    onError: (error: any) => {
      console.error("❌ User sync failed:", error);
    },
    retry: 2,
    retryDelay: 2000,
  });

  useEffect(() => {
    // Only run if the user is signed in and sync hasn't already succeeded
    if (isSignedIn && api && !syncUserMutation.isSuccess) {
      console.log("🔄 Attempting to sync user...");
      syncUserMutation.mutate();
    }
  }, [isSignedIn, api, syncUserMutation.isSuccess]); // Add isSuccess to dependency array

  return {
    isSyncing: syncUserMutation.isPending,
    syncError: syncUserMutation.error,
  };
};