import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useEffect, useRef, useState } from "react";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useApiClient } from "@/utils/api";
import { useAuth } from "@clerk/clerk-expo";

type PushPermissionStatus = "undetermined" | "granted" | "denied";

export const usePushNotifications = () => {
  const api = useApiClient();
  const { isSignedIn } = useAuth();
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const receivedListener = useRef<Notifications.Subscription | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PushPermissionStatus>("undetermined");
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Configure notification handling behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!Device.isDevice) return;
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus: Notifications.PermissionStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        setPermissionStatus(finalStatus === "granted" ? "granted" : finalStatus === "denied" ? "denied" : "undetermined");
        if (finalStatus !== "granted") {
          return;
        }

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            sound: "default",
          });
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        setPushToken(token);
      } catch (e) {
        // noop
      }
    })();
  }, []);

  // Register or update token on backend when available and signed in
  useEffect(() => {
    (async () => {
      if (!pushToken || !isSignedIn) return;
      try {
        await api.post("/push/register-token", { token: pushToken });
        setIsRegistered(true);
      } catch (e) {
        setIsRegistered(false);
      }
    })();
  }, [pushToken, isSignedIn]);

  // Listeners for foreground notifications and taps
  useEffect(() => {
    receivedListener.current = Notifications.addNotificationReceivedListener(() => {
      // Could update in-app badge, etc.
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      // Navigation is handled at app root
    });
    return () => {
      receivedListener.current && Notifications.removeNotificationSubscription(receivedListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const toggleNotifications = async (enabled: boolean) => {
    try {
      await api.post("/push/toggle-notifications", { enabled });
    } catch {}
  };

  const sendTestNotification = async (payload?: { title?: string; body?: string }) => {
    try {
      await api.post("/push/send-notification", {
        toSelf: true,
        title: payload?.title || "Test Notification",
        body: payload?.body || "This is a test notification",
        data: { type: "test" },
      });
    } catch {}
  };

  return {
    permissionStatus,
    pushToken,
    isRegistered,
    toggleNotifications,
    sendTestNotification,
  };
};

