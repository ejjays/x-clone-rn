import { useAuth } from "@clerk/clerk-expo";
import { Bell, Home, Menu, Search, TvMinimalPlay } from "lucide-react-native";
import { Redirect, router, withLayoutContext, usePathname } from "expo-router";
import { useEffect } from "react";
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
    headerHeight.value = isHomeScreen ? HEADER_HEIGHT : 0;
    tabBarHeight.value = isProfileScreen || isVideosScreen ? 0 : TAB_BAR_HEIGHT;
  }, [isHomeScreen, isProfileScreen, isVideosScreen]);

  // Removed Android navigation bar toggling; keeping system UI stable avoids delays

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
          paddingTop: isProfileScreen || isVideosScreen ? 0 : insets.top,
          backgroundColor: colors.background,
        }}
      >
        <StatusBar style="light" hidden={false} />

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
              lazyPreloadDistance: 1,
            }}
            tabBar={(props) => (
              <Animated.View
                style={{
                  height: tabBarHeight.value,
                  opacity: tabBarHeight.value / TAB_BAR_HEIGHT,
                  overflow: "hidden",
                }}
              >
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
                      delayPressIn={0}
                    >
                      <Home
                        size={26}
                        color={pathname === "/" ? colors.blue : "white"}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPressIn={() => props.navigation.navigate("search")}
                      activeOpacity={0.7}
                      delayPressIn={0}
                    >
                      <PeopleIcon
                        size={27}
                        color={pathname === "/search" ? colors.blue : "white"}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPressIn={() => props.navigation.navigate("videos")}
                      activeOpacity={0.7}
                      delayPressIn={0}
                    >
                      <TvMinimalPlay
                        size={26}
                        color={pathname === "/videos" ? colors.blue : "white"}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPressIn={() => props.navigation.navigate("notifications")}
                      activeOpacity={0.7}
                      delayPressIn={0}
                    >
                      <Bell
                        size={26}
                        color={pathname === "/notifications" ? colors.blue : "white"}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center h-full"
                      onPressIn={() => props.navigation.navigate("profile")}
                      activeOpacity={0.7}
                      delayPressIn={0}
                    >
                      <Menu
                        size={26}
                        color={pathname === "/profile" ? colors.blue : "white"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full bg-blue-500"
                      style={{
                        width: `${100 / 5}%`,
                        transform: [
                          {
                            translateX: ["/", "/search", "/videos", "/notifications", "/profile"].indexOf(pathname) * (screenWidth / 5),
                          },
                        ],
                      }}
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

export default function TabsLayout() {
  return (
    <TabsProvider>
      <TabsInner />
    </TabsProvider>
  );
}
