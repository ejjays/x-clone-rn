// mobile/app/call/[channelId].tsx
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useStreamVideo } from "@/context/StreamVideoContext";
import { useStreamChat } from "@/context/StreamChatContext";
import { useUser } from "@clerk/clerk-expo";
import {
  StreamCall,
  CallContent,
  RTCViewPipIOS,
  enterPiPAndroid,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { useTheme } from "@/context/ThemeContext";

export default function CallScreen() {
  const params = useLocalSearchParams();
  const channelId = typeof params?.channelId === "string" ? params.channelId : undefined;
  const otherFromParams = typeof (params as any)?.other === "string" ? (params as any).other : undefined;
  const { client } = useStreamVideo();
  const { client: chatClient } = useStreamChat();
  const { user: clerkUser } = useUser();
  const { isDarkMode } = useTheme();
  const [joined, setJoined] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | undefined>(otherFromParams);

  const call = useMemo(() => {
    if (!client || !channelId) return null;
    // Use a 1:1 call type; adjust to your configured type if needed
    return client.call("default", channelId);
  }, [client, channelId]);

  // Resolve otherUserId if not provided via params
  useEffect(() => {
    (async () => {
      if (otherUserId || !chatClient || !channelId) return;
      try {
        const ch = chatClient.channel("messaging", channelId);
        await ch.watch();
        const membersArray = Array.isArray(ch.state.members)
          ? ch.state.members
          : Object.values(ch.state.members || {});
        const other = membersArray.find((m: any) => m?.user?.id && m.user.id !== clerkUser?.id);
        if (other?.user?.id) setOtherUserId(other.user.id);
      } catch {}
    })();
  }, [chatClient, channelId, otherUserId, clerkUser?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!call) return;
        // Ensure both participants are members; ring only from a single, deterministic initiator
        const selfId = clerkUser?.id;
        const peerId = otherUserId;
        const haveBoth = Boolean(selfId && peerId);
        const isInitiator = haveBoth ? String(selfId) < String(peerId) : false;
        const members = haveBoth ? [{ user_id: String(selfId) }, { user_id: String(peerId) }] : undefined;
        await call.getOrCreate({ ring: isInitiator, data: members ? { members } : undefined } as any);
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
  }, [call, clerkUser?.id, otherUserId]);

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

  // Hide Android navigation bar while this screen is focused
  useEffect(() => {
    let active = true;
    (async () => {
      if (Platform.OS === "android") {
        try {
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBehaviorAsync("overlay-swipe");
          await NavigationBar.setBackgroundColorAsync("transparent");
        } catch {}
      }
    })();
    return () => {
      active = false;
      if (Platform.OS === "android") {
        try {
          NavigationBar.setVisibilityAsync("visible");
          NavigationBar.setBehaviorAsync("inset-swipe");
        } catch {}
      }
    };
  }, []);

  if (!call) return null;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden />
      {Platform.OS === "ios" && <RTCViewPipIOS />}
      <StreamCall call={call}>
        <CallContent />
      </StreamCall>
    </View>
  );
}

// Using built-in Stream call controls via <CallContent />

