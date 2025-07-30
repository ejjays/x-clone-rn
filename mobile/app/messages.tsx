import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useStreamChat } from "@/context/StreamChatContext";
import CustomChannelList from "@/components/CustomChannelList";
import NoMessagesFound from "@/components/NoMessagesFound";
import { useState } from "react";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const { isConnecting, isConnected, channels, client, refreshChannels } =
    useStreamChat();
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  // Mock user data for the horizontal list
  const mockUsers = [
    { id: "1", name: "Alice", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: "2", name: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: "3", name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: "4", name: "David", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: "5", name: "Eve", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: "6", name: "Frank", avatar: "https://i.pravatar.cc/150?img=6" },
    { id: "7", name: "Grace", avatar: "https://i.pravatar.cc/150?img=7" },
    { id: "8", name: "Heidi", avatar: "https://i.pravatar.cc/150?img=8" },
  ];

  const handleNewMessage = () => {
    router.push("/new-message");
  };

  const handleBack = () => {
    router.back();
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderContent = () => {
    // TEMPORARY DEBUG - Comment out the connection checks
    console.log("🔍 Messages Screen State:", {
      isConnecting,
      isConnected,
      hasClient: !!client,
      channelsCount: channels.length,
    });

    // Force show the NoMessagesFound component for testing
    // return <NoMessagesFound onRefresh={refreshChannels} />;

    // Original code commented out for debugging:

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
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Full Screen Header with Back Button */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center">
          <Text className="text-3xl font-extrabold text-blue-600">
            messages
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleNewMessage}
            className="w-10 h-10 rounded-full items-center justify-center mr-1"
            disabled={!client || !isConnected}
          >
            <Ionicons name="create" size={27} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full items-center justify-center"
            disabled={!client || !isConnected}
          >
            <FontAwesome5 name="facebook" size={26} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Field */}
      <View className="px-4 py-1">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4">
          <Ionicons name="search" size={25} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 text-base"
            placeholder="Search conversations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            style={{
              paddingVertical: Platform.OS === "android" ? 10 : 12,
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontal List of People */}
      <View className="py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {mockUsers.map((user) => (
            <TouchableOpacity key={user.id} className="items-center mr-4">
              <Image
                source={{ uri: user.avatar }}
                className="w-20 h-20 rounded-full border-2 border-blue-400"
              />
              <Text className="text-sm text-gray-700 mt-1" numberOfLines={1}>
                {user.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Content */}
      <View className="flex-1">
        {renderContent()}
      </View>
    </View>
  );
}
