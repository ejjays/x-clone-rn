import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import ChatScreen from "@/components/ChatScreen"

export default function ChatPage() {
  const router = useRouter()
  const { channelId, otherUserName, otherUserImage } = useLocalSearchParams<{
    channelId: string
    otherUserName: string
    otherUserImage: string
  }>()

  const handleBack = () => {
    router.back()
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: otherUserName || "Chat",
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#1C1E21" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
        }}
      />
      <SafeAreaView className="flex-1 bg-white">
        <ChatScreen channelId={channelId!} onBack={handleBack} />
      </SafeAreaView>
    </>
  )
}
