import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import { useApiClient, userApi } from "@/utils/api";
import { useTheme } from "@/context/ThemeContext";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator, Image, TouchableOpacity, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin } from "lucide-react-native";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react-native";
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function UserProfile() {
  const { userId, username: usernameParam, user: userParam } = useLocalSearchParams<{ userId: string; username?: string; user?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const api = useApiClient();

  const preloaded = React.useMemo(() => {
    try {
      return userParam ? JSON.parse(decodeURIComponent(String(userParam))) : null;
    } catch {
      return null;
    }
  }, [userParam]);

  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile", userId, usernameParam],
    queryFn: async () => {
      try {
        return (await userApi.getUserById(api, String(userId))).data;
      } catch (e: any) {
        // Fallback to username param if backend route differs
        const username = usernameParam as string | undefined;
        if (username) {
          const res = await api.get(`/users/username/${username}`);
          return res.data;
        }
        throw e;
      }
    },
    enabled: Boolean(!preloaded && (userId || usernameParam)),
    initialData: preloaded || undefined,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["userPosts", user?.username],
    queryFn: async () => (await api.get(`/posts/user/${user?.username}`)).data.posts,
    enabled: Boolean(user?.username),
  });

  if (isLoading || !user) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  const header = (
    <View>
      <View className="relative">
        <Image
          source={{ uri: user.bannerImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop" }}
          className="w-full h-56"
          resizeMode="cover"
        />
        <TouchableOpacity onPressIn={() => router.back()} style={{ position: "absolute", top: 12 + insets.top, left: 12, padding: 8, borderRadius: 9999, backgroundColor: "rgba(0,0,0,0.35)" }}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <View className="absolute -bottom-16 left-6 z-10">
          <View className="relative">
            <Image
              source={{ uri: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.firstName || "") + " " + (user.lastName || ""))}&background=2563EB&color=fff&size=120` }}
              className="w-40 h-40 rounded-full border-4 shadow-lg"
              style={{ borderColor: colors.blue }}
            />
          </View>
        </View>
      </View>

      <View className="px-6 pt-20 pb-6 border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-2xl font-bold mr-2" style={{ color: colors.text }}>
                {user.firstName} {user.lastName}
              </Text>
            </View>
            <View className="space-y-3 mt-4">
              {user.location && (
                <View className="flex-row items-center mb-2">
                  <MapPin size={18} color={colors.textSecondary} />
                  <Text className="ml-2" style={{ color: colors.textSecondary }}>{user.location}</Text>
                </View>
              )}
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.textSecondary} />
                <Text className="ml-2" style={{ color: colors.textSecondary }}>
                  Joined {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {user.bio ? (
          <Text className="text-lg mt-3 leading-6 font-medium" style={{ color: colors.textSecondary }}>{user.bio}</Text>
        ) : null}
      </View>

      <View className="px-6 py-4 border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>Posts</Text>
        <Text className="text-sm" style={{ color: colors.textMuted }}>{Array.isArray(posts) ? posts.length : 0} posts</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={[{ key: "posts" }]}
        keyExtractor={(i) => i.key}
        renderItem={() => (
          <PostsList username={user.username} onOpenPostMenu={() => {}} />
        )}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}