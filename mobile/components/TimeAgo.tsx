import React, { useEffect, useState } from "react";
import { Text, TextStyle, StyleProp } from "react-native";

type Props = {
  dateISO: string;
  style?: StyleProp<TextStyle>;
  intervalMs?: number;
  startAfterMount?: boolean; // if true, timer starts counting from when shown (or createdAt if later)
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
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

export default function TimeAgo({ dateISO, style, intervalMs = 1000, startAfterMount = false }: Props) {
  const [, forceTick] = useState(0);
  const mountedAtRef = React.useRef<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  if (!dateISO) return <Text style={style} />;
  let baseDate = new Date(dateISO);
  if (startAfterMount) {
    const baseMs = Math.max(baseDate.getTime(), mountedAtRef.current);
    baseDate = new Date(baseMs);
  }
  return <Text style={style}>{formatTimeAgo(baseDate.toISOString())}</Text>;
}

