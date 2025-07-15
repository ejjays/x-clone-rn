import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";

export const useCurrentUser = () => {
  const api = useApiClient();
  const { isSignedIn } = useAuth();

  const {
    data: currentUser,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => userApi.getCurrentUser(api),
    select: (response) => response.data, // Select response.data directly
    enabled: !!isSignedIn, // Only run if the user is signed in with Clerk
    retry: (failureCount, error: any) => {
      // Only retry on 404 errors for a few times.
      // This gives the user sync time to complete.
      if (error.response?.status === 404 && failureCount < 3) {
        console.log(`🔄 Retrying fetch current user (attempt ${failureCount + 1})...`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000 + 500, 3000), // Delays: 0.5s, 1.5s, 2.5s
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error("❌ Failed to fetch current user after retries:", error);
    },
  });

  return { currentUser, isLoading, error, refetch };
};