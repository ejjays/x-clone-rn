import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useEffect, useState } from "react";
import type { User } from "@/types";

export const useCurrentUser = () => {
  const api = useApiClient();
  const { isSignedIn, userId } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const { data, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["authUser", userId],
    queryFn: async () => {
      const resp = await userApi.getCurrentUser(api);
      return resp.data as User;
    },
    enabled: !!isSignedIn,
    retry: (failureCount: number, err: any) => {
      if (err?.response?.status === 404 && failureCount < 3) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex: number) => Math.min(attemptIndex * 1000 + 500, 3000),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setCurrentUser(data as User);
    }
  }, [data]);

  // Clear user state on sign out or user switch
  useEffect(() => {
    if (!isSignedIn) {
      setCurrentUser(null);
    }
  }, [isSignedIn, userId]);

  return { currentUser, setCurrentUser, isLoading, error, refetch };
};