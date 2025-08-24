import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import { useSignOut } from "@/hooks/useSignOut";
import {
  LogOut,
  MapPin,
  UserX,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import ConfirmationAlert from "@/components/ConfirmationAlert";

const ProfileScreens = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { handleSignOut, isSignOutAlertVisible, confirmSignOut, cancelSignOut } = useSignOut();
  const { colors } = useTheme();

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)/");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text className="mt-2" style={{ color: colors.textMuted }}>Loading profile...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background }}>
        <View className="w-20 h-20 rounded-full items-center justify-center mb-6" style={{ backgroundColor: colors.surface }}>
          <UserX size={32} color={colors.textMuted} />
        </View>
        <Text className="text-xl font-bold mb-3" style={{ color: colors.text }}>
          Profile not available
        </Text>
        <Text className="text-center text-base leading-6 mb-6" style={{ color: colors.textMuted }}>
          We couldn\'t load your profile. Please check your connection and try
          again.
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-full shadow-md"
          onPressIn={() => router.push("/(tabs)/")}
          style={{ backgroundColor: colors.blue }}
        >
          <Text className="font-semibold text-white">Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
      <View className="flex-row justify-between items-center px-4 py-3 border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>Profile</Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={handleSignOut}
        >
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
              refetchProfile();
              refetchPosts();
            }}
            colors={[colors.refreshControlColor]}
            tintColor={colors.refreshControlColor}
            progressBackgroundColor={colors.refreshControlBackgroundColor}
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
                className="w-40 h-40 rounded-full border-4 shadow-lg" style={{ borderColor: colors.blue }}
              />
              <TouchableOpacity className="absolute bottom-2 right-2 w-10 h-10 rounded-full items-center justify-center border-2 shadow-md" style={{ backgroundColor: colors.surface, borderColor: colors.background }}>
                <Entypo name="camera" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-6 pt-20 pb-6 border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl font-bold mr-2" style={{ color: colors.text }}>
                  {currentUser.firstName} {currentUser.lastName}
                </Text>
              </View>              

              <View className="flex-row space-x-6 mt-2">
                <TouchableOpacity className="mr-4">
                  <Text style={{ color: colors.text }}>
                    <Text className="font-bold text-lg">
                      {currentUser.following?.length || 0}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}> Following</Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={{ color: colors.text }}>
                    <Text className="font-bold text-lg">
                      {currentUser.followers?.length || 0}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}> Followers</Text>
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="space-y-3 mt-4">
                {currentUser.location && (
                  <View className="flex-row items-center mb-2">
                    <MapPin size={18} color={colors.textSecondary} />
                    <Text className="ml-2" style={{ color: colors.textSecondary }}>
                      {currentUser.location}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text className="ml-2" style={{ color: colors.textSecondary }}>
                    Joined{" "}
                    {currentUser.createdAt
                      ? format(new Date(currentUser.createdAt), "MMMM yyyy")
                      : "Recently"}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className="px-5 py-2.5 rounded-full shadow-md"
              onPress={openEditModal}
              style={{ backgroundColor: colors.blue }}
            >
              <Text className="font-semibold text-white text-sm">
                Edit profile
              </Text>
            </TouchableOpacity>
          </View>

          {currentUser.bio && (
            <Text className="text-lg mt-3 leading-6 font-medium" style={{ color: colors.textSecondary }}>
              {currentUser.bio}
            </Text>
          )}
        </View>

        <View className="px-6 py-4 border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Posts</Text>
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            {userPosts.length} posts
          </Text>
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

      <ConfirmationAlert
        visible={isSignOutAlertVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmSignOut}
        onCancel={cancelSignOut}
        confirmTextColor="#EF4444"
      />
    </View>
  );
};

export default ProfileScreens