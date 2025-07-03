import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator, Alert } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useApiClient, userApi, streamApi } from "../utils/api"
import { useCurrentUser } from "../hooks/useCurrentUser"

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
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const api = useApiClient()
  const { user: currentUser } = useCurrentUser()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getAllUsers(api)
      console.log("📋 Fetched users:", response.data.users?.length || 0)

      // Filter out current user
      const allUsers = response.data.users || []
      const otherUsers = allUsers.filter((user: User) => user.clerkId !== currentUser?.clerkId)

      setUsers(otherUsers)
      setFilteredUsers(otherUsers)
    } catch (error) {
      console.error("❌ Failed to fetch users:", error)
      Alert.alert("Error", "Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const createChannel = async (selectedUser: User) => {
    if (!currentUser?.clerkId || !selectedUser.clerkId) {
      console.error("❌ Missing user IDs:", {
        currentUser: currentUser?.clerkId,
        selectedUser: selectedUser.clerkId,
      })
      Alert.alert("Error", "Unable to create chat. Please try again.")
      return
    }

    try {
      setCreating(true)
      console.log("🔄 Creating channel with:", selectedUser.firstName, selectedUser.lastName)
      console.log("🔄 Creating channel with user:", selectedUser.clerkId)

      const channelData = {
        members: [currentUser.clerkId, selectedUser.clerkId],
        name: `${currentUser.firstName || "User"} & ${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
        type: "messaging",
      }

      console.log("📤 Channel data:", channelData)

      const response = await streamApi.createChannel(api, channelData)
      console.log("✅ Channel created:", response.data)

      // Navigate to the chat screen
      router.push(`/chat/${response.data.channelId}`)
    } catch (error: any) {
      console.error("❌ Failed to create channel:", error)
      console.error("❌ Failed to create channel:", error)
      Alert.alert("Error", "Failed to create chat. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => createChannel(item)}
      disabled={creating}
    >
      <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
        <Text className="text-white font-semibold text-lg">
          {item.firstName?.[0]?.toUpperCase() || item.username?.[0]?.toUpperCase() || "?"}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900">
          {item.firstName} {item.lastName}
        </Text>
        <Text className="text-gray-500 text-sm">@{item.username}</Text>
      </View>
      {creating && <ActivityIndicator size="small" color="#3B82F6" />}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">New Message</Text>
      </View>

      {/* Search */}
      <View className="p-4">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Users List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text className="mt-4 text-gray-500 text-lg">No users found</Text>
          <Text className="text-gray-400 text-center mt-2">
            {searchQuery ? "Try a different search term" : "No users available to chat with"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}
