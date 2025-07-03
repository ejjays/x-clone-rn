import { useStreamChat } from "@/hooks/useStreamChat"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Chat,
  ChannelList,
  Channel,
  MessageList,
  MessageInput,
  Thread,
  OverlayProvider,
} from "stream-chat-react-native"
import NewMessageScreen from "@/components/NewMessageScreen"
import type { User } from "@/types"

const MessagesScreen = () => {
  const insets = useSafeAreaInsets()
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [isChannelOpen, setIsChannelOpen] = useState(false)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)

  const { client, isConnecting, isConnected, createChannel } = useStreamChat()
  const { currentUser } = useCurrentUser()

  const openNewMessage = () => {
    setIsNewMessageOpen(true)
  }

  const closeNewMessage = () => {
    setIsNewMessageOpen(false)
  }

  const startNewConversation = async (user: User) => {
    if (!client || !currentUser) {
      console.error("❌ Client or current user not available")
      return
    }

    setIsNewMessageOpen(false)
    setIsCreatingChannel(true)

    try {
      console.log("🔄 Starting conversation with:", user.firstName, user._id)

      // Use the updated createChannel function that calls the backend
      const channel = await createChannel(user._id, user.firstName)

      if (channel) {
        setSelectedChannel(channel)
        setIsChannelOpen(true)
        console.log("✅ Channel created successfully!")
      } else {
        console.error("❌ Failed to create channel - no channel returned")
      }
    } catch (error) {
      console.error("❌ Failed to start conversation:", error)
    } finally {
      setIsCreatingChannel(false)
    }
  }

  const closeChannel = () => {
    setIsChannelOpen(false)
    setSelectedChannel(null)
  }

  if (isConnecting) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1877F2" />
        <Text className="text-gray-500 mt-2">Connecting to chat...</Text>
      </View>
    )
  }

  if (!isConnected || !client) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Feather name="message-circle" size={32} color="#65676B" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-3">Chat Unavailable</Text>
        <Text className="text-gray-500 text-center text-base leading-6">
          Unable to connect to chat. Please check your connection and try again.
        </Text>
      </View>
    )
  }

  return (
    <OverlayProvider>
      <Chat client={client}>
        <View className="flex-1 bg-white">
          {/* HEADER */}
          <View className="flex-row items-center justify-between px-4 py-4 bg-white">
            <Text className="text-3xl font-bold text-gray-900">Messages</Text>
            <TouchableOpacity onPress={openNewMessage}>
              <Feather name="edit" size={24} color="#1DA1F2" />
            </TouchableOpacity>
          </View>

          {/* CHANNEL LIST */}
          <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
            <ChannelList
              onSelect={(channel) => {
                setSelectedChannel(channel)
                setIsChannelOpen(true)
              }}
              EmptyStateComponent={() => (
                <View className="flex-1 items-center justify-center py-20">
                  <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                    <Feather name="message-circle" size={32} color="#65676B" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900 mb-3">No conversations yet</Text>
                  <Text className="text-gray-500 text-center text-base leading-6 max-w-xs mb-6">
                    Start a conversation with someone to see it here.
                  </Text>
                  <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-full" onPress={openNewMessage}>
                    <Text className="text-white font-semibold">Start a conversation</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          {/* Loading overlay for channel creation */}
          {isCreatingChannel && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
              <View className="bg-white p-6 rounded-lg items-center">
                <ActivityIndicator size="large" color="#1877F2" />
                <Text className="text-gray-700 mt-3">Creating conversation...</Text>
              </View>
            </View>
          )}

          {/* New Message Modal */}
          <Modal visible={isNewMessageOpen} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1" style={{ paddingTop: insets.top }}>
              <NewMessageScreen onSelectUser={startNewConversation} onClose={closeNewMessage} />
            </View>
          </Modal>

          {/* Chat Modal */}
          <Modal visible={isChannelOpen} animationType="slide" presentationStyle="pageSheet">
            {selectedChannel && (
              <View className="flex-1">
                {/* Chat Header */}
                <View
                  className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white"
                  style={{ paddingTop: insets.top + 12 }}
                >
                  <TouchableOpacity onPress={closeChannel} className="mr-3">
                    <Feather name="arrow-left" size={24} color="#1DA1F2" />
                  </TouchableOpacity>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-lg">{selectedChannel.data?.name || "Chat"}</Text>
                  </View>
                </View>

                {/* Chat Content */}
                <Channel channel={selectedChannel}>
                  <View className="flex-1">
                    <MessageList />
                    <MessageInput />
                  </View>
                  <Thread />
                </Channel>
              </View>
            )}
          </Modal>
        </View>
      </Chat>
    </OverlayProvider>
  )
}

export default MessagesScreen
