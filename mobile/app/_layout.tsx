// mobile/app/_layout.tsx

import { ClerkProvider, useAuth } from "@clerk/clerk-expo"
import { tokenCache } from "@clerk/clerk-expo/token-cache"
import { Stack } from "expo-router"
import "../global.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ActivityIndicator, View } from "react-native"
import { OverlayProvider, Chat } from "stream-chat-react-native"
import { streamChatTheme } from "@/utils/StreamChatTheme"
import { useEffect } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { StreamChatProvider, useStreamChat } from "@/context/StreamChatContext" // 👈 IMPORT THE PROVIDER

const queryClient = new QueryClient()

const InitialLayout = () => {
  const { isLoaded } = useAuth()
  const { client } = useStreamChat() // 👈 Use the context hook

  if (!isLoaded || !client) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    )
  }

  return (
    <OverlayProvider value={{ style: streamChatTheme }}>
      <Chat client={client}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          {/* 👇 ADD THE NEW SCREEN LINE RIGHT HERE 👇 */}
          <Stack.Screen name="create-post" options={{ presentation: "modal" }} />
          <Stack.Screen name="chat/[channelId]" />
          <Stack.Screen name="new-message" />
        </Stack>
      </Chat>
    </OverlayProvider>
  )
}

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key")
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <StreamChatProvider>
              <InitialLayout />
            </StreamChatProvider>
          </ClerkProvider>
          <StatusBar style="dark" />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}