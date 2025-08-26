import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ChevronLeft, Search, X } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import PostCard from "@/components/PostCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { DarkThemeColors } from "@/constants/Colors";

const SearchPostsScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [debouncedText, setDebouncedText] = useState("");

  const insets = useSafeAreaInsets();
  const { currentUser } = useCurrentUser();
  const { posts, reactToPost, deletePost, getCurrentUserReaction } = usePosts();

  // Load recent searches from storage (you might want to use AsyncStorage)
  useEffect(() => {
    // For now, we'll use dummy recent searches
    setRecentSearches(["React Native", "JavaScript", "Mobile Development"]);
  }, []);

  // Debounce search text updates
  useEffect(() => {
    const t = setTimeout(() => setDebouncedText(searchText), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  // Display a brief loading indicator on text change
  useEffect(() => {
    if (searchText.trim().length === 0) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => setIsSearching(false), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  // Compute filtered results from posts and debounced text
  const filteredPosts = useMemo(() => {
    const t = debouncedText.trim().toLowerCase();
    if (t.length === 0) return [] as Post[];

    return posts.filter((post: Post) => {
      const contentMatch = (post.content || "").toLowerCase().includes(t);
      const authorFirstName = post.author?.firstName?.toLowerCase() || '';
      const authorLastName = post.author?.lastName?.toLowerCase() || '';
      const authorUsername = post.author?.username?.toLowerCase() || '';
      const authorMatch = `${authorFirstName} ${authorLastName}`.includes(t);
      const usernameMatch = authorUsername.includes(t);
      return contentMatch || authorMatch || usernameMatch;
    });
  }, [debouncedText, posts]);

  const handleRecentSearchPress = (search: string) => {
    setSearchText(search);
  };

  const clearSearch = () => {
    setSearchText("");
  };

  const handlePostMenuOpen = (post: Post) => {
    // Handle post menu opening
    console.log("Open post menu for:", post._id);
  };

  return (
    <View className="flex-1" style={{ paddingTop: insets.top, backgroundColor: DarkThemeColors.background }}>
      <StatusBar style="light" backgroundColor={DarkThemeColors.background} />

      {/* Header */}
      <View className="flex-row items-center px-2 py-3 border-b" style={{ backgroundColor: DarkThemeColors.surface, borderBottomColor: DarkThemeColors.border }}>
        <TouchableOpacity onPressIn={() => router.back()} className="mr-1 p-1">
          <ChevronLeft size={26} color={DarkThemeColors.icon} />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center rounded-full px-2" style={{ backgroundColor: DarkThemeColors.background }}>
          <Search size={20} color={DarkThemeColors.textSecondary} />
          <TextInput
            placeholder="Search posts"
            className="flex-1 ml-3 text-base" style={{ color: DarkThemeColors.text }}
            placeholderTextColor={DarkThemeColors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            style={{
              paddingVertical: Platform.OS === "android" ? 8 : 12,
            }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={DarkThemeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recent Searches - Show when no search text */}
        {searchText.trim().length === 0 && (
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold" style={{ color: DarkThemeColors.text }}>
                Recent
              </Text>
              <TouchableOpacity>
                <Text className="font-medium" style={{ color: DarkThemeColors.blue }}>See all</Text>
              </TouchableOpacity>
            </View>

            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleRecentSearchPress(search)}
                className="flex-row items-center py-3"
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: DarkThemeColors.surface }}>
                  <Search size={18} color={DarkThemeColors.textSecondary} />
                </View>
                <Text className="text-base" style={{ color: DarkThemeColors.text }}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Results */}
        {searchText.trim().length > 0 && (
          <View>
            {isSearching ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color="#1877F2" />
                <Text className="mt-4" style={{ color: DarkThemeColors.textSecondary }}>Searching posts...</Text>
              </View>
            ) : filteredPosts.length === 0 ? (
              <View className="items-center justify-center py-12 px-8">
                <View className="w-20 h-20 rounded-full items-center justify-center mb-6" style={{ backgroundColor: DarkThemeColors.surface }}>
                  <Search size={32} color={DarkThemeColors.textSecondary} />
                </View>
                <Text className="text-2xl font-semibold" style={{ color: DarkThemeColors.text }}>
                  No results found
                </Text>
                <Text className="text-center text-base leading-6" style={{ color: DarkThemeColors.textSecondary }}>
                  {`No posts found for "${searchText}". Try searching for something else.`}
                </Text>
              </View>
            ) : (
              <View>
                <View className="px-4 py-3" style={{ backgroundColor: DarkThemeColors.surface }}>
                  <Text className="text-sm font-medium" style={{ color: DarkThemeColors.textSecondary }}>
                    {filteredPosts.length} result
                    {filteredPosts.length !== 1 ? "s" : ""} for "{searchText}"
                  </Text>
                </View>

                {filteredPosts.map((post: Post, index: number) => (
                  <View key={post._id}>
                    <PostCard
                      post={post}
                      reactToPost={reactToPost}
                      onDelete={deletePost}
                      onComment={() => {}}
                      currentUser={currentUser!}
                      currentUserReaction={getCurrentUserReaction(
                        post.reactions,
                        currentUser!
                      )}
                      onOpenPostMenu={handlePostMenuOpen}
                    />
                    {index < filteredPosts.length - 1 && (
                      <View className="h-px mx-4" style={{ backgroundColor: DarkThemeColors.border }} />
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchPostsScreen;
