import { useClerk } from "@clerk/clerk-expo";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";

export const useSignOut = () => {
  const { signOut } = useClerk();
  const [isSignOutAlertVisible, setIsSignOutAlertVisible] = useState(false);

  const handleSignOut = () => {
    setIsSignOutAlertVisible(true);
  };

  const confirmSignOut = async () => {
    setIsSignOutAlertVisible(false);
    try {
      await signOut();
    } finally {
      await AsyncStorage.multiRemove([StorageKeys.AUTH_STATE, StorageKeys.LAST_USER_ID]).catch(() => {});
    }
  };

  const cancelSignOut = () => {
    setIsSignOutAlertVisible(false);
  };

  return {
    handleSignOut,
    isSignOutAlertVisible,
    confirmSignOut,
    cancelSignOut,
  };
};