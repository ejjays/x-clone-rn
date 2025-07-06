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
      console.error("❌ User sync failed but error was caught:", error);
    },
  });

  useEffect(() => {
    if (
      isSignedIn &&
      api && 
      !syncUserMutation.isPending && 
      !syncUserMutation.isSuccess
    ) {
      console.log("🔄 Attempting to sync user with robust hook...");
      syncUserMutation.mutate();
    }
  }, [isSignedIn, api, syncUserMutation.isPending, syncUserMutation.isSuccess]);

  return {
    isSyncing: syncUserMutation.isPending,
  };
};