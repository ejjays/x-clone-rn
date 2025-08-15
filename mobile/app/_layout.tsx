import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, router } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";
import { OverlayProvider, Chat } from "stream-chat-react-native";
import { streamChatTheme } from "@/utils/StreamChatTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StreamChatProvider, useStreamChat } from "@/context/StreamChatContext";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/context/ThemeContext"; // Import ThemeProvider
import { LogBox } from "react-native";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from "@expo-google-fonts/poppins";

// Suppress dev warning from libraries that schedule updates in useInsertionEffect
LogBox.ignoreLogs(["useInsertionEffect must not schedule updates"]);

const queryClient = new QueryClient();

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { client } = useStreamChat();
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_600SemiBold });

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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

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
