import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useApiClient, pushApi } from "@/utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const { pushToken } = usePushNotifications();
  const api = useApiClient();

  useEffect(() => {
    (async () => {
      if (isSignedIn && pushToken) {
        try {
          await pushApi.registerToken(api, pushToken);
        } catch (e) {
          // noop
        }
      }
    })();
  }, [isSignedIn, pushToken, api]);
};

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

  useEffect(() => {
    if (isSignedIn && api && !syncUserMutation.isPending && !syncUserMutation.isSuccess) {
      const task = InteractionManager.runAfterInteractions(() => {
        if (process.env.EXPO_PUBLIC_DEBUG_LOGS === "1") {
          console.log("🔄 Attempting to sync user to backend database...");
        }
        syncUserMutation.mutate();
      });
      return () => task.cancel();
    }
  }, [isSignedIn, api]);

  return {
    isSyncing: syncUserMutation.isPending,
  };
};