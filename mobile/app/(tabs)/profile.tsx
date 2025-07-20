import EditProfileModal from "@/components/EditProfileModal"
import PostsList from "@/components/PostsList"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePosts } from "@/hooks/usePosts"
import { useProfile } from "@/hooks/useProfile"
import { useSignOut } from "@/hooks/useSignOut"
import { ArrowLeft, Calendar, Camera, ChevronDown, LogOut, MapPin, UserX } from "lucide-react-native" 
import { format } from "date-fns"
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity, RefreshControl } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router } from "expo-router"

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

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.push("/(tabs)/")
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-2">Loading profile...</Text>
      </View>
    )
  }

  if (!currentUser) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-8">
        <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-6">
          <UserX size={32} color="#4B5563" />
        </View>
        <Text className="text-xl font-bold text-gray-800 mb-3">Profile not available</Text>
        <Text className="text-gray-600 text-center text-base leading-6 mb-6">
          We couldn't load your profile. Please check your connection and try again.
        </Text>
        <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-full shadow-md" onPress={() => router.push("/(tabs)/")}>
          <Text className="text-white font-semibold">Go to Home</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={handleBackPress}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Profile</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={handleSignOut}>
          <LogOut size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

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
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        <View className="relative">
          <Image
            source={{
              uri:
                currentUser.bannerImage ||
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
            }}
            className="w-full h-56"
            resizeMode="cover"
          />

          <View className="absolute -bottom-16 left-6 z-10">
            <View className="relative">
              <Image
                source={{
                  uri:
                    currentUser.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName + " " + currentUser.lastName)}&background=2563EB&color=fff&size=120`,
                }}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <TouchableOpacity className="absolute bottom-2 right-2 w-10 h-10 bg-gray-100 rounded-full items-center justify-center border-2 border-white shadow-md">
                <Camera size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-6 pt-20 pb-6 border-b border-gray-200 bg-white">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl font-bold text-gray-800 mr-2">
                  {currentUser.firstName} {currentUser.lastName}
                </Text>
                <TouchableOpacity>
                  <ChevronDown size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 text-base mb-3">@{currentUser.username}</Text>
            </View>

            <TouchableOpacity className="bg-blue-600 px-5 py-2.5 rounded-full shadow-md" onPress={openEditModal}>
              <Text className="font-semibold text-white text-sm">Edit profile</Text>
            </TouchableOpacity>
          </View>

          {currentUser.bio && <Text className="text-gray-700 text-base mb-4 leading-6">{currentUser.bio}</Text>}

          <View className="space-y-3 mb-4">
            {currentUser.location && (
              <View className="flex-row items-center">
                <MapPin size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">{currentUser.location}</Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                Joined {currentUser.createdAt ? format(new Date(currentUser.createdAt), "MMMM yyyy") : "Recently"}
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-6">
            <TouchableOpacity className="mr-4">
              <Text className="text-gray-800">
                <Text className="font-bold text-lg">{currentUser.following?.length || 0}</Text>
                <Text className="text-gray-600"> Following</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-gray-800">
                <Text className="font-bold text-lg">{currentUser.followers?.length || 0}</Text>
                <Text className="text-gray-600"> Followers</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 py-4 border-b border-gray-200 bg-white">
          <Text className="text-lg font-bold text-gray-800">Posts</Text>
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
