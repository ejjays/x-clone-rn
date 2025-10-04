import { useOAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useFirebaseAuth } from "./useFirebaseAuth";

WebBrowser.maybeCompleteAuthSession();

export const useUnifiedAuth = () => {
  const [isSocialAuthLoading, setIsSocialAuthLoading] = useState(false);
  
  // Firebase for Google (native)
  const { signInWithGoogle: firebaseGoogleSignIn, user: firebaseUser, isLoading: firebaseLoading } = useFirebaseAuth();
  
  // Clerk for Facebook and Apple (web-based)
  const { startOAuthFlow: facebookOAuth } = useOAuth({ strategy: "oauth_facebook" });
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: "oauth_apple" });

  const handleGoogleAuth = async () => {
    setIsSocialAuthLoading(true);
    try {
      if (Platform.OS === 'android') {
        // Use Firebase native Google Sign-In for Android
        console.log('Using Firebase native Google Sign-In');
        const result = await firebaseGoogleSignIn();
        console.log('Firebase Google Auth Success:', result);
        return result;
      } else {
        // For iOS, you can choose to use Firebase or fall back to Clerk
        // Using Firebase for consistency across platforms
        console.log('Using Firebase Google Sign-In for iOS');
        const result = await firebaseGoogleSignIn();
        return result;
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert("Error", "Failed to sign in with Google. Please try again.");
      throw error;
    } finally {
      setIsSocialAuthLoading(false);
    }
  };

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple" | "oauth_facebook") => {
    // Route Google authentication to Firebase
    if (strategy === "oauth_google") {
      return handleGoogleAuth();
    }

    // Handle Facebook and Apple with Clerk
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

      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
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

  // Unified sign out
  const signOut = async () => {
    try {
      // Sign out from Firebase (Google)
      if (firebaseUser) {
        const { signOut: firebaseSignOut } = useFirebaseAuth();
        await firebaseSignOut();
      }
      
      // If you also need to sign out from Clerk sessions
      // You might need to handle this based on which provider was used
      
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { 
    isSocialAuthLoading: isSocialAuthLoading || firebaseLoading,
    handleSocialAuth,
    signOut,
    user: firebaseUser, // Firebase user for Google auth
    isAuthenticated: !!firebaseUser,
  };
};
