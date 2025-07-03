import { useState } from "react"
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAllUsers } from "@/hooks/useAllUsers"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { streamApi } from "@/utils/api"

interface User {
  _id: string
  clerkId: string
  username: string
  firstName: string
  lastName: string
  profilePicture: string
  email: string
}

export default function NewMessageScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const { users, loading, error } = useAllUsers()
  const { user: currentUser } = useCurrentUser()

  const filteredUsers =
    users?.filter((user: User) => {
      if (!user || user.clerkId === currentUser?.clerkId) return false

      const query = searchQuery.toLowerCase()
      return (
        user.username?.toLowerCase().includes(query) ||
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      )
    }) || []

  const handleUserSelect = async (selectedUser: User) => {
    if (!selectedUser.clerkId) {
      Alert.alert("Error", "User ID is missing")
      return
    }

    if (!currentUser?.clerkId) {
      Alert.alert("Error", "You must be logged in to start a conversation")
      return
    }

    console.log("🔄 Creating channel with:", `${selectedUser.firstName} ${selectedUser.lastName}`)
    console.log("🔄 Creating channel with user:", selectedUser.clerkId)

    setIsCreatingChannel(true)

    try {
      const response = await streamApi.createChannel({
        otherUserId: selectedUser.clerkId,
        otherUserName: `${selectedUser.firstName} ${selectedUser.lastName}`,
      })

      console.log("✅ Channel created:", response)

      // Navigate to the chat screen
      router.push(`/chat/${response.channelId}`)
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
      Alert.alert("Error", "Failed to create conversation. Please try again.")
    } finally {
      setIsCreatingChannel(false)
    }
  }

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => handleUserSelect(item)}
      disabled={isCreatingChannel}
    >
      <View className="w-12 h-12 rounded-full bg-gray-300 mr-3 items-center justify-center">
        {item.profilePicture ? (
          <Text className="text-lg font-semibold text-gray-600">{item.firstName?.[0]?.toUpperCase() || "?"}</Text>
        ) : (
          <Text className="text-lg font-semibold text-gray-600">{item.firstName?.[0]?.toUpperCase() || "?"}</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">
          {item.firstName} {item.lastName}
        </Text>
        <Text className="text-sm text-gray-500">@{item.username}</Text>
      </View>

      {isCreatingChannel && <ActivityIndicator size="small" color="#1DA1F2" />}
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text className="mt-2 text-gray-500">Loading users...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="mt-2 text-lg font-semibold text-gray-900">Error Loading Users</Text>
          <Text className="mt-1 text-gray-500 text-center">
            Unable to load users. Please check your connection and try again.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">New Message</Text>
      </View>

      {/* Search Bar */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search people"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-semibold text-gray-900">No Users Found</Text>
            <Text className="mt-1 text-gray-500 text-center">
              {searchQuery ? "Try a different search term" : "No users available to message"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
