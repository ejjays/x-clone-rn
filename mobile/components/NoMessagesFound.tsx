import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import LottieView from "lottie-react-native"

interface NoMessagesFoundProps {
  onRefresh?: () => Promise<void>
}

export default function NoMessagesFound({ onRefresh }: NoMessagesFoundProps) {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    }
  }

  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* Lottie Animation */}
      <LottieView
        source={require("../assets/animations/empty-messages.json")}
        autoPlay
        loop
        style={{
          width: 200,
          height: 200,
        }}
      />

      {/* Text Content */}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-2">No Messages Yet</Text>
      <Text className="text-gray-500 text-center text-base leading-6 mb-6">
        Start a conversation with someone! Tap the compose button to send your first message.
      </Text>

      {/* Refresh Button */}
      {onRefresh && (
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-full flex-row items-center" onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Refresh</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
