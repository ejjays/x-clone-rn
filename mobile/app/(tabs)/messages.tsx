import { useEffect } from "react";
import { router } from "expo-router";
import { View } from "react-native";

// This file now just redirects to the full-screen messages
export default function MessagesTab() {
  useEffect(() => {
    // Redirect to the full-screen messages page
    router.replace("/messages");
  }, []);

  // Return empty view since we're redirecting immediately
  return <View className="flex-1 bg-white" />;
}
