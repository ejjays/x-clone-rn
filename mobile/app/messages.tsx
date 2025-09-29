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
  InteractionManager,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useStreamChat } from "@/context/StreamChatContext";
import CustomChannelList from "@/components/CustomChannelList";
import NoMessagesFound from "@/components/NoMessagesFound";
import { useState, useEffect, useCallback, useRef } from "react";
import LottieView from "lottie-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";
import * as NavigationBar from "expo-navigation-bar";
import { useFocusEffect } from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/context/ThemeContext";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

export default function MessagesScreen() {
  const { isConnecting, isConnected, channels, client, refreshChannels } =
    useStreamChat();
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();
  const { users: allUsers, isLoading: usersLoading } = useAllUsers();
  const { currentUser } = useCurrentUser();
  const { colors } = useTheme();
  const [isRefetching, setIsRefetching] = useState(false);
  const [isReturningFromChat, setIsReturningFromChat] = useState(false);

  const isDarkMode = true;

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

  const handleUserPress = (user) => {
    console.log("Selected user:", user);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  useFocusEffect(
    useCallback(() => {
      const isFromChat = router.canGoBack();
      setIsReturningFromChat(isFromChat);

      if (isFromChat) {
        InteractionManager.runAfterInteractions(() => {
          if (refreshChannels) {
            refreshChannels();
          }
        });

        setTimeout(() => setIsReturningFromChat(false), 500);
      }

      return () => {
        try {
          StatusBar.setBarStyle("light-content");
        } catch {}
      };
    }, [refreshChannels])
  );

  const renderContent = useCallback(() => {
    if (isReturningFromChat && channels.length > 0) {
      return (
        <CustomChannelList
          onRefresh={() => {
            InteractionManager.runAfterInteractions(() => {
              refreshChannels();
            });
          }}
          searchQuery={searchQuery}
          isDarkMode={isDarkMode}
          refreshControlColor={colors.refreshControlColor}
          refreshControlBackgroundColor={colors.refreshControlBackgroundColor}
        />
      );
    }

    if (isConnecting && !client) {
      return (
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: colors.chatBackground }}
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
          style={{ backgroundColor: colors.chatBackground }}
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
        onRefresh={() => {
          InteractionManager.runAfterInteractions(() => {
            refreshChannels();
          });
        }}
        searchQuery={searchQuery}
        isDarkMode={isDarkMode}
        refreshControlColor={colors.refreshControlColor}
        refreshControlBackgroundColor={colors.refreshControlBackgroundColor}
      />
    );
  }, [isConnecting, client, colors, refreshChannels, searchQuery, isDarkMode, isReturningFromChat, channels.length]);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: colors.chatBackground,
      }}
    >
      <StatusBar barStyle={"light-content"} backgroundColor="#000000" translucent={false} />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-2"
        style={{ backgroundColor: colors.chatBackground }}
      >
        <View className="flex-row items-center">
          <MaskedView
            maskElement={
              <Text
                className="text-3xl font-extrabold"
                style={{ backgroundColor: 'transparent', color: 'black' }}
              >
                messages
              </Text>
            }
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF0000"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              {/* Invisible sizing text to bound the gradient */}
              <Text className="text-3xl font-extrabold" style={{ opacity: 0 }}>
                messages
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleNewMessage}
            className="w-10 h-10 rounded-full items-center justify-center mr-1"
            disabled={!client || !isConnected}
          >
            <Ionicons name="create-outline" size={27} color={colors.icon} />
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
          style={{ backgroundColor: colors.chatBackground, borderWidth: 1, borderColor: colors.border }}
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
      <DeferredPeopleStrip users={realUsers} colors={colors} getInitials={getInitials} onPress={handleUserPress} />
        )}
      </View>

      {/* Messages Content (CustomChannelList) */}
      <View className="flex-1">{renderContent()}</View>
    </SafeAreaView>
  );
}

function DeferredPeopleStrip({ users, colors, getInitials, onPress }: any) {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Use shorter delay for faster appearance
    const timeout = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timeout);
  }, []);
  
  if (!ready || !users?.length) return null;
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4"
      // Add performance props
      removeClippedSubviews={true}
      scrollEventThrottle={32}
    >
      {users.map((user: any) => (
        <TouchableOpacity
          key={user._id}
          className="items-center mr-4"
          onPress={() => onPress(user)}
          activeOpacity={0.7}
        >
          {user.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              className="w-20 h-20 rounded-full border-2"
              style={{ borderColor: colors.blue }}
              resizeMode="cover"
              fadeDuration={0}
            />
          ) : (
            <View
              className="w-20 h-20 rounded-full border-2 items-center justify-center"
              style={{
                borderColor: colors.blue,
                backgroundColor: colors.chatBackground,
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
  );
}