import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '1074160078106-si3mp85ntv0bq71jbrs54ha34nmspp2p.apps.googleusercontent.com',
      offlineAccess: true,
    });

    // Listen for authentication state changes
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const result = await auth().signInWithCredential(googleCredential);
      
      console.log('Firebase Auth Success:', result.user);
      return result.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Google
      await GoogleSignin.signOut();
      // Sign out from Firebase
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isSigningIn,
    signInWithGoogle,
    signOut,
  };
};
