import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

// Make sure to import useApiClient
import { userApi, useApiClient } from "../utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient(); // This hook gives us our configured API client

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: (response: any) => {
      // The console log from your terminal output shows this is working in dev
      console.log("✅ User synced successfully:", response.data.user);
    },
    onError: (error: any) => {
      console.error("❌ User sync failed:", error);
    },
    retry: 2, // It's good to keep retries for network issues
    retryDelay: 2000,
  });

  useEffect(() => {
    // --- THIS IS THE FIX ---
    // We now check that we are signed in AND that the api object is ready.
    // The `api` object is only ready after `useApiClient` gets a token from Clerk.
    if (isSignedIn && api && !syncUserMutation.isSuccess) {
      console.log("🔄 Attempting to sync user...");
      syncUserMutation.mutate();
    }
    // We add `api` to the dependency array, so this effect re-runs when the
    // API client is ready.
  }, [isSignedIn, api]);

  return {
    isSyncing: syncUserMutation.isPending,
    syncError: syncUserMutation.error,
  };
};