import React, { useEffect, useState } from "react";
import { Text, TextStyle, StyleProp } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { subscribeToSecondTicks } from "@/utils/secondTicker";

type Props = {
  dateISO: string;
  style?: StyleProp<TextStyle>;
  intervalMs?: number;
  startAfterMount?: boolean; // if true, timer starts counting from when shown (or createdAt if later)
  postId?: string; // for persistence so it doesn't reset after restart
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const FIRST_SEEN_MAP: Map<string, number> = new Map();

export default function TimeAgo({ dateISO, style, intervalMs = 1000, startAfterMount = false, postId }: Props) {
  const [, forceTick] = useState(0);
  const mountedAtRef = React.useRef<number>(Date.now());
  const createdMs = new Date(dateISO).getTime();
  const [firstSeenMs, setFirstSeenMs] = useState<number>(() => mountedAtRef.current);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!startAfterMount || !postId) return;
        if (FIRST_SEEN_MAP.has(postId)) {
          const seen = FIRST_SEEN_MAP.get(postId)!;
          if (!cancelled) setFirstSeenMs(seen);
          return;
        }
        const key = `FIRST_SEEN_POST_${postId}`;
        const raw = await AsyncStorage.getItem(key);
        let firstSeen = raw ? parseInt(raw, 10) : NaN;
        if (!raw || Number.isNaN(firstSeen)) {
          firstSeen = Date.now();
          await AsyncStorage.setItem(key, String(firstSeen));
        }
        FIRST_SEEN_MAP.set(postId, firstSeen);
        if (!cancelled) setFirstSeenMs(firstSeen);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [startAfterMount, postId, dateISO]);
  useEffect(() => {
    const unsub = subscribeToSecondTicks(() => forceTick((n) => n + 1));
    return () => unsub();
  }, []);
  if (!dateISO) return <Text style={style} />;
  const now = Date.now();
  const ageSec = Math.floor(Math.max(0, now - createdMs) / 1000);
  // Use firstSeen baseline ONLY for the initial seconds (<60s); otherwise use createdAt
  const secondsBaseline = startAfterMount ? Math.max(createdMs, firstSeenMs) : createdMs;
  const baseDate = new Date(ageSec < 60 ? secondsBaseline : createdMs);
  return <Text style={style}>{formatTimeAgo(baseDate)}</Text>;
}

