import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";

import { api } from "@/utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const syncUser = async () => {
      try {
        console.log("Attempting to sync user...");
        await api.post("/users/sync");
        console.log("User sync completed successfully.");
      } catch (error) {
        console.error("Failed to sync user:", error);
        // This catch block prevents the app from crashing.
        // We can add more robust error handling here later if needed,
        // like showing a message to the user.
      }
    };

    if (isSignedIn) {
      syncUser();
    }
  }, [isSignedIn]);
};