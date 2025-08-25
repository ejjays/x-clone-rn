import * as Notifications from "expo-notifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function RootLayout() {
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
