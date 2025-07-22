import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, Platform, StatusBar, Image } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useApiClient, userApi } from "@/utils/api"
import { useStreamChat } from "@/context/StreamChatContext"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { User } from "@/types"

export default function NewMessageScreen() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const api = useApiClient()
  const { client, isConnected, createChannel } = useStreamChat()
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

      const allUsers = response.data || []
      console.log("👥 Processed users:", allUsers.length)

      const otherUsers = allUsers.filter((user: User) => user.clerkId !== currentUser?.clerkId)

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
    // Check if chat is ready
    if (!client || !isConnected) {
      Alert.alert("Connection Error", "Chat is not yet connected. Please wait a moment and try again.")
      return
    }

    if (!currentUser || !selectedUser.clerkId) {
      Alert.alert("Error", "User information is missing.")
      return
    }

    setCreating(true)
    try {
      console.log(`🔄 Creating channel with: ${selectedUser.firstName} ${selectedUser.lastName}`)

      const channel = await createChannel(selectedUser.clerkId, `${selectedUser.firstName} ${selectedUser.lastName}`)

      if (channel && channel.id) {
        console.log("✅ Channel created successfully:", channel.id)
        router.push(`/chat/${channel.id}`)
      } else {
        throw new Error("Channel creation returned null or invalid channel")
      }
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
      Alert.alert("Error", "Failed to start conversation. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => handleUserSelect(item)}
      disabled={creating || !isConnected}
    >
      {item.profilePicture ? (
        <Image source={{ uri: item.profilePicture }} className="w-12 h-12 rounded-full mr-3" />
      ) : (
        <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
          <Text className="text-white font-semibold text-lg">
            {item.firstName?.[0]?.toUpperCase() || item.username?.[0]?.toUpperCase() || "?"}
          </Text>
        </View>
      )}
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
      <View
        className="flex-row items-center p-4 border-b border-gray-200"
        style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">New Message</Text>
      </View>

      {/* Search */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search people"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
             style={{
              paddingVertical: Platform.OS === "android" ? 8 : 12,
            }}
          />
        </View>
      </View>

      {/* Connection status indicator */}
      {!isConnected && (
        <View className="p-2 bg-yellow-100 items-center">
          <Text className="text-yellow-800 text-xs font-semibold">Connecting to chat service...</Text>
        </View>
      )}

      {/* Users List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text className="mt-2 text-gray-500">No users found</Text>
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