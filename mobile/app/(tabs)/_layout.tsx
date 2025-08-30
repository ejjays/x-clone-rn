import { useAuth } from "@clerk/clerk-expo";
import { Bell, Home, Menu, Search, TvMinimalPlay } from "lucide-react-native";
import { Redirect, router } from "expo-router";
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

const HEADER_HEIGHT = 40;
const TAB_BAR_HEIGHT = 50;

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

        {/* Render all tab panes; toggle visibility via local state (instant) */}
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, display: activeTab === "index" ? "flex" : "none" }}>
            <IndexScreen />
          </View>
          <View style={{ flex: 1, display: activeTab === "search" ? "flex" : "none" }}>
            <SearchScreen />
          </View>
          <View style={{ flex: 1, display: activeTab === "videos" ? "flex" : "none" }}>
            <VideosScreen />
          </View>
          <View style={{ flex: 1, display: activeTab === "notifications" ? "flex" : "none" }}>
            <NotificationsScreen />
          </View>
          <View style={{ flex: 1, display: activeTab === "profile" ? "flex" : "none" }}>
            <ProfileScreens />
          </View>
        </View>

        {/* Bottom tab bar: instant toggle, no navigation */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom,
          }}
        >
          <View className="flex-row justify-around items-center" style={{ height: TAB_BAR_HEIGHT }}>
            <TouchableOpacity activeOpacity={1} delayPressIn={0} className="flex-1 items-center justify-center h-full" onPressIn={() => setActiveTab("index")}>
              <Home size={28} color={activeTab === "index" ? colors.blue : "white"} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} delayPressIn={0} className="flex-1 items-center justify-center h-full" onPressIn={() => setActiveTab("search")}>
              <PeopleIcon size={28} color={activeTab === "search" ? colors.blue : "white"} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} delayPressIn={0} className="flex-1 items-center justify-center h-full" onPressIn={() => setActiveTab("videos")}>
              <TvMinimalPlay size={28} color={activeTab === "videos" ? colors.blue : "white"} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} delayPressIn={0} className="flex-1 items-center justify-center h-full" onPressIn={() => setActiveTab("notifications")}>
              <Bell size={28} color={activeTab === "notifications" ? colors.blue : "white"} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} delayPressIn={0} className="flex-1 items-center justify-center h-full" onPressIn={() => setActiveTab("profile")}>
              <Menu size={28} color={activeTab === "profile" ? colors.blue : "white"} />
            </TouchableOpacity>
          </View>
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
