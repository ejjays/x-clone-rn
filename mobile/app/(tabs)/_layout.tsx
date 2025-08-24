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
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import PeopleIcon from "@/assets/icons/PeopleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ScrollProvider } from "@/context/ScrollContext";
import { useTheme } from "@/context/ThemeContext";
import PcmiChatIcon from "@/assets/icons/PcmiChatIcon";
import * as NavigationBar from 'expo-navigation-bar';
import { DarkThemeColors } from "@/constants/Colors"; // Import DarkThemeColors

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

const HEADER_HEIGHT = 40;
const TAB_BAR_HEIGHT = 50;
const TAB_ROUTES = ["/", "/search", "/videos", "/notifications", "/profile"];
const NUM_TABS = TAB_ROUTES.length;

const TabsLayout = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();

  const headerHeight = useSharedValue(HEADER_HEIGHT);
  const tabBarHeight = useSharedValue(TAB_BAR_HEIGHT);

  const isHomeScreen = pathname === "/";
  const isVideosScreen = pathname === "/videos";
  const isProfileScreen = pathname === "/profile";

  useEffect(() => {
    headerHeight.value = isHomeScreen ? HEADER_HEIGHT : 0;
    tabBarHeight.value = isProfileScreen || isVideosScreen ? 0 : TAB_BAR_HEIGHT;
  }, [isHomeScreen, isProfileScreen, isVideosScreen]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (isVideosScreen) {
        // Hide bottom navigation bar on video screen
        NavigationBar.setVisibilityAsync('hidden');
      } else {
        // Show bottom navigation bar on other screens and set to dark theme
        NavigationBar.setVisibilityAsync('visible');
        NavigationBar.setBackgroundColorAsync(DarkThemeColors.background);
        NavigationBar.setButtonStyleAsync('light');
      }
    }
  }, [isVideosScreen]); // Re-run when isVideosScreen changes

  // ✅ INSTANT INDICULATION CALCULATION (No animation delays)
  const getIndicatorPosition = () => {
    const activeIndex = TAB_ROUTES.indexOf(pathname);
    return activeIndex !== -1 ? activeIndex * (screenWidth / NUM_TABS) : 0;
  };

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
          paddingTop: isProfileScreen || isVideosScreen ? 0 : insets.top,
          backgroundColor: colors.background,
        }}
      >
        <StatusBar
          style={isVideosScreen ? "light" : "light"} // Status bar always visible
          hidden={false}
        />

        <Animated.View style={animatedHeaderStyle}>
          <View
            className="flex-row justify-between items-center px-3 h-full"
            style={{ backgroundColor: colors.background }}
          >
            <Text
              className="text-4xl font-extrabold ml-1"
              style={{ color: "white" }}
            >
              pcmi
            </Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="p-2.5 rounded-full"
                onPress={() => router.push("/search-posts")}
              >
                <Search size={29} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2.5 rounded-full"
                onPress={handleMessagePress}
              >
                <PcmiChatIcon size={29} color={"white"} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <View className="flex-1">
          <MaterialTopTabs
            screenOptions={{
              tabBarShowLabel: false,
              lazy: true,
              animationEnabled: false,
              swipeEnabled: false,
              tabBarStyle: { elevation: 0 },
              sceneContainerStyle: {
                display: "flex",
                height: "100%",
                width: "100%",
                overflow: "hidden",
              },
            }}
            tabBar={(props) => (
              isVideosScreen ? null : (
                <Animated.View style={animatedTabBarStyle}>
                  <View
                    className="border-b"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    }}
                  >
                    <View className="flex-row justify-around items-center h-full">
                      <TouchableOpacity
                        className="flex-1 items-center justify-center h-full"
                        onPressIn={() => props.navigation.navigate("index")}
                        activeOpacity={0.7}
                      >
                        <Home
                          size={26}
                          color={
                            isVideosScreen
                              ? "white"
                              : pathname === "/"
                                ? colors.blue
                                : "white"
                          }
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 items-center justify-center h-full"
                        onPressIn={() => props.navigation.navigate("search")}
                        activeOpacity={0.7}
                      >
                        <PeopleIcon
                          size={27}
                          color={
                            isVideosScreen
                              ? "white"
                              : pathname === "/search"
                                ? colors.blue
                                : "white"
                          }
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 items-center justify-center h-full"
                        onPressIn={() => props.navigation.navigate("videos")}
                        activeOpacity={0.7}
                      >
                        <TvMinimalPlay
                          size={26}
                          color={isVideosScreen ? colors.blue : "white"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 items-center justify-center h-full"
                        onPressIn={() => props.navigation.navigate("notifications")}
                        activeOpacity={0.7}
                      >
                        <Bell
                          size={26}
                          color={
                            isVideosScreen
                              ? "white"
                              : pathname === "/notifications"
                                ? colors.blue
                                : "white"
                          }
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 items-center justify-center h-full"
                        onPressIn={() => props.navigation.navigate("profile")}
                        activeOpacity={0.7}
                      >
                        <Menu
                          size={26}
                          color={pathname === "/profile" ? colors.blue : "white"}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* ✅ INSTANT INDICATOR - NO ANIMATION DELAYS */}
                    <View
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: colors.border }}
                    >
                      <View
                        className="h-full bg-blue-500"
                        style={{
                          width: `${100 / NUM_TABS}%`,
                          transform: [
                            {
                              translateX: getIndicatorPosition(),
                            },
                          ],
                        }}
                      />
                    </View>
                  </View>
                </Animated.View>
              )
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
