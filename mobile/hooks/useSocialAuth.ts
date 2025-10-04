import { useOAuth } from "@clerk/clerk-expo";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useFirebaseAuth } from "./useFirebaseAuth";

WebBrowser.maybeCompleteAuthSession();

export const useSocialAuth = () => {
  const [isSocialAuthLoading, setIsSocialAuthLoading] = useState(false);
  const { startOAuthFlow: facebookOAuth } = useOAuth({
    strategy: "oauth_facebook",
  });
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: "oauth_apple" });
  const { signInWithGoogle } = useFirebaseAuth();

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
        await signInWithGoogle();
      } else {
        // For iOS, you might want to implement a different flow or use Clerk's web OAuth
        // For now, we'll just log a message.
        console.log("Google Sign-In on iOS is not implemented with Firebase in this example.");
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
      
      const message = "Failed to sign in with Google. Please try again.";
      Alert.alert("Error", message);
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