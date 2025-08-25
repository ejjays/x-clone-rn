import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useEffect, useRef, useState, useCallback } from "react";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useApiClient, pushApi } from "@/utils/api";

export type NotificationPreferences = {
  messages: boolean;
  follows: boolean;
  postReactions: boolean;
  mentions: boolean;
  system: boolean;
};

export type UsePushNotificationsReturn = {
  pushToken: string | null;
  permissionsGranted: boolean;
  requestPermissions: () => Promise<boolean>;
  updatePreferences: (enabled: boolean, preferences?: Partial<NotificationPreferences>) => Promise<void>;
  sendTestNotification: (payload?: Partial<Notifications.NotificationContentInput>) => Promise<void>;
};

// Display notifications while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("Permission for notifications not granted");
    return null;
  }

  const projectId = (Constants.expoConfig as any)?.extra?.eas?.projectId || (Constants as any)?.easConfig?.projectId;
  if (!projectId) {
    console.warn("Missing EAS projectId; push token generation may fail");
  }

  const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
  token = tokenResp.data;

  if (Device.platform === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      enableVibrate: true,
      showBadge: true,
      sound: "default",
    });
  }

  return token;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const { isSignedIn } = useAuth();
  const api = useApiClient();

  const requestPermissions = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === "granted";
    setPermissionsGranted(granted);
    return granted;
  }, []);

  const registerTokenWithBackend = useCallback(async (token: string) => {
    try {
      await pushApi.registerToken(api, token);
    } catch (e) {
      console.error("Failed to register push token with backend", e);
    }
  }, [api]);

  const updatePreferences = useCallback(async (enabled: boolean, preferences?: Partial<NotificationPreferences>) => {
    try {
      await pushApi.toggle(api, enabled, preferences);
    } catch (e) {
      console.error("Failed to update notification preferences", e);
    }
  }, [api]);

  const sendTestNotification = useCallback(async (payload?: Partial<Notifications.NotificationContentInput>) => {
    try {
      await pushApi.sendSelf(api, {
        title: payload?.title || "Test notification",
        body: payload?.body || "This is a test from the app",
        data: payload?.data || { type: "system", test: true },
      });
    } catch (e) {
      console.error("Failed to send test notification", e);
    }
  }, [api]);

  useEffect(() => {
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        setPermissionsGranted(Boolean(token));
        if (token) {
          setPushToken(token);
          if (isSignedIn) {
            await registerTokenWithBackend(token);
          }
        }
      } catch (e) {
        console.error("Error during push registration", e);
      }
    })();
  }, [isSignedIn, registerTokenWithBackend]);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // No-op: foreground notifications displayed by handler above
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = (response.notification.request.content.data || {}) as any;
        const type = data?.type;
        if (type === "chat_message" && data?.channelId) {
          router.push(`/chat/${encodeURIComponent(String(data.channelId))}`);
        }
      } catch {}
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return { pushToken, permissionsGranted, requestPermissions, updatePreferences, sendTestNotification };
}

