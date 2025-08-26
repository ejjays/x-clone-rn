import * as Notifications from "expo-notifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { StreamChatProvider } from "@/context/StreamChatContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";

// Create a QueryClient instance (required for StreamChatProvider)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Create a separate component for hooks that need Clerk and StreamChat
function AppContent() {
  const { queued } = useOfflineSync();
  const { expoPushToken } = usePushNotifications();

  // Handle notification tap for deep linking to chat
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const data: any = response.notification.request.content.data || {};
          if (data?.type === "chat_message" && data?.channelId) {
            router.push(`/chat/${data.channelId}`);
          }
        } catch {}
      }
    );
    return () => sub.remove();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error(
      "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <StreamChatProvider>
            <AppContent />
          </StreamChatProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </QueryClientProvider>
  );
}