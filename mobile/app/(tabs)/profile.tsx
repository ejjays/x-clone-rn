"use client"

import EditProfileModal from "@/components/EditProfileModal"
import PostsList from "@/components/PostsList"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePosts } from "@/hooks/usePosts"
import { useProfile } from "@/hooks/useProfile"
import { useSignOut } from "@/hooks/useSignOut"
import { Feather } from "@expo/vector-icons"
import { format } from "date-fns"
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity, RefreshControl } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const ProfileScreens = () => {
  const { currentUser, isLoading } = useCurrentUser()
  const insets = useSafeAreaInsets()
  const { handleSignOut } = useSignOut()

  const { posts: userPosts, refetch: refetchPosts, isLoading: isRefetching } = usePosts(currentUser?.username)

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile()

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfile()
              refetchPosts()
            }}
            tintColor="#1DA1F2"
          />
        }
      >
        {/* Cover Photo with Header Overlay */}
        <View className="relative">
          <Image
            source={{
              uri:
                currentUser.bannerImage ||
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
            }}
            className="w-full h-64"
            resizeMode="cover"
          />

          {/* Header Overlay - Positioned absolutely over cover photo */}
          <View
            className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-4 py-2"
            style={{ paddingTop: insets.top + 8 }}
          >
            <TouchableOpacity className="w-10 h-10 items-center justify-center bg-black/30 rounded-full">
              <Feather name="arrow-left" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-10 h-10 items-center justify-center bg-black/30 rounded-full"
              onPress={handleSignOut}
            >
              <Feather name="log-out" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Picture - Positioned over cover photo */}
          <View className="absolute -bottom-16 left-6">
            <View className="relative">
              <Image
                source={{ uri: currentUser.profilePicture }}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
              {/* Camera icon for profile picture */}
              <TouchableOpacity className="absolute bottom-2 right-2 w-10 h-10 bg-gray-200 rounded-full items-center justify-center border-2 border-white">
                <Feather name="camera" size={18} color="#1C1E21" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Info Section */}
        <View className="px-6 pt-20 pb-6 border-b border-gray-100">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl font-bold text-gray-900 mr-2">
                  {currentUser.firstName} {currentUser.lastName}
                </Text>
                <TouchableOpacity>
                  <Feather name="chevron-down" size={20} color="#1C1E21" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 text-base mb-3">@{currentUser.username}</Text>
            </View>

            <TouchableOpacity className="bg-blue-500 px-6 py-2.5 rounded-lg" onPress={openEditModal}>
              <Text className="font-semibold text-white">Edit profile</Text>
            </TouchableOpacity>
          </View>

          {currentUser.bio && <Text className="text-gray-900 text-base mb-4 leading-6">{currentUser.bio}</Text>}

          <View className="space-y-3 mb-4">
            {currentUser.location && (
              <View className="flex-row items-center">
                <Feather name="map-pin" size={16} color="#65676B" />
                <Text className="text-gray-600 ml-2">{currentUser.location}</Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Feather name="calendar" size={16} color="#65676B" />
              <Text className="text-gray-600 ml-2">Joined {format(new Date(currentUser.createdAt), "MMMM yyyy")}</Text>
            </View>
          </View>

          <View className="flex-row space-x-6">
            <TouchableOpacity>
              <Text className="text-gray-900">
                <Text className="font-bold text-lg">{currentUser.following?.length || 0}</Text>
                <Text className="text-gray-500"> Following</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-gray-900">
                <Text className="font-bold text-lg">{currentUser.followers?.length || 0}</Text>
                <Text className="text-gray-500"> Followers</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Section */}
        <View className="px-4 py-4 border-b border-gray-100">
          <Text className="text-lg font-bold text-gray-900">Posts</Text>
          <Text className="text-gray-500 text-sm">{userPosts.length} posts</Text>
        </View>

        <PostsList username={currentUser?.username} />
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
      />
    </View>
  )
}

export default ProfileScreens
