import { useState, useEffect } from "react";
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

const SearchPostsScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const insets = useSafeAreaInsets();
  const { currentUser } = useCurrentUser();
  const { posts, reactToPost, deletePost, getCurrentUserReaction } = usePosts();

  // Load recent searches from storage (you might want to use AsyncStorage)
  useEffect(() => {
    // For now, we'll use dummy recent searches
    setRecentSearches(["React Native", "JavaScript", "Mobile Development"]);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchText.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simulate search delay
    const searchTimeout = setTimeout(() => {
      const filteredPosts = posts.filter((post: Post) => {
        const searchLower = searchText.toLowerCase();

        // Ensure post.author exists before accessing its properties
        if (!post.author) {
          return false; 
        }

        const contentMatch = post.content.toLowerCase().includes(searchLower);
        const authorMatch = `${post.author.firstName} ${post.author.lastName}`
          .toLowerCase()
          .includes(searchLower);
        const usernameMatch = post.author.username
          .toLowerCase()
          .includes(searchLower);

        return contentMatch || authorMatch || usernameMatch;
      });

      setSearchResults(filteredPosts);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchText, posts]);

  const handleRecentSearchPress = (search: string) => {
    setSearchText(search);
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  const handlePostMenuOpen = (post: Post) => {
    // Handle post menu opening
    console.log("Open post menu for:", post._id);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center px-2 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-1 p-1">
          <ChevronLeft size={26} color="#000" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4">
          <Search size={20} color="#657786" />
          <TextInput
            placeholder="Search posts"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            style={{
              paddingVertical: Platform.OS === "android" ? 8 : 12,
            }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color="#657786" />
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
              <Text className="text-lg font-semibold text-gray-900">
                Recent
              </Text>
              <TouchableOpacity>
                <Text className="text-blue-500 font-medium">See all</Text>
              </TouchableOpacity>
            </View>

            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleRecentSearchPress(search)}
                className="flex-row items-center py-3"
              >
                <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                  <Search size={18} color="#657786" />
                </View>
                <Text className="text-base text-gray-900">{search}</Text>
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
                <Text className="text-gray-500 mt-4">Searching posts...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View className="items-center justify-center py-12 px-8">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                  <Search size={32} color="#65676B" />
                </View>
                <Text className="text-xl font-semibold text-gray-900 mb-3">
                  No results found
                </Text>
                <Text className="text-gray-500 text-center text-base leading-6">
                  {`No posts found for "${searchText}". Try searching for something else.`}
                </Text>
              </View>
            ) : (
              <View>
                <View className="px-4 py-3 bg-gray-50">
                  <Text className="text-sm font-medium text-gray-600">
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""} for "{searchText}"
                  </Text>
                </View>

                {searchResults.map((post: Post, index: number) => (
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
                    {index < searchResults.length - 1 && (
                      <View className="h-px bg-gray-200 mx-4" />
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
