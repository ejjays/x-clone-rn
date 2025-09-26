import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from "react-native";
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
import PressableScale from "@/constants/PressableScale";

const openExternalLink = (url) => {
  Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
};

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
    onPress: () => openExternalLink("https://about-pcmi.vercel.app"),
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
    onPress: (router) => {},
  },
  {
    title: "Kapatids",
    iconComponent: (
      <Image
        source={require("@/assets/images/menu/kapatids.png")}
        style={{ width: 33, height: 33 }}
        interpolation="high"
      />
    ),
    color: "#2E89FF",
    onPress: (router) => router.push("(tabs)/search"),
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
    onPress: (router) => router.push("(tabs)/videos"),
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
    onPress: (router) => {},
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
    onPress: (router) => {},
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
  const {
    handleSignOut: handleSignOutFromHook,
    confirmSignOut: confirmSignOutFromHook,
  } = useSignOut();

  const confirmSignOut = () => {
    confirmSignOutFromHook();
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
                <View className="flex-1 ml-4">
                  <Text
                    className="text-xl font-bold"
                    style={{ color: colors.text }}
                    numberOfLines={1}
                  >
                    {currentUser?.firstName} {currentUser?.lastName}
                  </Text>
                </View>
                <View className="ml-auto">
                  <View className="bg-gray-600 rounded-full p-2">
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
            <View className="h-px mx-4" style={{ backgroundColor: "gray" }} />
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={() => router.push("/edit-profile")}
            >
              <View className="w-10 h-10 rounded-full bg-gray-600 items-center justify-center">
                <MaterialIcons name="mode-edit" size={24} color={colors.text} />
              </View>
              <View className="ml-4">
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Edit Profile
                </Text>
                <Text className="text-sm" style={{ color: colors.text }}>
                  Make changes to your profile.
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
            {users.map((user, index) => (
              <PressableScale
                key={user.id || index}
                onPress={() => router.push(`/messages`)}
                style={{ alignItems: "center", marginRight: 16 }} // Moved className styles to style prop
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
              </PressableScale>
            ))}
          </ScrollView>
          <View className="flex-row flex-wrap justify-between mt-4">
            {menuItems.map((item, index) => (
              <PressableScale // Replaced TouchableOpacity with PressableScale
                key={`${item.title}-${index}`}
                onPress={() => item.onPress(router)}
                style={[
                  { backgroundColor: colors.surface },
                  {
                    width: "49%",
                    marginBottom: 8,
                    padding: 16,
                    borderRadius: 16,
                  },
                ]} // Apply styles directly to PressableScale
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
              </PressableScale>
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
                size={26}
                color={colors.text}
              />
              <Text
                className="text-lg font-bold ml-4"
                style={{ color: colors.text }}
              >
                Help & feedback
              </Text>
            </TouchableOpacity>
            <View className="h-px mx-0" style={{ backgroundColor: "gray" }} />
            <TouchableOpacity className="flex-row items-center p-4">
              <MaterialIcons name="privacy-tip" size={26} color={colors.text} />
              <Text
                className="text-lg font-semibold ml-4"
                style={{ color: colors.text }}
              >
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <View className="h-px mx-0" style={{ backgroundColor: "gray" }} />
            <TouchableOpacity className="flex-row items-center p-4" onPress={() => Linking.openURL('tel:09982238464')}>
              <MaterialIcons
                name="call"
                size={26}
                color={colors.text}
              />
              <Text
                className="text-lg font-semibold ml-4"
                style={{ color: colors.text }}
              >
                Contact
              </Text>
            </TouchableOpacity>
          </View>

          <PressableScale 
            style={{
              backgroundColor: colors.surface,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              marginTop: 14,
              marginBottom: 10,
              borderRadius: 12,
            }}
            onPress={() => setSignOutAlertVisible(true)}
          >
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Logout
            </Text>
          </PressableScale>
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
