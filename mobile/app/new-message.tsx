import { Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import NewMessageScreen from "@/components/NewMessageScreen"
import { useRouter } from "expo-router"
import { useStreamChat } from "@/hooks/useStreamChat"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { User } from "@/types"

export default function NewMessagePage() {
  const router = useRouter()
  const { createChannel } = useStreamChat()
  const { currentUser } = useCurrentUser()

  const handleSelectUser = async (user: User) => {
    try {
      if (!currentUser) return

      // Create or get existing channel
      const channelId = await createChannel([currentUser._id, user._id], {
        name: `${currentUser.firstName} & ${user.firstName}`,
        members: [currentUser._id, user._id],
      })

      if (channelId) {
        // Navigate to the chat screen
        router.replace({
          pathname: "/chat/[channelId]",
          params: {
            channelId,
            otherUserName: `${user.firstName} ${user.lastName}`,
            otherUserImage: user.profilePicture || "",
          },
        })
      }
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
    }
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-white">
        <NewMessageScreen onSelectUser={handleSelectUser} onClose={handleClose} />
      </SafeAreaView>
    </>
  )
}
