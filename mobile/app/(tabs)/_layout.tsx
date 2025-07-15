import { useAuth } from "@clerk/clerk-expo";
import { Bell, Home, Menu, MessageCircle, Plus, Search, Mail, TvMinimalPlay } from "lucide-react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Redirect, usePathname, withLayoutContext } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import PeopleIcon from "@/assets/icons/PeopleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar"; 

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

const HEADER_HEIGHT = 60;
const TAB_BAR_HEIGHT = 50;
const TAB_ROUTES = ['/', '/search', '/videos', '/notifications', '/messages', '/profile'];
const NUM_TABS = TAB_ROUTES.length;

const TabsLayout = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const headerHeight = useSharedValue(HEADER_HEIGHT);
  const tabBarHeight = useSharedValue(TAB_BAR_HEIGHT);

  const isHomeScreen = pathname === "/";
  const isVideosScreen = pathname === "/videos";
  const isProfileScreen = pathname === "/profile";

  useEffect(() => {
    headerHeight.value = withTiming(isHomeScreen ? HEADER_HEIGHT : 0, { duration: 300 });
    tabBarHeight.value = withTiming(isProfileScreen ? 0 : TAB_BAR_HEIGHT, { duration: 300 });
  }, [isHomeScreen, isProfileScreen, headerHeight, tabBarHeight]);

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

  const activeIndex = TAB_ROUTES.indexOf(pathname);
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      width: `${100 / NUM_TABS}%`,
      transform: [{ translateX: withTiming(activeIndex * (screenWidth / NUM_TABS), { duration: 250 }) }],
    };
  });

  if (!isSignedIn) return <Redirect href="/(auth)" />;

  return (
    <View style={{ flex: 1, paddingTop: isProfileScreen ? 0 : insets.top, backgroundColor: 'white' }}>
      {/* This StatusBar now controls the style for all tab screens */}
      <StatusBar style={isVideosScreen ? "light" : "dark"} />

      <Animated.View style={animatedHeaderStyle}>
        <View className="flex-row justify-between items-center px-4 h-full">
          <Text className="text-4xl font-bold text-blue-600">pcmi</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
              <Plus size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
              <Search size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
              <MessageCircle size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <View className="flex-1">
        <MaterialTopTabs
          screenOptions={{
            tabBarShowLabel: false,
          }}
          tabBar={(props) => (
            <Animated.View style={animatedTabBarStyle}>
              <View className="bg-white border-b border-gray-200">
                <View className="flex-row justify-around items-center h-full">
                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("index")}
                  >
                    <Home size={24} color={isVideosScreen ? "#000" : (pathname === "/" ? "#1877F2" : "#657786")} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("search")}
                  >
                    <PeopleIcon size={25} color={isVideosScreen ? "#000" : (pathname === "/search" ? "#1877F2" : "#657786")} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("videos")}
                  >
                    <TvMinimalPlay size={24} color={isVideosScreen ? "#1877F2" : "#657786"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("notifications")}
                  >
                    <Bell size={24} color={isVideosScreen ? "#000" : (pathname === "/notifications" ? "#1877F2" : "#657786")} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("messages")}
                  >
 <Mail size={24} color={isVideosScreen ? "#000" : (pathname === "/messages" ? "#1877F2" : "#657786")} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("profile")}
                  >
                    <Menu size={24} color={pathname === "/profile" ? "#1877F2" : "#657786"} />
                  </TouchableOpacity>
                </View>

                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
                  <Animated.View className="h-full bg-blue-500" style={animatedIndicatorStyle} />
                </View>
              </View>
            </Animated.View>
          )}
        >
          <MaterialTopTabs.Screen name="index" />
          <MaterialTopTabs.Screen name="search" />
          <MaterialTopTabs.Screen name="videos" />
          <MaterialTopTabs.Screen name="notifications" />
          <MaterialTopTabs.Screen name="messages" />
          <MaterialTopTabs.Screen name="profile" />
        </MaterialTopTabs>
      </View>
    </View>
  );
};
export default TabsLayout;