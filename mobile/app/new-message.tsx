import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useApiClient, userApi } from "@/utils/api"
import { useStreamChat } from "@/hooks/useStreamChat"
import { useCurrentUser } from "@/hooks/useCurrentUser"

interface User {
  _id: string
  clerkId: string
  username: string
  firstName: string
  lastName: string
  profilePicture?: string
  email: string
}

export default function NewMessageScreen() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const api = useApiClient()
  const { createChannel } = useStreamChat()
  const { currentUser } = useCurrentUser()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching users...")

      const response = await userApi.getAllUsers(api)
      console.log("📦 Raw API response:", response.data)

      // Handle different possible response structures
      let allUsers = []
      if (response.data?.users && Array.isArray(response.data.users)) {
        allUsers = response.data.users
      } else if (Array.isArray(response.data)) {
        allUsers = response.data
      } else {
        console.error("❌ Unexpected API response structure:", response.data)
        throw new Error("Invalid response format")
      }

      console.log("👥 Processed users:", allUsers.length)

      // Filter out current user
      const otherUsers = allUsers.filter((user: User) => {
        if (!currentUser) return true
        return user.clerkId !== currentUser.clerkId && user._id !== currentUser._id
      })

      console.log("✅ Filtered users (excluding current):", otherUsers.length)

      setUsers(otherUsers)
      setFilteredUsers(otherUsers)
    } catch (error) {
      console.error("❌ Failed to fetch users:", error)
      Alert.alert("Error", "Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!Array.isArray(users)) {
      console.warn("⚠️ Users is not an array:", users)
      setFilteredUsers([])
      return
    }

    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleUserSelect = async (selectedUser: User) => {
    if (!currentUser || !selectedUser.clerkId) {
      Alert.alert("Error", "User information is missing")
      return
    }

    try {
      setCreating(true)
      console.log("🔄 Creating channel with:", selectedUser.firstName, selectedUser.lastName)
      console.log("🔄 Creating channel with user:", selectedUser.clerkId)

      const channel = await createChannel(selectedUser.clerkId, `${selectedUser.firstName} ${selectedUser.lastName}`)

      if (channel) {
        console.log("✅ Channel created, navigating to chat")
        router.push(`/chat/${channel.id}`)
      } else {
        throw new Error("Failed to create channel")
      }
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
      Alert.alert("Error", "Failed to start conversation")
    } finally {
      setCreating(false)
    }
  }

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => handleUserSelect(item)}
      disabled={creating}
    >
      <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
        <Text className="text-white font-semibold text-lg">
          {item.firstName?.[0]?.toUpperCase() || item.username?.[0]?.toUpperCase() || "?"}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">
          {item.firstName} {item.lastName}
        </Text>
        <Text className="text-gray-500">@{item.username}</Text>
      </View>
      {creating && <ActivityIndicator size="small" color="#3B82F6" />}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">New Message</Text>
      </View>

      {/* Search */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#666" />
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
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text className="mt-2 text-gray-500">{searchQuery ? "No users found" : "No users available"}</Text>
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
