import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, router } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, Text } from "react-native";
import { OverlayProvider, Chat } from "stream-chat-react-native";
import { streamChatTheme } from "@/utils/StreamChatTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StreamChatProvider, useStreamChat } from "@/context/StreamChatContext";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/context/ThemeContext"; // Import ThemeProvider
import { LogBox } from "react-native";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";

// Suppress dev warning from libraries that schedule updates in useInsertionEffect
LogBox.ignoreLogs(["useInsertionEffect must not schedule updates"]);

const queryClient = new QueryClient();

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { client } = useStreamChat();
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold });

  // Set a global default font for all Text components
  if (!Text.defaultProps) {
    Text.defaultProps = {} as any;
  }
  if (!Text.defaultProps.style) {
    Text.defaultProps.style = { fontFamily: "Poppins_400Regular" };
  } else {
    const prev = Text.defaultProps.style as any;
    const alreadyApplied = Array.isArray(prev)
      ? prev.some((s) => (s as any)?.fontFamily === "Poppins_400Regular")
      : (prev as any)?.fontFamily === "Poppins_400Regular";
    if (!alreadyApplied) {
      Text.defaultProps.style = Array.isArray(prev)
        ? [...prev, { fontFamily: "Poppins_400Regular" }]
        : [prev, { fontFamily: "Poppins_400Regular" }];
    }
  }

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/(auth)");
    } else if (isLoaded && isSignedIn) {
      router.push("/(tabs)");
    }
  }, [isLoaded, isSignedIn]);

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
    <OverlayProvider value={{ style: streamChatTheme }}>
      <StatusBar style="dark" />
      {/* Only wrap in Chat if client exists, otherwise render screens without Chat wrapper */}
      {client ? (
        <Chat client={client}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="create-post"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen name="post/[postId]" />
            <Stack.Screen name="messages" />
            <Stack.Screen name="chat/[channelId]" />
            <Stack.Screen name="new-message" />
            <Stack.Screen name="search-posts" />
            <Stack.Screen name="sso-callback" />
          </Stack>
        </Chat>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="create-post"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="post/[postId]" />
          <Stack.Screen name="messages" />
          <Stack.Screen name="chat/[channelId]" />
          <Stack.Screen name="new-message" />
          <Stack.Screen name="search-posts" />
          <Stack.Screen name="sso-callback" />
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
              <ThemeProvider>
                <InitialLayout />
              </ThemeProvider>
            </StreamChatProvider>
          </ClerkProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
