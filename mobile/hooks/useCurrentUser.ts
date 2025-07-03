import { useQuery } from "@tanstack/react-query"
import { useApiClient, userApi } from "../utils/api"

export const useCurrentUser = () => {
  const api = useApiClient()

  const {
    data: currentUser,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => userApi.getCurrentUser(api),
    select: (response) => response.data.user,
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error("❌ Failed to fetch current user:", error)
    },
  })

  console.log("👤 Current user state:", {
    user: currentUser ? "✅ Loaded" : "❌ Not loaded",
    isLoading,
    error: error ? "❌ Error" : "✅ No error",
  })

  return { currentUser, isLoading, error, refetch }
}
