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
import { ActivityIndicator, View, Text, InteractionManager } from "react-native";
import { OverlayProvider, Chat } from "stream-chat-expo";
import { createStreamChatTheme } from "@/utils/StreamChatTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StreamChatProvider, useStreamChat } from "@/context/StreamChatContext";
import { StreamVideoProvider } from "@/context/StreamVideoContext";
import { useEffect, useRef, useState } from "react";
import { persistAuthState } from "@/utils/offline/network";
import { queryClient } from "@/utils/offline/network";
import { readPersistedAuthState, getIsOnline } from "@/utils/offline/network";
import { setupReactQueryPersistence, restoreReactQueryPersistence } from "@/utils/offline/persist";
import { useEffect as useReactEffect } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LogBox } from "react-native";
import {
  useFonts,
  Lato_900Black, 
} from "@expo-google-fonts/lato"; 
import {
  Poppins_600SemiBold, 
} from "@expo-google-fonts/poppins"; 
import * as Notifications from "expo-notifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useOTAUpdates } from '@/hooks/useOTAUpdates';

LogBox.ignoreLogs(["useInsertionEffect must not schedule updates"]);


const InitialLayout = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { client } = useStreamChat();
  const [fontsLoaded] = useFonts({
    Lato_900Black, 
    Poppins_600SemiBold, 
  });
  const { colors, isDarkMode } = useTheme();
  const pathname = usePathname();
  
  const { expoPushToken } = usePushNotifications();

  const { isChecking, isDownloading, error } = useOTAUpdates();
  
  const navigatedRef = useRef(false);
  const [bypassAuthLoad, setBypassAuthLoad] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [online, persisted] = await Promise.all([
          getIsOnline(),
          readPersistedAuthState(),
        ]);
        if (!cancelled && !online && persisted?.isSignedIn) {
          navigatedRef.current = true;
          setBypassAuthLoad(true);
          InteractionManager.runAfterInteractions(() => {
            setTimeout(() => {
              try { router.replace("/(tabs)"); } catch {}
            }, 50);
          });
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Text.defaultProps) {
    Text.defaultProps = {} as any;
  }
  if (!Text.defaultProps.style) {
    Text.defaultProps.style = { fontFamily: "Lato_900Black" }; 
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

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    const handleNavigation = setTimeout(async () => {
      let signedIn = isSignedIn || bypassAuthLoad;
      if (!signedIn) {
        try {
          const [online, persisted] = await Promise.all([
            getIsOnline(),
            readPersistedAuthState(),
          ]);
          if (!online && persisted?.isSignedIn) {
            signedIn = true;
          }
        } catch {}
      }
      if (cancelled) return;
      if (navigatedRef.current) return; 
      if (!signedIn) {
        router.push("/(auth)");
      } else {
        router.push("/(tabs)");
      }
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(handleNavigation);
    };
  }, [isLoaded, isSignedIn, bypassAuthLoad]);

  useEffect(() => {
    if (isLoaded) {
      persistAuthState(Boolean(isSignedIn), userId).catch(() => {});
    }
  }, [isLoaded, isSignedIn, userId]);

  useReactEffect(() => {
    restoreReactQueryPersistence(queryClient).finally(() => {
      setupReactQueryPersistence(queryClient);
    });
  }, []);

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

  if (!isLoaded && !bypassAuthLoad) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <OverlayProvider value={{ style: createStreamChatTheme(isDarkMode) }}>
      <View style={{ flex: 1 }}>
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
        {/* Only wrap in Chat if client exists, otherwise render screens without Chat wrapper */}
        {client ? (
          <Chat client={client}>
            <StreamVideoProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  contentStyle: {
                    backgroundColor: colors.background,
                  },
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
                    animation: "fade",
                    freezeOnBlur: false,
                    detachPreviousScreen: true,
                  }}
                />
                <Stack.Screen
                  name="chat/[channelId]"
                  options={{
                    animation: "fade",
                    freezeOnBlur: false,
                    detachPreviousScreen: true,
                    gestureEnabled: true,
                  }}
                />
                <Stack.Screen
                  name="new-message"
                  options={{ animation: "slide_from_bottom" }}
                />
                <Stack.Screen
                  name="search-posts"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="sso-callback"
                  options={{ animation: "none" }}
                />
                <Stack.Screen
                  name="call/[channelId]"
                  options={{ presentation: "modal" }}
                />
              </Stack>
            </StreamVideoProvider>
          </Chat>
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: {
                backgroundColor: colors.background,
              },
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
            <StackScreen
              name="messages"
              options={{
                animation: "fade",
                freezeOnBlur: false,
                detachPreviousScreen: true,
              }}
            />
            <Stack.Screen
              name="chat/[channelId]"
              options={{
                animation: "fade",
                freezeOnBlur: false,
                detachPreviousScreen: true,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="new-message"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="search-posts"
              options={{ animation: "fade" }}
            />
            <Stack.Screen
              name="sso-callback"
              options={{ animation: "none" }}
            />
            <Stack.Screen
              name="call/[channelId]"
              options={{ presentation: "modal" }}
            />
          </Stack>
        )}
        <OfflineBanner queued={queued} />
      </View>
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