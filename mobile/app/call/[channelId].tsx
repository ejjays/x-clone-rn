// mobile/app/call/[channelId].tsx
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useStreamVideo } from "@/context/StreamVideoContext";
import {
  Call,
  CallContent,
  RTCViewPipIOS,
  useCallStateHooks,
  enterPiPAndroid,
} from "@stream-io/video-react-native-sdk";
import { useTheme } from "@/context/ThemeContext";

export default function CallScreen() {
  const params = useLocalSearchParams();
  const channelId = typeof params?.channelId === "string" ? params.channelId : undefined;
  const { client } = useStreamVideo();
  const { isDarkMode } = useTheme();
  const [joined, setJoined] = useState(false);

  const call = useMemo(() => {
    if (!client || !channelId) return null;
    // Use a 1:1 call type; adjust to your configured type if needed
    return client.call("default", channelId);
  }, [client, channelId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!call) return;
        // Create call if missing, then join with mic/camera enabled
        await call.getOrCreate({ ring: true });
        await call.join({ create: false, video: true, audio: true });
        if (!cancelled) setJoined(true);
      } catch (e) {
        // Go back if join fails
        router.back();
      }
    })();
    return () => {
      cancelled = true;
      call?.leave().catch(() => {});
    };
  }, [call]);

  // Enter Android PiP when user backgrounds
  useEffect(() => {
    if (!joined || Platform.OS !== "android") return;
    const onAppStateChange = () => {
      // SDK exposes helper to enter PiP; callers can also trigger from UI
      enterPiPAndroid();
    };
    const sub = Platform.OS === "android" ? onAppStateChange : undefined;
    return () => {
      // no-op cleanup
    };
  }, [joined]);

  if (!call) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {Platform.OS === "ios" && <RTCViewPipIOS />}
      <Call call={call}>
        <CallContent />
      </Call>
    </SafeAreaView>
  );
}

