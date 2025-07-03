import { useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@clerk/clerk-expo"
import { useApiClient, userApi } from "../utils/api"

export const useUserSync = () => {
  const { isSignedIn } = useAuth()
  const api = useApiClient()

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: (response: any) => {
      console.log("✅ User synced successfully:", response.data.user)
    },
    onError: (error: any) => {
      console.error("❌ User sync failed:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        url: error.config?.url,
      })
    },
    retry: 2, // Retry failed sync attempts
    retryDelay: 2000, // Wait 2 seconds between retries
  })

  // auto-sync user when signed in
  useEffect(() => {
    if (isSignedIn && !syncUserMutation.data && !syncUserMutation.isError) {
      console.log("🔄 Attempting to sync user...")
      syncUserMutation.mutate()
    }
  }, [isSignedIn])

  return {
    isSyncing: syncUserMutation.isPending,
    syncError: syncUserMutation.error,
    retrySync: () => syncUserMutation.mutate(),
  }
}
