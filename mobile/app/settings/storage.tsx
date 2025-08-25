import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { cacheManager } from "@/utils/offline/CacheManager";
import { router } from "expo-router";

export default function StorageSettings() {
  const [usageText, setUsageText] = useState<string>("Calculating...");

  const refresh = async () => {
    const usage = await cacheManager.getUsage();
    const mb = (b: number) => (b / (1024 * 1024)).toFixed(2) + " MB";
    setUsageText(`Total: ${mb(usage.totalBytes)} (Media: ${mb(usage.mediaBytes)}, Data: ${mb(usage.dataBytes)})`);
  };

  useEffect(() => {
    refresh();
  }, []);

  const clearAll = async () => {
    await cacheManager.clearPrefix("posts:");
    await cacheManager.clearPrefix("user:");
    await cacheManager.clearPrefix("chat:");
    await cacheManager.clearPrefix("media:");
    await refresh();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0b0b0b", padding: 16 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: "#3b82f6" }}>{"<"} Back</Text>
      </TouchableOpacity>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Storage</Text>
      <Text style={{ color: "#9ca3af", marginBottom: 16 }}>{usageText}</Text>

      <TouchableOpacity onPress={refresh} style={{ backgroundColor: "#2563eb", padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Refresh Usage</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearAll} style={{ backgroundColor: "#ef4444", padding: 12, borderRadius: 8 }}>
        <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Clear Cached Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

