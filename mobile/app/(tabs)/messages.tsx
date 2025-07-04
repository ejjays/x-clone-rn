import { router } from "expo-router";
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStreamChat } from "@/hooks/useStreamChat";
import CustomChannelList from "@/components/CustomChannelList"; // ✨ Import the custom component

export default function MessagesScreen() {
  // ✨ Use the loading state and isConnected status from the hook
  const { isConnecting, isConnected, channels } = useStreamChat();

  const handleNewMessage = () => {
    router.push("/new-message");
  };

  // ✨ Define the function to handle channel selection
  const handleChannelSelect = (channelId: string) => {
    // Navigate to the specific chat screen
    router.push(`/chat/${channelId}`);
  };

  // A helper function to decide what to render based on the state
  const renderContent = () => {
    // Show a loading indicator while the chat client connects and fetches channels.
    if (isConnecting) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1877F2" />
          <Text className="text-gray-500 mt-2">Loading conversations...</Text>
        </View>
      );
    }

    // ✨ If connected but there are no channels, show the empty state.
    if (isConnected && channels.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">No conversations yet</Text>
            <Text className="text-gray-500 text-center mb-6">
              Start a new conversation by tapping the compose button above.
            </Text>
        </View>
      );
    }

    // ✨ If we have channels, render the custom list component.
    return <CustomChannelList onChannelSelect={handleChannelSelect} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Messages</Text>
        <TouchableOpacity
          onPress={handleNewMessage}
          className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}