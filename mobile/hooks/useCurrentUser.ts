import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";

export const useCurrentUser = () => {
  const api = useApiClient();
  const { isSignedIn, userId } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const { data, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["authUser", userId],
    queryFn: async () => {
      try {
        const resp = await userApi.getCurrentUser(api);
        return resp.data as User;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          console.log("User not found in DB, attempting to sync...");
          // If user not found, try to sync them
          await userApi.syncUser(api);
          // After syncing, try to get the user again
          const resp = await userApi.getCurrentUser(api);
          return resp.data as User;
        }
        throw err; // Re-throw other errors
      }
    },
    enabled: !!isSignedIn,
    retry: (failureCount: number, err: any) => {
      // Only retry if it's a 404 and we haven't retried too many times
      if (err?.response?.status === 404 && failureCount < 1) { // Only one retry for 404 specifically
        return true;
      }
      // For other errors, use default retry logic (if any) or stop retrying
      return failureCount < 3; // Example: retry other network errors 3 times
    },
    retryDelay: (attemptIndex: number) => Math.min(attemptIndex * 1000 + 500, 3000),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data && userId) {
      setCurrentUser(data as User);
      AsyncStorage.setItem(StorageKeys.USER_PROFILE(userId), JSON.stringify(data)).catch(() => {});
    }
  }, [data]);

  // Clear user state on sign out or user switch
  useEffect(() => {
    if (!isSignedIn) {
      setCurrentUser(null);
    }
  }, [isSignedIn, userId]);

  // Hydrate from storage on mount for instant offline profile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (userId) {
        const raw = await AsyncStorage.getItem(StorageKeys.USER_PROFILE(userId));
        if (raw && !cancelled) {
          try {
            const parsed = JSON.parse(raw) as User;
            setCurrentUser((prev) => prev ?? parsed);
          } catch {}
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { currentUser, setCurrentUser, isLoading, error, refetch };
};