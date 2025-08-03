import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useStreamChat } from "@/context/StreamChatContext";
import CustomChannelList from "@/components/CustomChannelList";
import NoMessagesFound from "@/components/NoMessagesFound";
import CustomThemeToggle from "@/components/CustomThemeToggle";
import { useState, useEffect } from "react";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/context/ThemeContext";

export default function MessagesScreen() {
  const { isConnecting, isConnected, channels, client, refreshChannels } =
    useStreamChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [isWaveAnimating, setIsWaveAnimating] = useState(false);
  const insets = useSafeAreaInsets();
  const { users: allUsers, isLoading: usersLoading } = useAllUsers();
  const { currentUser } = useCurrentUser();
  const { isDarkMode, toggleTheme, colors } = useTheme(); // Get colors from useTheme hook

  // Filter out current user and get real users
  const realUsers =
    allUsers?.filter((user) => user._id !== currentUser?._id) || [];

  const handleNewMessage = () => {
    router.push("/new-message");
  };

  const handleBack = () => {
    router.back();
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleToggleDarkMode = () => {
    toggleTheme();
  };

  const handleWaveAnimationStart = () => {
    setIsWaveAnimating(true);
  };

  const handleWaveAnimationComplete = () => {
    setIsWaveAnimating(false);
  };

  const handleUserPress = (user) => {
    console.log("Selected user:", user);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const renderContent = () => {
    if (isConnecting && !client) {
      return (
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: colors.background }}
        >
          <LottieView
            source={require("@/assets/animations/loading-loader.json")}
            autoPlay
            loop
            className="w-24 h-24"
          />
          <Text style={{ color: colors.textMuted }} className="mt-2">
            Loading conversations...
          </Text>
        </View>
      );
    }

    if (!client || !isConnected) {
      return (
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ backgroundColor: colors.background }}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={64}
            color={colors.textMuted}
          />
          <Text
            className="text-xl font-semibold mt-4 mb-2"
            style={{ color: colors.text }}
          >
            Connection Issue
          </Text>
          <Text className="text-center" style={{ color: colors.textSecondary }}>
            Unable to connect to chat service. Please check your internet
            connection.
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-lg mt-4"
            style={{ backgroundColor: colors.blue }}
            onPress={refreshChannels}
          >
            <Text className="text-white font-semibold">Retry Connection</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (channels.length === 0) {
      return <NoMessagesFound onRefresh={refreshChannels} />;
    }

    return (
      <CustomChannelList
        onRefresh={refreshChannels}
        searchQuery={searchQuery}
        isDarkMode={isDarkMode}
      />
    );
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {/* Main Content with Animated Background */}
      <View
        className="flex-1"
        style={{
          paddingTop: insets.top,
          backgroundColor: colors.background, // This will change instantly when isDarkMode changes
        }}
      >
        {/* Header with Custom Dark Mode Toggle */}
        <View
          className="flex-row items-center justify-between px-4 py-2"
          style={{ backgroundColor: colors.background }}
        >
          <View className="flex-row items-center">
            <Text
              className="text-3xl font-extrabold"
              style={{ color: colors.blue }}
            >
              messages
            </Text>
          </View>
          <View className="flex-row items-center">
            {/* Custom Theme Toggle Component with Wave Animation */}
            <View className="mr-3">
              <CustomThemeToggle
                isDarkMode={isDarkMode}
                onToggle={handleToggleDarkMode}
                onWaveAnimationStart={handleWaveAnimationStart}
                onWaveAnimationComplete={handleWaveAnimationComplete}
              />
            </View>

            <TouchableOpacity
              onPress={handleNewMessage}
              className="w-10 h-10 rounded-full items-center justify-center mr-1"
              disabled={!client || !isConnected}
            >
              <Ionicons name="create" size={27} color={colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full items-center justify-center"
              disabled={!client || !isConnected}
            >
              <FontAwesome5 name="facebook" size={26} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Field */}
        <View className="px-4 py-1">
          <View
            className="flex-row items-center rounded-full px-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="search" size={25} color={colors.textMuted} />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Search conversations..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              style={{
                paddingVertical: Platform.OS === "android" ? 10 : 12,
                color: colors.text,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="ml-2">
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Horizontal List of Real Users */}
        <View className="py-2">
          {usersLoading ? (
            <View className="flex-row items-center justify-center py-4">
              <LottieView
                source={require("@/assets/animations/loading-loader.json")}
                autoPlay
                loop
                className="w-8 h-8"
              />
              <Text style={{ color: colors.textMuted }} className="ml-2">
                Loading users...
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4"
            >
              {realUsers.map((user) => (
                <TouchableOpacity
                  key={user._id}
                  className="items-center mr-4"
                  onPress={() => handleUserPress(user)}
                >
                  {user.profilePicture ? (
                    <Image
                      source={{ uri: user.profilePicture }}
                      className="w-20 h-20 rounded-full border-2"
                      style={{ borderColor: colors.blue }}
                    />
                  ) : (
                    <View
                      className="w-20 h-20 rounded-full border-2 items-center justify-center"
                      style={{
                        borderColor: colors.blue,
                        backgroundColor: colors.surface,
                      }}
                    >
                      <Text
                        className="font-semibold text-lg"
                        style={{ color: colors.textSecondary }}
                      >
                        {getInitials(user.firstName, user.lastName)}
                      </Text>
                    </View>
                  )}
                  <Text
                    className="text-sm mt-1"
                    numberOfLines={1}
                    style={{ color: colors.textSecondary }}
                  >
                    {user.firstName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Messages Content */}
        <View className="flex-1">{renderContent()}</View>
      </View>
    </View>
  );
}
