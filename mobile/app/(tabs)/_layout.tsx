import { useAuth } from "@clerk/clerk-expo";
import { Bell, Home, Menu, Search, TvMinimalPlay } from "lucide-react-native";
import { Redirect, router, withLayoutContext, usePathname } from "expo-router";
import React, { useEffect, memo, useMemo } from "react";
import { Text, TouchableOpacity, View, Platform, useWindowDimensions } from "react-native";
import { useFonts, Lato_700Bold } from "@expo-google-fonts/lato";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import PeopleIcon from "@/assets/icons/PeopleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TabsProvider } from "@/context/TabsContext";
import { ScrollProvider } from "@/context/ScrollContext";
import { useTheme } from "@/context/ThemeContext";
import PcmiChatIcon from "@/assets/icons/PcmiChatIcon";
// Removed Android navigation bar toggling to avoid jank on tab switches
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const HEADER_HEIGHT = 40;
const TAB_BAR_HEIGHT = 50;

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

const TabsInner = () => {
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { width: screenWidth } = useWindowDimensions();
  const { isDarkMode, colors } = useTheme();

  const headerHeight = useSharedValue(HEADER_HEIGHT);
  const tabBarHeight = useSharedValue(TAB_BAR_HEIGHT);

  const isHomeScreen = pathname === "/";
  const isVideosScreen = pathname === "/videos";
  const isProfileScreen = pathname === "/profile";

  useEffect(() => {
    headerHeight.value = pathname === "/" ? HEADER_HEIGHT : 0;
    tabBarHeight.value = TAB_BAR_HEIGHT;
  }, [pathname]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
    opacity: headerHeight.value / HEADER_HEIGHT,
    overflow: "hidden",
  }));

  const handleMessagePress = () => {
    router.push("/messages");
  };

  const [fontsLoaded] = useFonts({ Lato_700Bold });
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
          paddingTop: isVideosScreen ? 0 : insets.top,
          backgroundColor: isVideosScreen ? "black" : colors.background,
        }}
      >
        <StatusBar
          style={isDarkMode ? "light" : "dark"}
          hidden={false}
          backgroundColor={isVideosScreen ? "transparent" : colors.background}
          translucent={isVideosScreen}
        />

        <Animated.View style={animatedHeaderStyle}>
          <View
            className="flex-row justify-between items-center px-3 h-full"
            style={{ backgroundColor: colors.background }}
          >
            <Text
              className="text-4xl ml-1"
              style={{
                color: "white",
                fontFamily: fontsLoaded ? "Lato_700Bold" : undefined,
                fontWeight: fontsLoaded ? "normal" : "bold",
              }}
            >
              pcmi
            </Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="p-2.5 rounded-full"
                onPressIn={() => router.push("/search-posts")}
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
            initialLayout={{ width: screenWidth }}
            screenOptions={{
              tabBarPosition: "top",
              tabBarShowLabel: false,
              lazy: false,
              animationEnabled: false,
              swipeEnabled: false,
              // Freeze inactive scenes to avoid re-render thrash during tab switches
              freezeOnBlur: true,
              tabBarStyle: { elevation: 0 },
              sceneContainerStyle: {
                display: "flex",
                height: "100%",
                width: "100%",
                overflow: "hidden",
              },
            }}
            tabBar={(props) => (
              pathname === "/videos" ? null : (
                <TopIconBar navigation={props.navigation} pathname={pathname} colors={colors} screenWidth={screenWidth} />
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

export default function TabsLayout() {
  return (
    <TabsProvider>
      <TabsInner />
    </TabsProvider>
  );
}

const TopIconBar = memo(function TopIconBar({ navigation, pathname, colors, screenWidth }: any) {
  const routes = ["/", "/search", "/videos", "/notifications", "/profile"];
  const activeIndex = routes.indexOf(pathname);
  return (
    <View>
      <View
        className="border-b"
        style={{ backgroundColor: colors.background, borderColor: colors.border }}
      >
        <View className="flex-row justify-around items-center" style={{ height: TAB_BAR_HEIGHT }}>
          <TouchableOpacity className="flex-1 items-center justify-center h-full" onPressIn={() => navigation.navigate("index")} activeOpacity={0.7} delayPressIn={0}>
            <Home size={26} color={pathname === "/" ? colors.blue : "white"} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center h-full" onPressIn={() => navigation.navigate("search")} activeOpacity={0.7} delayPressIn={0}>
            <PeopleIcon size={27} color={pathname === "/search" ? colors.blue : "white"} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center h-full" onPressIn={() => navigation.navigate("videos")} activeOpacity={0.7} delayPressIn={0}>
            <TvMinimalPlay size={26} color={pathname === "/videos" ? colors.blue : "white"} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center h-full" onPressIn={() => navigation.navigate("notifications")} activeOpacity={0.7} delayPressIn={0}>
            <Bell size={26} color={pathname === "/notifications" ? colors.blue : "white"} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center h-full" onPressIn={() => navigation.navigate("profile")} activeOpacity={0.7} delayPressIn={0}>
            <Menu size={26} color={pathname === "/profile" ? colors.blue : "white"} />
          </TouchableOpacity>
        </View>
        <View className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: colors.border }}>
          <View
            className="h-full bg-blue-500"
            style={{
              width: `${100 / routes.length}%`,
              transform: [
                {
                  translateX: (activeIndex > -1 ? activeIndex : 0) * (screenWidth / routes.length),
                },
              ],
            }}
          />
        </View>
      </View>
    </View>
  );
});
