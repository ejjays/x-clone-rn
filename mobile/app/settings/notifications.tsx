import { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { usePushNotifications, NotificationPreferences } from "@/hooks/usePushNotifications";

export default function NotificationSettingsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { updatePreferences, sendTestNotification } = usePushNotifications();
  const [enabled, setEnabled] = useState(true);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    messages: true,
    follows: true,
    postReactions: true,
    mentions: true,
    system: true,
  });

  useEffect(() => {
    // Future: fetch current preferences from backend if needed
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Notifications</Text>

      <View className="mb-6 p-4 rounded-xl" style={{ backgroundColor: isDarkMode ? "#111" : "#f5f5f5" }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg" style={{ color: colors.text }}>Enable Push Notifications</Text>
          <Switch
            value={enabled}
            onValueChange={async (val) => {
              setEnabled(val);
              await updatePreferences(val);
            }}
          />
        </View>
      </View>

      <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Notification Types</Text>

      {([
        ["messages", "New messages"],
        ["follows", "New followers"],
        ["postReactions", "Post reactions"],
        ["mentions", "Mentions"],
        ["system", "System notifications"],
      ] as [keyof NotificationPreferences, string][]).map(([key, label]) => (
        <View key={key} className="flex-row items-center justify-between py-3 px-4 mb-2 rounded-xl" style={{ backgroundColor: isDarkMode ? "#111" : "#f5f5f5" }}>
          <Text className="text-base" style={{ color: colors.text }}>{label}</Text>
          <Switch
            value={prefs[key]}
            onValueChange={async (val) => {
              const next = { ...prefs, [key]: val };
              setPrefs(next);
              await updatePreferences(enabled, { [key]: val });
            }}
          />
        </View>
      ))}

      <TouchableOpacity
        className="mt-6 p-4 rounded-xl items-center"
        style={{ backgroundColor: colors.blue500 }}
        onPress={() => sendTestNotification({ title: "Test", body: "This is a test notification" })}
      >
        <Text className="text-white font-semibold">Send Test Notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

