import { router } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStreamChat } from "@/context/StreamChatContext"; // 👈 Use the new context hook
import CustomChannelList from "@/components/CustomChannelList";
import NoMessagesFound from "@/components/NoMessagesFound";
import { useState } from "react";
import LottieView from "lottie-react-native";

export default function MessagesScreen() {
  const { isConnecting, isConnected, channels, client, refreshChannels } =
    useStreamChat(); // 👈 This now gets shared state
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewMessage = () => {
    router.push("/new-message");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderContent = () => {
    if (isConnecting && !client) {
      return (
        <View className="flex-1 items-center justify-center">
          <LottieView
            source={require("@/assets/animations/loading-loader.json")}
            autoPlay
            loop
            className="w-24 h-24"
          />
          <Text className="text-gray-500 mt-2">Loading conversations...</Text>
        </View>
      );
    }

    if (!client || !isConnected) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">
            Connection Issue
          </Text>
          <Text className="text-gray-500 text-center">
            Unable to connect to chat service. Please check your internet
            connection.
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
            onPress={refreshChannels}
          >
            <Text className="text-white font-semibold">Retry Connection</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (channels.length === 0) {
      return <NoMessagesFound onRefresh={refreshChannels} />;
    }

    return (
      <CustomChannelList
        onRefresh={refreshChannels}
        searchQuery={searchQuery}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text className="text-3xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity
          onPress={handleNewMessage}
          className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
          disabled={!client || !isConnected}
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Field */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4">
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 text-base"
            placeholder="Search conversations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            style={{
              paddingVertical: Platform.OS === "android" ? 8 : 12,
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}
