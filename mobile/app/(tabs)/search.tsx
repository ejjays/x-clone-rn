"use client"

import UserCard from "@/components/UserCard"
import { useAllUsers } from "@/hooks/useAllUsers"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { User } from "@/types"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { View, TextInput, ScrollView, Text, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const SearchScreen = () => {
  const [searchText, setSearchText] = useState("")
  const { users, isLoading, error, refetch } = useAllUsers()
  const { currentUser } = useCurrentUser()
  const insets = useSafeAreaInsets()

  // Filter users based on search text and exclude current user
  const filteredUsers = users.filter((user: User) => {
    if (currentUser && user._id === currentUser._id) return false

    if (!searchText.trim()) return true

    const searchLower = searchText.toLowerCase()
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const username = user.username.toLowerCase()

    return fullName.includes(searchLower) || username.includes(searchLower)
  })

  const handleFollow = (userId: string) => {
    console.log("Follow user:", userId)
    // Implement follow functionality
  }

  const handleMessage = (user: User) => {
    console.log("Message user:", user)
    // Implement messaging functionality
  }

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-4 py-4 bg-white">
          <Text className="text-3xl font-bold text-gray-900">Peoples</Text>
        </View>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-gray-500 mb-4">Failed to load users</Text>
          <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={() => refetch()}>
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-4 py-4 bg-white">
        <Text className="text-3xl font-bold text-gray-900 mb-3">Peoples</Text>
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search people"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x" size={20} color="#657786" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* USERS LIST */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
           <RefreshControl
             refreshing={isRefetching}
             onRefresh={handlePullToRefresh}
             colors={["#1877F2"]} 
              tintColor="#1877F2"  
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center p-8">
            <ActivityIndicator size="large" color="#1877F2" />
            <Text className="text-gray-500 mt-4">Loading people...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <View className="items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                <Feather name="users" size={32} color="#65676B" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-3">
                {searchText ? "No people found" : "No people yet"}
              </Text>
              <Text className="text-gray-500 text-center text-base leading-6 max-w-xs">
                {searchText
                  ? `No results found for "${searchText}"`
                  : "People will appear here when they join the app."}
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-white">
            {filteredUsers.map((user: User) => (
              <UserCard key={user._id} user={user} onFollow={handleFollow} onMessage={handleMessage} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default SearchScreen
