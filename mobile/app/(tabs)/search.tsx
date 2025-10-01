import UserCard from "@/components/UserCard";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { User } from "@/types";
import { Search, Users, X } from "lucide-react-native";
import React, { useState, memo } from "react";
import { View, TextInput, FlatList, Text, ActivityIndicator, RefreshControl, TouchableOpacity, Platform, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get('window');

const SearchScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"suggestions" | "yourFriends">("suggestions");
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

  const suggestionsUsers = filteredUsers.filter(
    (user: User) => !currentUser?.following.includes(user._id)
  );
  const yourFriendsUsers = filteredUsers.filter((user: User) =>
    currentUser?.following.includes(user._id)
  );

  const displayedUsers =
    activeTab === "suggestions" ? suggestionsUsers : yourFriendsUsers;

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

  const renderHeader = () => (
    <View
      className="px-4 pt-4" // Removed bottom padding to be part of the list
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

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            {
              backgroundColor:
                activeTab === "suggestions"
                  ? colors.surface
                  : "transparent", // Changed to transparent
            },
          ]}
          onPress={() => setActiveTab("suggestions")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "suggestions"
                    ? colors.text
                    : colors.textMuted,
              },
            ]}
          >
            Suggestions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            {
              backgroundColor:
                activeTab === "yourFriends"
                  ? colors.surface
                  : "transparent", // Changed to transparent
            },
          ]}
          onPress={() => setActiveTab("yourFriends")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "yourFriends"
                    ? colors.text
                    : colors.textMuted,
              },
            ]}
          >
            Your friends
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingTop: 50 }}
    >
      {isLoading && !displayedUsers.length ? ( // Show loading indicator only when there are no users
        <View
          className="flex-1 items-center justify-center p-8"
          style={{ backgroundColor: colors.background }}
        >
          <ActivityIndicator size="large" color={colors.blue} />
          <Text className="mt-4" style={{ color: colors.textMuted }}>
            Loading people...
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedUsers}
          keyExtractor={(u) => u._id}
          renderItem={({ item }) => (
            <UserCard user={item} onMessage={handleMessage} />
          )}
          ListHeaderComponent={renderHeader} // Use ListHeaderComponent
          contentContainerStyle={{ paddingBottom: insets.bottom }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.refreshControlColor}
              colors={[colors.refreshControlColor]}
              progressBackgroundColor={colors.refreshControlBackgroundColor}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              className="flex-1 items-center justify-center p-8"
              style={{ minHeight: 400 }} 
            >
              <View className="items-center">
                <LottieView
                  source={require("../../assets/animations/empty-follow.json")} 
                  autoPlay
                  loop
                  style={{ width: width * 0.85, height: width * 0.85, marginBottom: -20 }}
                />
                <Text className="text-xl font-semibold mb-3" style={{ color: colors.text }}>
                  {searchText
                    ? "No people found"
                    : activeTab === "suggestions"
                    ? "No suggestions yet"
                    : "You are not following anyone yet"}
                </Text>
                <Text className="text-center text-base leading-6 max-w-xs" style={{ color: colors.textMuted }}>
                  {searchText
                    ? `No results found for \'''${searchText}\'''`
                    : activeTab === "suggestions"
                    ? "Suggestions will appear here."
                    : "People you follow will appear here."}
                </Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
    paddingBottom: 8, // Add some padding at the bottom
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontWeight: "600",
    fontSize: 14,
  },
});

export default memo(SearchScreen);
