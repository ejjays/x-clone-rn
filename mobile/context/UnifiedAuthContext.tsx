import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface UnifiedAuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  authProvider: 'firebase' | 'clerk' | null;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authProvider: null,
});

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { user: firebaseUser, isLoading: firebaseLoading } = useFirebaseAuth();
  
  const [authState, setAuthState] = useState<UnifiedAuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    authProvider: null,
  });

  useEffect(() => {
    if (clerkLoaded && !firebaseLoading) {
      let user = null;
      let authProvider = null;
      let isAuthenticated = false;

      if (firebaseUser) {
        user = firebaseUser;
        authProvider = 'firebase';
        isAuthenticated = true;
      } else if (clerkUser) {
        user = clerkUser;
        authProvider = 'clerk';
        isAuthenticated = true;
      }

      setAuthState({
        user,
        isAuthenticated,
        isLoading: false,
        authProvider,
      });
    }
  }, [clerkUser, firebaseUser, clerkLoaded, firebaseLoading]);

  return (
    <UnifiedAuthContext.Provider value={authState}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuthContext = () => {
  return useContext(UnifiedAuthContext);
};
