import { useOAuth } from "@clerk/clerk-expo";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export const useSocialAuth = () => {
  const [isSocialAuthLoading, setIsSocialAuthLoading] = useState(false);
  const { startOAuthFlow: googleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: facebookOAuth } = useOAuth({ strategy: "oauth_facebook" });
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: "oauth_apple" });

  useEffect(() => {
    // Configure Google Sign-In only for Android
    if (Platform.OS === 'android') {
      GoogleSignin.configure({
        webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // From Google Console Web Client
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
    }
  }, []);

  const handleGoogleAuth = async () => {
    setIsSocialAuthLoading(true);
    
    try {
      // Use native Google Sign-In only on Android
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        
        console.log('Native Google Sign-In Success:', userInfo);
        
        // Use the Google token with Clerk
        const { createdSessionId, setActive } = await googleOAuth();

        if (createdSessionId) {
          setActive!({ session: createdSessionId });
        }
      } else {
        // Fallback to web-based OAuth for iOS (or any other platform)
        console.log('Using web OAuth for iOS');
        const { createdSessionId, setActive } = await googleOAuth();

        if (createdSessionId) {
          setActive!({ session: createdSessionId });
        }
      }
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      
      if (Platform.OS === 'android' && error.code) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('User cancelled Google Sign-In');
          return; // Don't show error for user cancellation
        } else if (error.code === statusCodes.IN_PROGRESS) {
          console.log('Google Sign-In already in progress');
          return;
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert('Error', 'Google Play Services not available');
          return;
        }
      }
      
      // For any other error, fallback to web OAuth
      console.log('Falling back to web OAuth');
      try {
        const { createdSessionId, setActive } = await googleOAuth();
        if (createdSessionId) {
          setActive!({ session: createdSessionId });
        }
      } catch (fallbackError: any) {
        const message = fallbackError.errors?.[0]?.message || 'Failed to sign in with Google. Please try again.';
        Alert.alert("Error", message);
      }
    } finally {
      setIsSocialAuthLoading(false);
    }
  };

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple" | "oauth_facebook") => {
    if (strategy === "oauth_google") {
      return handleGoogleAuth(); // Use our enhanced Google auth
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

  const signOutGoogle = async () => {
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
  };

  return { 
    isSocialAuthLoading, 
    handleSocialAuth, 
    signOutGoogle,
    isNativeGoogleAvailable: Platform.OS === 'android'
  };
};
