import UserCard from "@/components/UserCard";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { User } from "@/types";
import { Search, Users, X } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const SearchScreen = () => {
  const [searchText, setSearchText] = useState("");
  const { users, isLoading, error, refetch } = useAllUsers();
  const { currentUser } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Filter users based on search text and exclude current user
  const filteredUsers = users.filter((user: User) => {
    if (currentUser && user._id === currentUser._id) return false;

    if (!searchText.trim()) return true;

    const searchLower = searchText.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const username = user.username.toLowerCase();

    return fullName.includes(searchLower) || username.includes(searchLower);
  });

  const handleMessage = (user: User) => {
    console.log("Message user:", user);
    // Implement messaging functionality
  };

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          className="px-4 py-4"
          style={{ backgroundColor: colors.background }}
        >
          <Text className="text-3xl font-bold" style={{ color: colors.text }}>
            Peoples
          </Text>
        </View>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="mb-4" style={{ color: colors.textMuted }}>
            Failed to load users
          </Text>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.blue }}
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* HEADER */}
      <View
        className="px-4 py-4"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-3xl font-bold mb-3"
          style={{ color: colors.text }}
        >
          Peoples
        </Text>
        <View
          className="flex-row items-center rounded-full px-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Search size={20} color={colors.textMuted} />
          <TextInput
            placeholder="Search people"
            className="flex-1 ml-3 text-base"
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            style={{
              paddingVertical: Platform.OS === "android" ? 8 : 12,
              color: colors.text,
            }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <X size={20} color={colors.textMuted} />
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
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.blue}
            colors={[colors.blue]}
          />
        }
      >
        {isLoading ? (
          <View
            className="flex-1 items-center justify-center p-8"
            style={{ backgroundColor: colors.background }}
          >
            <ActivityIndicator size="large" color={colors.blue} />
            <Text className="mt-4" style={{ color: colors.textMuted }}>
              Loading people...
            </Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View
            className="flex-1 items-center justify-center p-8"
            style={{ backgroundColor: colors.background }}
          >
            <View className="items-center">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: colors.surface }}
              >
                <Users size={32} color={colors.textMuted} />
              </View>
              <Text
                className="text-xl font-semibold mb-3"
                style={{ color: colors.text }}
              >
                {searchText ? "No people found" : "No people yet"}
              </Text>
              <Text
                className="text-center text-base leading-6 max-w-xs"
                style={{ color: colors.textMuted }}
              >
                {searchText
                  ? `No results found for "${searchText}"`
                  : "People will appear here when they join the app."}
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: colors.background }}>
            {filteredUsers.map((user: User) => (
              <UserCard key={user._id} user={user} onMessage={handleMessage} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
