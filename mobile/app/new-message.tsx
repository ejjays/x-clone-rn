import { useState, useEffect } from "react"
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from "react-native"
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
}

export default function NewMessageScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const api = useApiClient()
  const { user: currentUser } = useCurrentUser()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getAllUsers(api)

      // Filter out current user
      const otherUsers = response.data.filter((user: User) => user.clerkId !== currentUser?.clerkId)
      setUsers(otherUsers)
      setFilteredUsers(otherUsers)
    } catch (error) {
      console.error("❌ Failed to fetch users:", error)
      Alert.alert("Error", "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const createChannel = async (selectedUser: User) => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to start a conversation")
      return
    }

    try {
      setCreating(true)
      console.log("🔄 Creating channel with:", selectedUser.firstName, selectedUser.lastName)
      console.log("🔄 Creating channel with user:", selectedUser.clerkId)

      const channelData = {
        members: [currentUser.clerkId, selectedUser.clerkId],
        name: `${currentUser.firstName} & ${selectedUser.firstName} ${selectedUser.lastName}`,
      }

      const response = await streamApi.createChannel(api, channelData)
      console.log("✅ Channel created:", response.data)

      // Navigate to the chat screen
      router.push(`/chat/${response.data.channelId}`)
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
      onPress={() => createChannel(item)}
      disabled={creating}
    >
      <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
        <Text className="text-white font-semibold text-lg">{item.firstName?.[0]?.toUpperCase() || "U"}</Text>
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
            placeholder="Search people..."
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
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-8">
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4">
                {searchQuery ? "No users found" : "No users available"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
