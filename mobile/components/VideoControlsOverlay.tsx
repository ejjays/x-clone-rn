import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, LayoutChangeEvent, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { COMMENT_BAR_HEIGHT } from "@/components/VideoCommentBar";

interface VideoControlsOverlayProps {
  player: any;
}

export const VIDEO_CONTROLS_HEIGHT = 28;

const VideoControlsOverlay: React.FC<VideoControlsOverlayProps> = ({ player }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [barWidth, setBarWidth] = useState(1);
  const [showCenterControl, setShowCenterControl] = useState(true);

  // Poll for time updates defensively (APIs may vary across platforms)
  useEffect(() => {
    let interval: any;
    if (!player) return;
    interval = setInterval(async () => {
      try {
        const d = await (player as any)?.getDuration?.();
        const t = await (player as any)?.getCurrentTime?.();
        if (typeof d === "number" && isFinite(d)) setDuration(d);
        if (typeof t === "number" && isFinite(t)) setCurrentTime(Math.max(0, Math.min(t, d || t)));
      } catch {}
    }, 250);
    return () => clearInterval(interval);
  }, [player]);

  const progress = useMemo(() => {
    if (duration <= 0) return 0;
    return Math.max(0, Math.min(1, currentTime / duration));
  }, [currentTime, duration]);

  const togglePlay = useCallback(() => {
    try {
      if (isPlaying) {
        (player as any)?.pause?.();
        setIsPlaying(false);
      } else {
        (player as any)?.play?.();
        setIsPlaying(true);
      }
      setShowCenterControl(true);
      setTimeout(() => setShowCenterControl(false), 900);
    } catch {}
  }, [isPlaying, player]);

  const onSeekBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(Math.max(1, e.nativeEvent.layout.width));
  };

  const handleSeek = (evt: any) => {
    try {
      const x = evt?.nativeEvent?.locationX ?? 0;
      const frac = Math.max(0, Math.min(1, x / barWidth));
      const target = (duration || 0) * frac;
      (player as any)?.seekTo?.(target);
      setCurrentTime(target);
    } catch {}
  };

  return (
    <>
      {showCenterControl && (
        <View pointerEvents="box-none" style={styles.centerContainer}>
          <TouchableOpacity onPress={togglePlay} activeOpacity={0.8} style={styles.centerPlayButton}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={42} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View
        pointerEvents="box-none"
        style={[
          styles.container,
          { bottom: COMMENT_BAR_HEIGHT + Math.max(0, insets.bottom) + 8 },
        ]}
      >
        <View style={styles.controlsRow}>
          <Pressable style={[styles.seekBarContainer]} onPress={handleSeek} onStartShouldSetResponder={() => true}>
            <View onLayout={onSeekBarLayout} style={[styles.seekTrack, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
              <View style={[styles.seekProgress, { width: `${progress * 100}%`, backgroundColor: "#fff" }]} />
            </View>
          </Pressable>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    height: VIDEO_CONTROLS_HEIGHT,
    zIndex: 20,
  },
  centerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 19,
  },
  centerPlayButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  seekBarContainer: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  seekTrack: {
    height: 3,
    borderRadius: 3,
    overflow: "hidden",
  },
  seekProgress: {
    height: 3,
    borderRadius: 3,
  },
});

export default VideoControlsOverlay;

