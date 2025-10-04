import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export const useSocialAuth = () => {
  const [isSocialAuthLoading, setIsSocialAuthLoading] = useState(false);
  const { startOAuthFlow: googleOAuth } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: facebookOAuth } = useOAuth({
    strategy: "oauth_facebook",
  });
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: "oauth_apple" });
  const { signIn, setActive } = useSignIn();

  useEffect(() => {
    // Configure Google Sign-In only for Android
    if (Platform.OS === "android") {
      GoogleSignin.configure({
        webClientId:
          "1074160078106-si3mp85ntv0bq71jbrs54ha34nmspp2p.apps.googleusercontent.com",
        offlineAccess: true,
        hostedDomain: "",
        forceCodeForRefreshToken: true,
      });
    }
  }, []);

  const handleGoogleAuth = async () => {
    setIsSocialAuthLoading(true);

    try {
      if (Platform.OS === "android") {
        // Get native Google Sign-In for better UX
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        console.log("Native Google Sign-In Success:", userInfo);

        // Even though we got native sign-in, we still use Clerk's OAuth
        // but the user already authenticated, so it should be faster
        const { createdSessionId, setActive: setActiveOAuth } =
          await googleOAuth();
        if (createdSessionId) {
          setActiveOAuth!({ session: createdSessionId });
        }
      } else {
        // iOS web OAuth
        const { createdSessionId, setActive: setActiveOAuth } =
          await googleOAuth();
        if (createdSessionId) {
          setActiveOAuth!({ session: createdSessionId });
        }
      }
    } catch (error: any) {
      console.log("Google Sign-In Error:", error);

      if (Platform.OS === "android" && error.code) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          return; // User cancelled
        } else if (error.code === statusCodes.IN_PROGRESS) {
          return; // Already in progress
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert("Error", "Google Play Services not available");
          return;
        }
      }

      // Fallback to web OAuth
      try {
        const { createdSessionId, setActive: setActiveOAuth } =
          await googleOAuth();
        if (createdSessionId) {
          setActiveOAuth!({ session: createdSessionId });
        }
      } catch (fallbackError: any) {
        const message =
          fallbackError.errors?.[0]?.message ||
          "Failed to sign in with Google. Please try again.";
        Alert.alert("Error", message);
      }
    } finally {
      setIsSocialAuthLoading(false);
    }
  };

  const handleSocialAuth = async (
    strategy: "oauth_google" | "oauth_apple" | "oauth_facebook"
  ) => {
    if (strategy === "oauth_google") {
      return handleGoogleAuth();
    }

    setIsSocialAuthLoading(true);

    try {
      let startOAuthFlow;

      switch (strategy) {
        case "oauth_facebook":
          startOAuthFlow = facebookOAuth;
          break;
        case "oauth_apple":
          startOAuthFlow = appleOAuth;
          break;
        default:
          throw new Error("Invalid strategy");
      }

      const { createdSessionId, setActive: setActiveOAuth } =
        await startOAuthFlow();
      if (createdSessionId) {
        setActiveOAuth!({ session: createdSessionId });
      }
    } catch (err: any) {
      console.log("Error in social auth", JSON.stringify(err, null, 2));
      const provider = strategy.replace("oauth_", "");
      const message =
        err.errors?.[0]?.message ||
        `Failed to sign in with ${provider}. Please try again.`;
      Alert.alert("Error", message);
    } finally {
      setIsSocialAuthLoading(false);
    }
  };

  const signOutGoogle = async () => {
    try {
      if (Platform.OS === "android") {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error("Error signing out from Google:", error);
    }
  };

  return {
    isSocialAuthLoading,
    handleSocialAuth,
    signOutGoogle,
    isNativeGoogleAvailable: Platform.OS === "android",
  };
};
