import { useAuth } from "@clerk/clerk-expo";
import { Bell, Home, Menu, Search, TvMinimalPlay } from "lucide-react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Redirect, usePathname, withLayoutContext, router } from "expo-router";
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
import { ScrollProvider } from "@/context/ScrollContext";
import { useTheme } from "@/context/ThemeContext";
import PcmiChatIcon from "@/assets/icons/PcmiChatIcon";
import * as NavigationBar from "expo-navigation-bar";
import { DarkThemeColors } from "@/constants/Colors"; // Import DarkThemeColors

const { Navigator } = createBottomTabNavigator();
export const BottomTabs = withLayoutContext(Navigator);

const HEADER_HEIGHT = 40;
const TAB_BAR_HEIGHT = 50;

const TabsLayout = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
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
    if (Platform.OS === "android") {
      if (isVideosScreen) {
        // Hide bottom navigation bar on video screen
        NavigationBar.setVisibilityAsync("hidden");
      } else {
        // Show bottom navigation bar on other screens and set to dark theme
        NavigationBar.setVisibilityAsync("visible");
        NavigationBar.setBackgroundColorAsync(DarkThemeColors.background);
        NavigationBar.setButtonStyleAsync("light");
      }
    }
  }, [isVideosScreen]); // Re-run when isVideosScreen changes

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
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: false,
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
              tabBarIcon: ({ color }) => {
                switch (route.name) {
                  case "index":
                    return <Home size={26} color={color as string} />;
                  case "search":
                    return <PeopleIcon size={27} color={color as string} />;
                  case "videos":
                    return <TvMinimalPlay size={26} color={color as string} />;
                  case "notifications":
                    return <Bell size={26} color={color as string} />;
                  case "profile":
                    return <Menu size={26} color={color as string} />;
                  default:
                    return <Home size={26} color={color as string} />;
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

export default TabsLayout;
