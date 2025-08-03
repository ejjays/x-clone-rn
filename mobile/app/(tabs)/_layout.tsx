import { useAuth } from "@clerk/clerk-expo";
import { Bell, Home, Menu, Search, TvMinimalPlay } from "lucide-react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Redirect, usePathname, withLayoutContext, router } from "expo-router";
import { useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import PeopleIcon from "@/assets/icons/PeopleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ScrollProvider } from "@/context/ScrollContext";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

const HEADER_HEIGHT = 40;
const TAB_BAR_HEIGHT = 50;
// Updated TAB_ROUTES - removed "/messages"
const TAB_ROUTES = ["/", "/search", "/videos", "/notifications", "/profile"];
const NUM_TABS = TAB_ROUTES.length;

const TabsLayout = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme(); // Use useTheme hook

  const headerHeight = useSharedValue(HEADER_HEIGHT);
  const tabBarHeight = useSharedValue(TAB_BAR_HEIGHT);

  // Create a shared value for indicator position
  const indicatorX = useSharedValue(0);

  const isHomeScreen = pathname === "/";
  const isVideosScreen = pathname === "/videos";
  const isProfileScreen = pathname === "/profile";

  const colors = {
    background: isDarkMode ? "#111827" : "#ffffff",
    surface: isDarkMode ? "#1f2937" : "#f3f4f6",
    text: isDarkMode ? "#ffffff" : "#111827",
    textSecondary: isDarkMode ? "#d1d5db" : "#6b7280",
    textMuted: isDarkMode ? "#9ca3af" : "#9ca3af",
    border: isDarkMode ? "#374151" : "#e5e7eb",
    blue: "#3b82f6",
    icon: isDarkMode ? "#ffffff" : "#000000",
  };

  // Initialize header and tab bar visibility instantly based on initial screen
  useEffect(() => {
    headerHeight.value = isHomeScreen ? HEADER_HEIGHT : 0;
    tabBarHeight.value = isProfileScreen ? 0 : TAB_BAR_HEIGHT;
  }, [isHomeScreen, isProfileScreen]);

  // Update indicator position when pathname changes
  useEffect(() => {
    const activeIndex = TAB_ROUTES.indexOf(pathname);
    if (activeIndex !== -1) {
      indicatorX.value = withTiming(activeIndex * (screenWidth / NUM_TABS), {
        duration: 150,
      });
    }
  }, [pathname, screenWidth]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
    opacity: headerHeight.value / HEADER_HEIGHT,
    overflow: "hidden",
  }));

  const animatedTabBarStyle = useAnimatedStyle(() => ({
    height: tabBarHeight.value,
    opacity: tabBarHeight.value / TAB_BAR_HEIGHT,
    overflow: "hidden",
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      width: `${100 / NUM_TABS}%`,
      transform: [
        {
          translateX: indicatorX.value,
        },
      ],
    };
  });

  // Handle message icon press - navigate to full screen messages
  const handleMessagePress = () => {
    router.push("/messages");
  };

  if (!isSignedIn) return <Redirect href="/(auth)" />;

  return (
    <ScrollProvider
      headerHeight={headerHeight}
      tabBarHeight={tabBarHeight}
      isHomeScreen={isHomeScreen}
      isProfileScreen={isProfileScreen}
    >
      <View
        style={{
          flex: 1,
          paddingTop: isProfileScreen ? 0 : insets.top,
          backgroundColor: colors.background, // Apply background color here
        }}
      >
        <StatusBar style={isVideosScreen ? "light" : (isDarkMode ? "light" : "dark")} />

        <Animated.View style={animatedHeaderStyle}>
          <View className="flex-row justify-between items-center px-3 h-full" style={{ backgroundColor: colors.background }}>
            <Text className="text-4xl font-bold" style={{ color: colors.blue }}>pcmi</Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="p-2.5 rounded-full"
                onPress={() => router.push("/search-posts")}
              >
                <Search size={28} color={colors.icon} />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2.5 rounded-full"
                onPress={handleMessagePress}
              >
                <FontAwesome5
                  name="facebook-messenger"
                  size={26}
                  color={colors.icon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <View className="flex-1">
          <MaterialTopTabs
            screenOptions={{
              tabBarShowLabel: false,
              lazy: false,
              sceneContainerStyle: {
                display: "flex",
                height: "100%",
                width: "100%",
                overflow: "hidden",
              },
            }}
            tabBar={(props) => (
              <Animated.View style={animatedTabBarStyle}>
                <View className="border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                  <View className="flex-row justify-around items-center h-full">
                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPress={() => props.navigation.navigate("index")}
                    >
                      <Home
                        size={26}
                        color={
                          isVideosScreen
                            ? colors.icon
                            : pathname === "/"
                              ? colors.blue
                              : colors.icon
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPress={() => props.navigation.navigate("search")}
                    >
                      <PeopleIcon
                        size={27}
                        color={
                          isVideosScreen
                            ? colors.icon
                            : pathname === "/search"
                              ? colors.blue
                              : colors.icon
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPress={() => props.navigation.navigate("videos")}
                    >
                      <TvMinimalPlay
                        size={26}
                        color={isVideosScreen ? colors.blue : colors.icon}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPress={() => props.navigation.navigate("notifications")}
                    >
                      <Bell
                        size={26}
                        color={
                          isVideosScreen
                            ? colors.icon
                            : pathname === "/notifications"
                              ? colors.blue
                              : colors.icon
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPress={() => props.navigation.navigate("profile")}
                    >
                      <Menu
                        size={26}
                        color={pathname === "/profile" ? colors.blue : colors.icon}
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: colors.border }}>
                    <Animated.View
                      className="h-full bg-blue-500"
                      style={animatedIndicatorStyle}
                    />
                  </View>
                </View>
              </Animated.View>
            )}
          >
            <MaterialTopTabs.Screen name="index" />
            <MaterialTopTabs.Screen name="search" />
            <MaterialTopTabs.Screen name="videos" />
            <MaterialTopTabs.Screen name="notifications" />
            <MaterialTopTabs.Screen name="profile" />
          </MaterialTopTabs>
        </View>
      </View>
    </ScrollProvider>
  );
};

export default TabsLayout;
