import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Image } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAllUsers } from "@/hooks/useAllUsers"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useStreamChat } from "@/hooks/useStreamChat"
import type { User } from "@/types"

export default function NewMessageScreen() {
  const { users, isLoading } = useAllUsers()
  const { currentUser } = useCurrentUser()
  const { createChannel } = useStreamChat()

  const handleUserSelect = async (user: User) => {
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

      const channel = await createChannel(user.clerkId, `${user.firstName} ${user.lastName}`)

      if (channel) {
        console.log("✅ Channel created, navigating to:", channel.id)
        router.push(`/chat/${channel.id}`)
      }
    } catch (error) {
      console.error("❌ Failed to create channel:", error)
    }
  }

  const filteredUsers = users?.filter((user) => user.clerkId !== currentUser?.clerkId) || []

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => handleUserSelect(item)}
      className="flex-row items-center p-4 border-b border-gray-100"
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
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No users found</Text>
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
