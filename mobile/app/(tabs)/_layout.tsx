import { useAuth } from "@clerk/clerk-expo";
import { Bell, Home, Menu, Search, TvMinimalPlay } from "lucide-react-native";
import { Redirect, router, withLayoutContext } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View, Platform } from "react-native";
import { useFonts, Lato_700Bold } from "@expo-google-fonts/lato";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import PeopleIcon from "@/assets/icons/PeopleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TabsProvider, useTabs } from "@/context/TabsContext";
import { ScrollProvider } from "@/context/ScrollContext";
import { useTheme } from "@/context/ThemeContext";
import PcmiChatIcon from "@/assets/icons/PcmiChatIcon";
import IndexScreen from "./index";
import SearchScreen from "./search";
import VideosScreen from "./videos";
import NotificationsScreen from "./notifications";
import ProfileScreens from "./profile";
// Removed Android navigation bar toggling to avoid jank on tab switches
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const HEADER_HEIGHT = 40;
const TAB_BAR_HEIGHT = 50;

const { Navigator } = createBottomTabNavigator();
export const BottomTabs = withLayoutContext(Navigator);

const TabsInner = () => {
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();
  const { activeTab, setActiveTab } = useTabs();

  const headerHeight = useSharedValue(HEADER_HEIGHT);
  const tabBarHeight = useSharedValue(TAB_BAR_HEIGHT);

  const isHomeScreen = activeTab === "index";
  const isVideosScreen = activeTab === "videos";
  const isProfileScreen = activeTab === "profile";

  useEffect(() => {
    headerHeight.value = isHomeScreen ? HEADER_HEIGHT : 0;
    // Keep bottom bar consistently visible to avoid layout thrashing
    tabBarHeight.value = TAB_BAR_HEIGHT;
  }, [isHomeScreen]);

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
          <BottomTabs
            detachInactiveScreens={false}
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: false,
              lazy: false,
              unmountOnBlur: false,
              freezeOnBlur: true,
              tabBarHideOnKeyboard: true,
              tabBarActiveTintColor: colors.blue,
              tabBarInactiveTintColor: "white",
              tabBarStyle: {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                height: TAB_BAR_HEIGHT,
              },
              sceneContainerStyle: {
                display: "flex",
                height: "100%",
                width: "100%",
                overflow: "hidden",
              },
              tabBarIcon: ({ color, focused }) => {
                const c = focused ? colors.blue : (color as string);
                switch (route.name) {
                  case "index":
                    return <Home size={28} color={c} />;
                  case "search":
                    return <PeopleIcon size={28} color={c as any} />;
                  case "videos":
                    return <TvMinimalPlay size={28} color={c} />;
                  case "notifications":
                    return <Bell size={28} color={c} />;
                  case "profile":
                    return <Menu size={28} color={c} />;
                  default:
                    return <Home size={28} color={c} />;
                }
              },
            })}
          >
            <BottomTabs.Screen name="index" />
            <BottomTabs.Screen name="search" />
            <BottomTabs.Screen name="videos" />
            <BottomTabs.Screen name="notifications" />
            <BottomTabs.Screen name="profile" />
          </BottomTabs>
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
