import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useApiClient, userApi } from "../utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: () => {
      console.log("✅ User synced successfully (single run).");
    },
    onError: (error) => {
      console.error("❌ User sync failed:", error);
    },
  });

  useEffect(() => {
    // This robust check prevents the sync from running unnecessarily.
    // It will only run if the user is signed in, the API is ready,
    // and the sync process is not already running or successfully completed.
    if (
      isSignedIn &&
      api &&
      !syncUserMutation.isPending && // Not already running
      !syncUserMutation.isSuccess // Not already succeeded
    ) {
      console.log("🔄 Attempting to sync user...");
      syncUserMutation.mutate();
    }
  }, [isSignedIn, api, syncUserMutation.isPending, syncUserMutation.isSuccess]);

  return {
    isSyncing: syncUserMutation.isPending,
  };
};