import { View, Text, Switch, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { router } from "expo-router";

export default function NotificationSettings() {
  const { permissionStatus, isRegistered, toggleNotifications, sendTestNotification } = usePushNotifications();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // could fetch current preference if needed
  }, []);

  const onToggle = async (value: boolean) => {
    setEnabled(value);
    await toggleNotifications(value);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0b0b0b", padding: 16 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: "#3b82f6" }}>{"<"} Back</Text>
      </TouchableOpacity>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Notifications</Text>
      <Text style={{ color: "#9ca3af", marginBottom: 16 }}>Permission: {permissionStatus} • Registered: {isRegistered ? "yes" : "no"}</Text>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}>
        <View>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Enable push notifications</Text>
          <Text style={{ color: "#9ca3af", marginTop: 2 }}>Receive alerts for new messages and activity</Text>
        </View>
        <Switch value={enabled} onValueChange={onToggle} />
      </View>

      <TouchableOpacity onPress={() => sendTestNotification()} style={{ backgroundColor: "#2563eb", padding: 12, borderRadius: 8, marginTop: 24 }}>
        <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Send Test Notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

