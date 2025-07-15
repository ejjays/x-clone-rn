import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useApiClient, userApi } from "../utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: () => {
      console.log("✅ User synced successfully. Triggering refetch for current user...");
      // After a successful sync, invalidate the 'authUser' query.
      // This will cause useCurrentUser to refetch the data, which should now exist.
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("❌ User sync failed:", error);
    },
  });

  useEffect(() => {
    // This effect runs when the user signs in. It will only try to sync once
    // per session unless the mutation is reset.
    if (isSignedIn && api && !syncUserMutation.isPending && !syncUserMutation.isSuccess) {
      console.log("🔄 Attempting to sync user to backend database...");
      syncUserMutation.mutate();
    }
  }, [isSignedIn, api]); // Simplified dependencies

  return {
    isSyncing: syncUserMutation.isPending,
  };
};