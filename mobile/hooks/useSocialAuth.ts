import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";

export const useSocialAuth = () => {
  // We use `isSocialAuthLoading` to be explicit about what this state controls.
  const [isSocialAuthLoading, setIsSocialAuthLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple" | "oauth_facebook") => {
    setIsSocialAuthLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        redirectUrl: "/(auth)/login", // Make sure this matches your Clerk redirect settings
        strategy,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: any) {
      console.log("Error in social auth", JSON.stringify(err, null, 2));
      const provider = strategy.replace("oauth_", "");
      const message = err.errors?.[0]?.message || `Failed to sign in with ${provider}. Please try again.`;
      Alert.alert("Error", message);
    } finally {
      setIsSocialAuthLoading(false);
    }
  };

  // The hook now returns `isSocialAuthLoading` instead of a generic `isLoading`.
  return { isSocialAuthLoading, handleSocialAuth };
};