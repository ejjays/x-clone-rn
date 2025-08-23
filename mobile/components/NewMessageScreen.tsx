import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { MessageCircle, Search, Users, X } from "lucide-react-native"; // Replaced Feather
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { User } from "@/types";

interface NewMessageScreenProps {
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

const NewMessageScreen = ({ onSelectUser, onClose }: NewMessageScreenProps) => {
  const [searchText, setSearchText] = useState("");
  const { users, isLoading, error } = useAllUsers();
  const { currentUser } = useCurrentUser();

  // Filter users based on search text and exclude current user
  const filteredUsers = users.filter((user: User) => {
    if (currentUser && user._id === currentUser._id) return false;

    if (!searchText.trim()) return true;

    const searchLower = searchText.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const username = user.username.toLowerCase();

    return fullName.includes(searchLower) || username.includes(searchLower);
  });

  const handleUserSelect = (user: User) => {
    onSelectUser(user);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Removed marginTop style */}
      <View className="flex-row items-center px-4">
        <TouchableOpacity onPress={onClose} className="mr-4">
          <X size={24} color="#1C1E21" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900">
          New Messagey
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Search size={20} color="#657786" />
          <TextInput
            placeholder="Search people"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <X size={20} color="#657786" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Users List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#1877F2" />
            <Text className="text-gray-500 mt-4">Loading people...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 mb-4">Failed to load people</Text>
            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                <Users size={32} color="#65676B" />
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
          <View>
            {filteredUsers.map((user: User) => {
              const profilePicture =
                user.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.firstName + " " + user.lastName
                )}&background=1877F2&color=fff&size=120`;

              return (
                <TouchableOpacity
                  key={user._id}
                  className="flex-row items-center bg-white"
                  onPress={() => handleUserSelect(user)}
                >
                  {/* Profile Picture */}
                  <Image
                    source={{ uri: profilePicture }}
                    className="w-18 h-18 rounded-full mr-4"
                  />

                  {/* User Info */}
                  <View className="flex-1 py-3 px-4">
                    <Text className="text-lg font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      @{user.username}
                    </Text>
                    {user.bio && (
                      <Text
                        className="text-gray-600 text-sm mt-1"
                        numberOfLines={1}
                      >
                        {user.bio}
                      </Text>
                    )}
                  </View>

                  {/* Message Icon */}
                  <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center">
                    <MessageCircle size={20} color="white" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer Info */}
      {!isLoading && filteredUsers.length > 0 && (
        <View className="px-4 bg-gray-50">
          <Text className="text-xs text-gray-500 text-center">
            Tap on a person to start a conversation
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NewMessageScreen;
