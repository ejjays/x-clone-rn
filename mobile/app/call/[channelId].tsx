// mobile/app/call/[channelId].tsx
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Platform, View, Pressable, StyleSheet, Animated, Text } from "react-native";
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
import { Ionicons } from "@expo/vector-icons";

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
  const [localReactions, setLocalReactions] = useState<{ id: string; emoji: string }[]>([]);
  const emitLocalReaction = useCallback((emoji: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setLocalReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setLocalReactions((cur) => cur.filter((r) => r.id !== id));
    }, 1100);
  }, []);

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

  // Listen for remote reaction events and display local overlay
  useEffect(() => {
    if (!call) return;
    const unsubscribe = (call as any).on?.('call.reaction_new', (event: any) => {
      const code: string | undefined = event?.reaction?.emoji_code;
      if (!code) return;
      const toChar: Record<string, string> = {
        ':heart:': '❤️',
        ':thumbsup:': '👍',
        ':joy:': '😂',
        ':fire:': '🔥',
      };
      const emoji = toChar[code] || '❤️';
      emitLocalReaction(emoji);
    });
    return unsubscribe;
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
        <CallContent CallControls={FloatingControlsFactory(emitLocalReaction)} />
        {/* Local reactions overlay */}
        <View pointerEvents="none" style={styles.reactionsOverlay}>
          {localReactions.map((r) => (
            <FloatingEmoji key={r.id} emoji={r.emoji} />
          ))}
        </View>
      </StreamCall>
    </View>
  );
}

// Factory to inject local reaction emitter via closure
const FloatingControlsFactory = (emitLocal: (emoji: string) => void) => {
  return function FloatingControls() {
  const call = useCall();
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera, isEnabled: isCamOn } = useCameraState();
  const { microphone, isEnabled: isMicOn } = useMicrophoneState();
  const [showReactions, setShowReactions] = React.useState(false);

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
    const sendReaction = async (kind: string) => {
      // Map to Stream emoji codes and display chars
      const toCode: Record<string, string> = {
        heart: ':heart:',
        thumbs_up: ':thumbsup:',
        joy: ':joy:',
        fire: ':fire:',
      };
      const toChar: Record<string, string> = {
        ':heart:': '❤️',
        ':thumbsup:': '👍',
        ':joy:': '😂',
        ':fire:': '🔥',
      };
      const emoji_code = toCode[kind] ?? ':heart:';
      const emojiChar = toChar[emoji_code] ?? '❤️';
      try {
        const anyCall: any = call;
        if (anyCall?.sendReaction) {
          await anyCall.sendReaction({ type: 'reaction', emoji_code, custom: {} });
        } else if (anyCall?.sendCustomEvent) {
          await anyCall.sendCustomEvent({ type: 'call.reaction_new', reaction: { emoji_code } });
        }
      } catch {}
      emitLocal(emojiChar);
      setShowReactions(false);
    };

    return (
      <View style={styles.controlsContainer} pointerEvents="box-none">
        {showReactions && (
          <View style={styles.reactionsRow}>
            <RoundButton onPress={() => sendReaction('heart')} bg="#E11D48">
              <Ionicons name="heart" size={20} color="#fff" />
            </RoundButton>
            <RoundButton onPress={() => sendReaction('thumbs_up')} bg="#2563EB">
              <Ionicons name="thumbs-up" size={20} color="#fff" />
            </RoundButton>
            <RoundButton onPress={() => sendReaction('joy')} bg="#F59E0B">
              <Ionicons name="happy" size={20} color="#fff" />
            </RoundButton>
            <RoundButton onPress={() => sendReaction('fire')} bg="#DC2626">
              <Ionicons name="flame" size={20} color="#fff" />
            </RoundButton>
          </View>
        )}
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
          <RoundButton onPress={() => setShowReactions((s) => !s)} bg="#222">
            <Ionicons name="heart" size={22} color="#fff" />
          </RoundButton>
          <RoundButton onPress={hangup} bg="#DC2626">
            <Ionicons name="call" size={22} color="#fff" />
          </RoundButton>
        </View>
      </View>
    );
  };
};

const FloatingEmoji = ({ emoji }: { emoji: string }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value((Math.random() - 0.5) * 60)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -140, duration: 1000, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity]);
  return (
    <Animated.View style={{ transform: [{ translateY }, { translateX }], opacity }}>
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
    </Animated.View>
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
  reactionsRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 10,
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

