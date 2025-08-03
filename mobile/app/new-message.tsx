import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, Platform, StatusBar, Image } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useApiClient, userApi } from "@/utils/api"
import { useStreamChat } from "@/context/StreamChatContext"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { User } from "@/types"
import { useTheme } from "@/context/ThemeContext";

export default function NewMessageScreen() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const api = useApiClient()
  const { client, isConnected, createChannel } = useStreamChat()
  const { currentUser } = useCurrentUser()
  const { colors } = useTheme();

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
      style={{ backgroundColor: colors.background }} // Apply theme
    >
      {item.profilePicture ? (
        <Image source={{ uri: item.profilePicture }} className="w-12 h-12 rounded-full mr-3" />
      ) : (
        <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.blue }}>
          <Text className="text-white font-semibold text-lg">
            {item.firstName?.[0]?.toUpperCase() || item.username?.[0]?.toUpperCase() || "?"}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          {item.firstName} {item.lastName}
        </Text>
        <Text className="text-gray-500" style={{ color: colors.textSecondary }}>@{item.username}</Text>
      </View>
      {creating && <ActivityIndicator size="small" color="#3B82F6" />}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center p-4 border-b border-gray-200"
        style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, backgroundColor: colors.background }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="close" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>New Message</Text>
      </View>

      {/* Search */}
      <View className="p-4 border-b border-gray-200" style={{ backgroundColor: colors.background }}>
        <View className="flex-row items-center rounded-full px-4" style={{ backgroundColor: colors.surface }}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search people"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
             style={{
              paddingVertical: Platform.OS === "android" ? 8 : 12,
              color: colors.text,
            }}
          />
        </View>
      </View>

      {/* Connection status indicator */}
      {!isConnected && (
        <View className="p-2 items-center" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-semibold" style={{ color: colors.textMuted }}>Connecting to chat service...</Text>
        </View>
      )}

      {/* Users List */}
      {loading ? (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500" style={{ color: colors.textMuted }}>Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text className="mt-2 text-gray-500" style={{ color: colors.textMuted }}>No users found</Text>
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