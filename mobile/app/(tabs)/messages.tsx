import { useConversations } from "@/hooks/useConversations"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ChatScreen from "@/components/ChatScreen"
import NewMessageScreen from "@/components/NewMessageScreen"
import type { User } from "@/types"

const MessagesScreen = () => {
  const insets = useSafeAreaInsets()
  const [searchText, setSearchText] = useState("")
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const { conversations, isLoading, isRefreshing, createConversation, refreshConversations } = useConversations()
  const { currentUser } = useCurrentUser()

  const openConversation = async (conversationId: string, user: any) => {
    console.log("🔓 Opening conversation:", { conversationId, user })
    setSelectedConversationId(conversationId)
    setSelectedUser(user)
    setIsChatOpen(true)
  }

  const startNewConversation = async (user: User) => {
    console.log("🆕 Starting new conversation with:", user)
    setIsNewMessageOpen(false) // Close the new message screen first

    const conversationId = await createConversation(user._id)
    if (conversationId) {
      const chatUser = {
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        avatar:
          user.profilePicture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`,
        verified: false,
      }
      openConversation(conversationId.toString(), chatUser)
    }
  }

  const closeChatModal = () => {
    console.log("🔒 Closing chat modal")
    setIsChatOpen(false)
    setSelectedConversationId(null)
    setSelectedUser(null)
  }

  const openNewMessage = () => {
    console.log("📝 Opening new message screen")
    setIsNewMessageOpen(true)
  }

  const closeNewMessage = () => {
    console.log("❌ Closing new message screen")
    setIsNewMessageOpen(false)
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1877F2" />
        <Text className="text-gray-500 mt-2">Loading conversations...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <Text className="text-3xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity onPress={openNewMessage}>
          <Feather name="edit" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-3 bg-white">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search conversations"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* CONVERSATIONS LIST */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshConversations}
            tintColor="#1877F2"
            colors={["#1877F2"]}
          />
        }
      >
        {conversations.length === 0 ? (
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
        ) : (
          conversations.map((conversation) => {
            // For now, we'll use mock user data since we need to implement user lookup
            const mockUser = {
              name:
                "User " +
                (conversation.participant_1 === currentUser?._id
                  ? conversation.participant_2
                  : conversation.participant_1),
              username: "user" + Math.random().toString(36).substr(2, 5),
              avatar: `https://ui-avatars.com/api/?name=User&background=1877F2&color=fff&size=120`,
              verified: false,
            }

            return (
              <TouchableOpacity
                key={conversation.id}
                className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                onPress={() => openConversation(conversation.id.toString(), mockUser)}
              >
                <Image source={{ uri: mockUser.avatar }} className="size-12 rounded-full mr-3" />

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-1">
                      <Text className="font-semibold text-gray-900">{mockUser.name}</Text>
                      {mockUser.verified && <Feather name="check-circle" size={16} color="#1DA1F2" className="ml-1" />}
                      <Text className="text-gray-500 text-sm ml-1">@{mockUser.username}</Text>
                    </View>
                    <Text className="text-gray-500 text-sm">
                      {conversation.last_message_at
                        ? new Date(conversation.last_message_at).toLocaleDateString()
                        : "New"}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-500" numberOfLines={1}>
                    {conversation.last_message || "Start a conversation"}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          {conversations.length === 0
            ? "Tap the edit icon to start a conversation"
            : "Pull down to refresh • Tap to open conversation"}
        </Text>
      </View>

      {/* New Message Modal */}
      <Modal visible={isNewMessageOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1" style={{ paddingTop: insets.top }}>
          <NewMessageScreen onSelectUser={startNewConversation} onClose={closeNewMessage} />
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal visible={isChatOpen} animationType="slide" presentationStyle="pageSheet">
        {selectedConversationId && selectedUser && (
          <View className="flex-1">
            {/* Chat Header */}
            <View
              className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white"
              style={{ paddingTop: insets.top + 12 }}
            >
              <TouchableOpacity onPress={closeChatModal} className="mr-3">
                <Feather name="arrow-left" size={24} color="#1DA1F2" />
              </TouchableOpacity>
              <Image source={{ uri: selectedUser.avatar }} className="size-10 rounded-full mr-3" />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-semibold text-gray-900 mr-1">{selectedUser.name}</Text>
                  {selectedUser.verified && <Feather name="check-circle" size={16} color="#1DA1F2" />}
                </View>
                <Text className="text-gray-500 text-sm">@{selectedUser.username}</Text>
              </View>
            </View>

            {/* Chat Screen */}
            <ChatScreen conversationId={selectedConversationId} />
          </View>
        )}
      </Modal>
    </View>
  )
}

export default MessagesScreen
