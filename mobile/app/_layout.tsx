import { ClerkProvider } from "@clerk/clerk-expo"
import { tokenCache } from "@clerk/clerk-expo/token-cache"
import { Stack } from "expo-router"
import "../global.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ActivityIndicator, View, AppState } from "react-native"
import { useStreamChat } from "@/hooks/useStreamChat"
import { OverlayProvider, Chat } from "stream-chat-react-native"
import { streamChatTheme } from "@/utils/StreamChatTheme"
import { useEffect } from "react"

const queryClient = new QueryClient()

// This is the main navigation component
const InitialLayout = () => {
  const { client, isConnected, isConnecting } = useStreamChat()

  // Handle app state changes to properly disconnect
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // Don't disconnect on background, just log
        console.log("📱 App went to background")
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription?.remove()
    }
  }, [])

  // Show loading only while connecting for the first time
  if (isConnecting && !client) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    )
  }

  // Render the app even if Stream Chat isn't connected yet
  // The individual screens will handle their own loading states
  return (
    <OverlayProvider value={{ style: streamChatTheme }}>
      <Chat client={client} style={streamChatTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/[channelId]" />
          <Stack.Screen name="new-message" />
        </Stack>
      </Chat>
    </OverlayProvider>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <InitialLayout />
          <StatusBar style="dark" />
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  )
}
