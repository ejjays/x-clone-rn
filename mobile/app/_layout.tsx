import "react-native-gesture-handler";
import "react-native-reanimated";
import { enableScreens } from "react-native-screens";

enableScreens(true);
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, router, usePathname } from "expo-router";
import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, Text } from "react-native";
import { OverlayProvider, Chat } from "stream-chat-react-native";
import { createStreamChatTheme } from "@/utils/StreamChatTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StreamChatProvider, useStreamChat } from "@/context/StreamChatContext";
import { StreamVideoProvider } from "@/context/StreamVideoContext";
import { useEffect } from "react";
import { persistAuthState } from "@/utils/offline/network";
import { StatusBar } from "expo-status-bar";
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

  // Handle navigation and prefetching AFTER the navigation system is ready
  useEffect(() => {
    if (!isLoaded) return;

    // Use setTimeout to ensure navigation happens after the current render cycle
    const handleNavigation = setTimeout(() => {
      if (!isSignedIn) {
        router.push("/(auth)");
      } else {
        router.push("/(tabs)");
      }

      // Prefetch common routes after navigation is complete
      const routesToPrefetch = [
        "/(tabs)",
        "/(tabs)/search",
        "/(tabs)/videos",
        "/(tabs)/notifications",
        "/(tabs)/profile",
        "/messages",
        "/search-posts",
      ];

      routesToPrefetch.forEach((route) => {
        const prefetchPromise = router.prefetch(route);
        if (prefetchPromise && typeof prefetchPromise.catch === "function") {
          prefetchPromise.catch(() => {});
        }
      });
    }, 100); // Small delay to ensure navigation system is ready

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
      <StatusBar
        style={"light"}
        backgroundColor={pathname?.endsWith("/videos") ? "#000000" : "transparent"}
        translucent={pathname?.endsWith("/videos") ? false : true}
      />
      <OfflineBanner queued={queued} />
      {/* Only wrap in Chat if client exists, otherwise render screens without Chat wrapper */}
      {client ? (
        <Chat client={client}>
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
            <Stack.Screen name="messages" options={{ animation: "fade" }} />
            <Stack.Screen
              name="chat/[channelId]"
              options={{ animation: "fade" }}
            />
            <Stack.Screen
              name="new-message"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="search-posts" options={{ animation: "fade" }} />
            <Stack.Screen name="sso-callback" options={{ animation: "none" }} />
          </Stack>
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
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="chat/[channelId]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="new-message"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen name="search-posts" options={{ animation: "fade" }} />
          <Stack.Screen name="sso-callback" options={{ animation: "none" }} />
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
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider
            publishableKey={publishableKey}
            tokenCache={tokenCache}
          >
            <StreamChatProvider>
              <StreamVideoProvider>
                <ThemeProvider>
                  <InitialLayout />
                </ThemeProvider>
              </StreamVideoProvider>
            </StreamChatProvider>
          </ClerkProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}