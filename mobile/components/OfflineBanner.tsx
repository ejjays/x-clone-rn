// components/OfflineBanner.tsx
import React from "react";
import { View, Text } from "react-native";

export const OfflineBanner = ({ queued }: { queued: number }) => {
  if (queued <= 0) return null;
  return (
    <View
      style={{
        backgroundColor: "#fde047",
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#1f2937", fontWeight: "600" }}>
        Offline mode. {queued} change{queued === 1 ? "" : "s"} will sync when online.
      </Text>
    </View>
  );
};

