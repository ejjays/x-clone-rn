import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@clerk/clerk-expo";
import { useAllUsers } from "@/hooks/useAllUsers";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useSignOut } from "@/hooks/useSignOut";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const menuItems = [
  {
    title: "About us",
    iconComponent: (
      <Image
        source={require("@/assets/images/menu/about-us.png")}
        style={{ width: 32, height: 32 }}
        interpolation="high"
      />
    ),
    color: "#2E89FF",
  },
  {
    title: "Saved",
    iconComponent: (
      <Image
        source={require("@/assets/images/menu/saved.png")}
        style={{ width: 32, height: 32 }}
        interpolation="high"
      />
    ),
    color: "#C43E9C",
  },
  {
    title: "Kapatids",
    iconComponent: (
      <Image
        source={require("@/assets/images/menu/friends.png")}
        style={{ width: 33, height: 33 }}
        interpolation="high"
      />
    ),
    color: "#2E89FF",
  },
  {
    title: "Reels",
    iconComponent: (
      <Image
        source={require("@/assets/images/menu/reels.png")}
        style={{ width: 33, height: 33 }}
        interpolation="high"
      />
    ),
    color: "#E53935",
  },
  {
    title: "iGive",
    iconComponent: (
      <Image
        source={require("@/assets/images/menu/igive.png")}
        style={{ width: 32, height: 32 }}
        interpolation="high"
      />
    ),
    color: "#2E89FF",
  },
  {
    title: "Events",
    iconComponent: (
      <Image
        source={require("@/assets/images/menu/events.png")}
        style={{ width: 30, height: 30 }}
        interpolation="high"
      />
    ),
    color: "#2E89FF",
  },
];

const renderIcon = (item) => {
  if (item.iconComponent) {
    return item.iconComponent;
  }
  switch (item.library) {
    case "FontAwesome":
      return <FontAwesome name={item.icon} size={28} color={item.color} />;
    case "FontAwesome5":
      return <FontAwesome5 name={item.icon} size={28} color={item.color} />;
    case "Ionicons":
      return <Ionicons name={item.icon} size={28} color={item.color} />;
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
      );
    default:
      return null;
  }
};

export default function MenuScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentUser, isLoading } = useCurrentUser();
  const { isSignedIn } = useAuth();
  const { users } = useAllUsers();
  const [isSignOutAlertVisible, setSignOutAlertVisible] = useState(false);
  const { handleSignOut } = useSignOut();

  const confirmSignOut = () => {
    handleSignOut();
    setSignOutAlertVisible(false);
  };

  const cancelSignOut = () => {
    setSignOutAlertVisible(false);
  };

  if (!isSignedIn) {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#1e1f20" }}>
      <ScrollView>
        <View
          className="px-4 py-4 flex-row justify-between items-center"
          style={{ backgroundColor: "#1e1f20" }}
        >
          <Text className="text-3xl font-bold" style={{ color: colors.text }}>
            Menu
          </Text>
          <View className="flex-row space-x-8">
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons name="settings" size={24} color={colors.text} />
            </TouchableOpacity>
            <View className="w-2" />
            <TouchableOpacity onPress={() => router.push("(tabs)/search")}>
              <FontAwesome name="search" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mt-2">
          <View style={{ backgroundColor: colors.surface, borderRadius: 12 }}>
            {isLoading ? (
              <View className="flex-row items-center p-4">
                <Text style={{ color: colors.text }}>Loading user data...</Text>
              </View>
            ) : currentUser ? (
              <TouchableOpacity
                onPress={() => router.push(`/user/${currentUser?.id}`)}
                className="flex-row items-center p-4"
              >
                <Image
                  source={{
                    uri:
                      currentUser?.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        (currentUser?.firstName || "") +
                          " " +
                          (currentUser?.lastName || "")
                      )}&background=1877F2&color=fff&size=40`,
                  }}
                  className="w-12 h-12 rounded-full"
                />
                <Text
                  className="text-xl font-bold ml-4"
                  style={{ color: colors.text }}
                >
                  {currentUser?.firstName} {currentUser?.lastName}
                </Text>
                <View className="ml-auto">
                  <View className="bg-gray-700 rounded-full p-2">
                    <FontAwesome
                      name="chevron-down"
                      size={15}
                      color={colors.text}
                    />
                  </View>
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                    <Text className="text-white text-xs font-bold">1</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center p-4">
                <Text style={{ color: colors.text }}>User not found.</Text>
              </View>
            )}
            <View
              className="h-px mx-4"
              style={{ backgroundColor: colors.border }}
            />
            <TouchableOpacity className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center">
                <FontAwesome name="plus" size={24} color={colors.text} />
              </View>
              <View className="ml-4">
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Create new profile or Page
                </Text>
                <Text className="text-sm" style={{ color: colors.text }}>
                  Switch between profiles with one login.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text
            className="text-lg font-bold mt-4 px-2"
            style={{ color: colors.text }}
          >
            Message shortcut
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 mb-4"
          >
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => router.push(`/messages`)}
                className="items-center mr-4"
              >
                <Image
                  source={{
                    uri:
                      user.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        (user.firstName || "") + " " + (user.lastName || "")
                      )}&background=1877F2&color=fff&size=40`,
                  }}
                  className="w-16 h-16 rounded-full"
                />
                <Text className="text-xs mt-2" style={{ color: colors.text }}>
                  {user.firstName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className="flex-row flex-wrap justify-between mt-4">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={`${item.title}-${index}`}
                className="w-[49%] mb-2 p-4 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View>
                  {renderIcon(item)}
                  <View className="mt-2">
                    <Text
                      className="text-base font-bold"
                      style={{ color: colors.text }}
                    >
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              marginTop: 16,
            }}
          >
            <TouchableOpacity className="flex-row items-center p-4">
              <FontAwesome
                name="question-circle"
                size={28}
                color={colors.text}
              />
              <Text
                className="text-lg font-bold ml-4"
                style={{ color: colors.text }}
              >
                Help & feedback
              </Text>
            </TouchableOpacity>
            <View
              className="h-px mx-4"
              style={{ backgroundColor: colors.border }}
            />
            <TouchableOpacity className="flex-row items-center p-4">
              <MaterialIcons name="settings" size={26} color={colors.text} />
              <Text
                className="text-lg font-semibold ml-4"
                style={{ color: colors.text }}
              >
                Settings & privacy
              </Text>
            </TouchableOpacity>
            <View
              className="h-px mx-4"
              style={{ backgroundColor: colors.border }}
            />
            <TouchableOpacity className="flex-row items-center p-4">
              <MaterialCommunityIcons
                name="google-analytics"
                size={26}
                color={colors.text}
              />
              <Text
                className="text-lg font-semibold ml-4"
                style={{ color: colors.text }}
              >
                Analytics
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center p-3 mt-4 mb-3 rounded-xl"
            style={{ backgroundColor: colors.surface }}
            onPress={() => setSignOutAlertVisible(true)}
          >
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
}
