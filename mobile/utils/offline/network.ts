// utils/offline/network.ts
import NetInfo from "@react-native-community/netinfo";
import { AppState, Platform } from "react-native";
import { onlineManager, focusManager, QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60 * 6, // 6 hours
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      networkMode: "online",
    },
    mutations: {
      networkMode: "online",
      retry: 2,
    },
  },
});

// Wire React Query onlineManager to NetInfo
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
    setOnline(isOnline);
  });
});

// Wire focusManager to AppState
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (status) => {
    handleFocus(status === "active");
  });
  return () => subscription.remove();
});

export async function getIsOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export async function persistAuthState(isSignedIn: boolean, userId?: string | null) {
  try {
    await AsyncStorage.setItem(StorageKeys.AUTH_STATE, JSON.stringify({ isSignedIn, at: Date.now() }));
    if (userId) await AsyncStorage.setItem(StorageKeys.LAST_USER_ID, userId);
  } catch {
    // ignore
  }
}

export async function readPersistedAuthState(): Promise<{ isSignedIn: boolean; userId?: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.AUTH_STATE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { isSignedIn: boolean; at: number };
    const userId = await AsyncStorage.getItem(StorageKeys.LAST_USER_ID);
    return { isSignedIn: parsed.isSignedIn, userId: userId || undefined };
  } catch {
    return null;
  }
}

