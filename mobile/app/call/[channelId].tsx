// mobile/app/call/[channelId].tsx
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, View, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useStreamVideo } from "@/context/StreamVideoContext";
import {
  StreamCall,
  CallContent,
  RTCViewPipIOS,
  enterPiPAndroid,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { Ionicons } from "@expo/vector-icons";
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
      <StreamCall call={call}>
        <CallContent CallControls={FloatingControls} />
      </StreamCall>
    </SafeAreaView>
  );
}

const FloatingControls = () => {
  const call = useCall();
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera, isEnabled: isCamOn } = useCameraState();
  const { microphone, isEnabled: isMicOn } = useMicrophoneState();

  const toggleMic = async () => {
    if (isMicOn) await microphone?.disable(); else await microphone?.enable();
  };
  const toggleCam = async () => {
    if (isCamOn) await camera?.disable(); else await camera?.enable();
  };
  const flipCam = async () => {
    await camera?.flip();
  };
  const hangup = async () => {
    await call?.leave();
    router.back();
  };

  return (
    <View style={styles.controlsContainer} pointerEvents="box-none">
      <View style={styles.controlsRow}>
        <RoundButton onPress={toggleMic} bg={isMicOn ? "#222" : "#E11D48"}>
          <Ionicons name={isMicOn ? "mic" : "mic-off"} size={22} color="#fff" />
        </RoundButton>
        <RoundButton onPress={toggleCam} bg={isCamOn ? "#222" : "#E11D48"}>
          <Ionicons name={isCamOn ? "videocam" : "videocam-off"} size={22} color="#fff" />
        </RoundButton>
        <RoundButton onPress={flipCam} bg="#222">
          <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
        </RoundButton>
        <RoundButton onPress={hangup} bg="#DC2626">
          <Ionicons name="call" size={22} color="#fff" />
        </RoundButton>
      </View>
    </View>
  );
};

const RoundButton = ({ children, onPress, bg }: { children: React.ReactNode; onPress: () => void; bg: string }) => (
  <Pressable onPress={onPress} style={[styles.roundBtn, { backgroundColor: bg }]}>
    {children}
  </Pressable>
);

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: "center",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
  },
  roundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

