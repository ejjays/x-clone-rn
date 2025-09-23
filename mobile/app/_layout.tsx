import "react-native-gesture-handler";
import "react-native-reanimated";
import { enableScreens, enableFreeze } from "react-native-screens";

enableScreens(true);
enableFreeze(true);
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, router, usePathname } from "expo-router";
import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, Text } from "react-native";
import { OverlayProvider, Chat } from "stream-chat-expo";
import { createStreamChatTheme } from "@/utils/StreamChatTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StreamChatProvider, useStreamChat } from "@/context/StreamChatContext";
import { StreamVideoProvider } from "@/context/StreamVideoContext";
import { useEffect } from "react";
import { persistAuthState } from "@/utils/offline/network";
import { queryClient } from "@/utils/offline/network";
import { setupReactQueryPersistence, restoreReactQueryPersistence } from "@/utils/offline/persist";
import { useEffect as useReactEffect } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LogBox } from "react-native";
import {
  useFonts,
  Lato_900Black, // Import Lato_900Black
} from "@expo-google-fonts/lato"; // Import from lato
// ADD THESE IMPORTS FOR PUSH NOTIFICATIONS
import * as Notifications from "expo-notifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
// Add this import at the top
import { useOTAUpdates } from '@/hooks/useOTAUpdates';

// Suppress dev warning from libraries that schedule updates in useInsertionEffect
LogBox.ignoreLogs(["useInsertionEffect must not schedule updates"]);

// queryClient is centralized in utils/offline/network to keep online/focus managers consistent

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { client } = useStreamChat();
  const [fontsLoaded] = useFonts({
    Lato_900Black, // Use Lato_900Black
  });
  const { colors, isDarkMode } = useTheme();
  const pathname = usePathname();
  
  // ADD PUSH NOTIFICATIONS HOOK HERE
  const { expoPushToken } = usePushNotifications();

  // ADD THIS LINE - OTA Updates hook
  const { isChecking, isDownloading, error } = useOTAUpdates();
  
  // Set a global default font for all Text components
  if (!Text.defaultProps) {
    Text.defaultProps = {} as any;
  }
  if (!Text.defaultProps.style) {
    Text.defaultProps.style = { fontFamily: "Lato_900Black" }; // Use Lato_900Black
  } else {
    const prev = Text.defaultProps.style as any;
    const alreadyApplied = Array.isArray(prev)
      ? prev.some((s) => (s as any)?.fontFamily === "Lato_900Black")
      : (prev as any)?.fontFamily === "Lato_900Black";
    if (!alreadyApplied) {
      Text.defaultProps.style = Array.isArray(prev)
        ? [...prev, { fontFamily: "Lato_900Black" }]
        : [prev, { fontFamily: "Lato_900Black" }];
    }
  }

  // Handle navigation AFTER the navigation system is ready (no prefetch side work)
  useEffect(() => {
    if (!isLoaded) return;
    const handleNavigation = setTimeout(() => {
      if (!isSignedIn) {
        router.push("/(auth)");
      } else {
        router.push("/(tabs)");
      }
    }, 100);
    return () => clearTimeout(handleNavigation);
  }, [isLoaded, isSignedIn]);

  // Persist auth state for instant offline boot
  useEffect(() => {
    if (isLoaded) {
      persistAuthState(Boolean(isSignedIn)).catch(() => {});
    }
  }, [isLoaded, isSignedIn]);

  // Bootstrapping: restore React Query persistence once
  useReactEffect(() => {
    restoreReactQueryPersistence(queryClient).finally(() => {
      setupReactQueryPersistence(queryClient);
    });
  }, []);

  // ADD NOTIFICATION HANDLING FOR DEEP LINKING
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

  const { queued } = useOfflineSync();

  // Only block for auth loading, NOT for Stream Chat client
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  // Don't block the UI on fonts; render immediately and let fonts load in the background
  return (
    <OverlayProvider value={{ style: createStreamChatTheme(isDarkMode) }}>
      <View
        style={{ height: 0 }}
      />
      {/* StatusBar control is handled per-screen to avoid global overrides */}
      {/* <StatusBar
        style={"light"}
        backgroundColor={
          pathname?.endsWith("/videos") || pathname?.startsWith("/messages") || pathname?.startsWith("/chat") || pathname === "/new-message"
            ? "#000000"
            : "transparent"
        }
        translucent={false}
      /> */}
      <OfflineBanner queued={queued} />
      {/* Only wrap in Chat if client exists, otherwise render screens without Chat wrapper */}
      {client ? (
        <Chat client={client}>
          <StreamVideoProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                contentStyle: { backgroundColor: pathname?.endsWith("/videos") ? "black" : colors.background },
              }}
            >
              <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
              <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
              <Stack.Screen
                name="create-post"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="post/[postId]"
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="messages"
                options={{
                  animation: "none",
                  freezeOnBlur: false,
                  detachPreviousScreen: true,
                }}
              />
              <Stack.Screen
                name="chat/[channelId]"
                options={{
                  animation: "slide_from_right",
                  freezeOnBlur: false,
                  detachPreviousScreen: true,
                  gestureEnabled: true,
                }}
              />
              <Stack.Screen
                name="new-message"
                options={{ animation: "slide_from_bottom" }}
              />
              <Stack.Screen name="search-posts" options={{ animation: "fade" }} />
              <Stack.Screen name="sso-callback" options={{ animation: "none" }} />
              <Stack.Screen name="call/[channelId]" options={{ presentation: "modal" }} />
            </Stack>
          </StreamVideoProvider>
        </Chat>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: pathname?.endsWith("/videos") ? "black" : colors.background },
          }}
        >
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen
            name="create-post"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="post/[postId]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="messages"
            options={{
              animation: "none",
              freezeOnBlur: false,
              detachPreviousScreen: true,
            }}
          />
          <Stack.Screen
            name="chat/[channelId]"
            options={{
              animation: "slide_from_right",
              freezeOnBlur: false,
              detachPreviousScreen: true,
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="new-message"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen name="search-posts" options={{ animation: "fade" }} />
          <Stack.Screen name="sso-callback" options={{ animation: "none" }} />
          <Stack.Screen name="call/[channelId]" options={{ presentation: "modal" }} />
        </Stack>
      )}
    </OverlayProvider>
  );
};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <StreamChatProvider>
              <InitialLayout />
            </StreamChatProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}