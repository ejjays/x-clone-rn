import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";

export const useSocialAuth = () => {
  const [isSocialAuthLoading, setIsSocialAuthLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple" | "oauth_facebook") => {
    setIsSocialAuthLoading(true);
    try {
      // By removing `redirectUrl`, Clerk will automatically use the first redirect URL
      // you have configured in your Clerk Dashboard. This is the recommended approach.
      const ssoFlow = await startSSOFlow({
        strategy,
      });

      if (ssoFlow.createdSessionId && ssoFlow.setActive) {
        await ssoFlow.setActive({ session: ssoFlow.createdSessionId });
      } else if (ssoFlow.externalVerificationRedirectURL) {
        // This case handles external verification steps if needed.
        // For standard social auth, this might not be hit often.
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

  return { isSocialAuthLoading, handleSocialAuth };
};