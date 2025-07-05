import EditProfileModal from "@/components/EditProfileModal"
import PostsList from "@/components/PostsList"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePosts } from "@/hooks/usePosts"
import { useProfile } from "@/hooks/useProfile"
import { useSignOut } from "@/hooks/useSignOut"
import { ArrowLeft, Calendar, Camera, ChevronDown, LogOut, MapPin, UserX } from "lucide-react-native" // Replaced Feather
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
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text className="text-gray-500 mt-2">Loading profile...</Text>
      </View>
    )
  }

  if (!currentUser) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
          <UserX size={32} color="#65676B" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-3">Profile not available</Text>
        <Text className="text-gray-500 text-center text-base leading-6 mb-6">
          We couldn't load your profile. Please check your connection and try again.
        </Text>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-full" onPress={() => router.push("/(tabs)/")}>
          <Text className="text-white font-semibold">Go to Home</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row justify-between items-center px-4 py-1 bg-white">
        <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={handleBackPress}>
          <ArrowLeft size={28} color="#1C1E21" />
        </TouchableOpacity>

        <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={handleSignOut}>
          <LogOut size={24} color="#E0245E" />
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
            colors={["#1877F2"]}
            tintColor="#1877F2"
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
            className="w-full h-64"
            resizeMode="cover"
          />

          <View className="absolute -bottom-16 left-6">
            <View className="relative">
              <Image
                source={{
                  uri:
                    currentUser.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName + " " + currentUser.lastName)}&background=1877F2&color=fff&size=120`,
                }}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
              <TouchableOpacity className="absolute bottom-2 right-2 w-10 h-10 bg-gray-200 rounded-full items-center justify-center border-2 border-white">
                <Camera size={18} color="#1C1E21" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-6 pt-20 pb-6 border-b border-gray-100">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl font-bold text-gray-900 mr-2">
                  {currentUser.firstName} {currentUser.lastName}
                </Text>
                <TouchableOpacity>
                  <ChevronDown size={20} color="#1C1E21" />
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
                <MapPin size={16} color="#65676B" />
                <Text className="text-gray-600 ml-2">{currentUser.location}</Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Calendar size={16} color="#65676B" />
              <Text className="text-gray-600 ml-2">
                Joined {currentUser.createdAt ? format(new Date(currentUser.createdAt), "MMMM yyyy") : "Recently"}
              </Text>
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