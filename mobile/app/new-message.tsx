import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Image, TextInput, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAllUsers } from "@/hooks/useAllUsers"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useApiClient, streamApi } from "@/utils/api"
import { useState } from "react"

export default function NewMessageScreen() {
  const { users, isLoading } = useAllUsers()
  const { currentUser } = useCurrentUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [creating, setCreating] = useState(false)
  const api = useApiClient()

  const handleUserSelect = async (user: any) => {
    try {
      if (!currentUser) {
        console.error("❌ Current user not available")
        return
      }

      console.log("🔄 Creating channel with:", user.firstName, user.lastName)
      console.log("🔄 User clerkId:", user.clerkId)
      console.log("🔄 Current user clerkId:", currentUser.clerkId)

      if (!user.clerkId) {
        console.error("❌ Selected user has no clerkId")
        return
      }

      setCreating(true)

      const channelData = {
        members: [currentUser.clerkId, user.clerkId],
        name: `${currentUser.firstName || "User"} & ${user.firstName} ${user.lastName}`,
      }

      console.log("📤 Creating channel with data:", channelData)

      const response = await streamApi.createChannel(api, channelData)

      if (response.data) {
        console.log("✅ Channel created, navigating to:", response.data.channelId)
        router.push(`/chat/${response.data.channelId}`)
      }
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
    } finally {
      setCreating(false)
    }
  }

  const filteredUsers =
    users?.filter((user) => {
      if (user.clerkId === currentUser?.clerkId) return false

      if (!searchQuery) return true

      const query = searchQuery.toLowerCase()
      return (
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      )
    }) || []

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleUserSelect(item)}
      className="flex-row items-center p-4 border-b border-gray-100"
      disabled={creating}
    >
      <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3 overflow-hidden">
        {item.profilePicture ? (
          <Image source={{ uri: item.profilePicture }} className="w-full h-full" />
        ) : (
          <Text className="text-white font-semibold text-lg">{item.firstName?.[0]?.toUpperCase() || "?"}</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900">
          {item.firstName} {item.lastName}
        </Text>
        <Text className="text-gray-500 text-sm">@{item.username}</Text>
      </View>
      {creating ? (
        <ActivityIndicator size="small" color="#3B82F6" />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">New Message</Text>
      </View>

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

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500">Loading users...</Text>
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
