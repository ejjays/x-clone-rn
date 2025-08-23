// mobile/hooks/useSignOut.ts
import { useClerk } from "@clerk/clerk-expo";
import { useState } from "react";

export const useSignOut = () => {
  const { signOut } = useClerk();
  const [isSignOutAlertVisible, setIsSignOutAlertVisible] = useState(false);

  const handleSignOut = () => {
    setIsSignOutAlertVisible(true);
  };

  const confirmSignOut = () => {
    setIsSignOutAlertVisible(false);
    signOut();
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