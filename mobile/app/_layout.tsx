import * as Notifications from "expo-notifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function RootLayout() {
  const router = useRouter();
  const { queued } = useOfflineSync();

  // Handle notification tap for deep linking to chat
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data: any = response.notification.request.content.data || {};
        if (data?.type === "chat_message" && data?.channelId) {
          router.push(`/chat/${data.channelId}`);
        }
      } catch {}
    });
    return () => sub.remove();
  }, []);

  // Only block for auth loading, NOT for Stream Chat client
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}