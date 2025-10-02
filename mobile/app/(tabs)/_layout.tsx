import { useAuth } from "@clerk/clerk-expo";
import { Bell, Home, Menu, Search, TvMinimalPlay } from "lucide-react-native";
import { Redirect, router, withLayoutContext, usePathname } from "expo-router";
import React, { useEffect, memo, useMemo, useCallback, useState, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  InteractionManager,
} from "react-native";
import { useFonts, Lato_700Bold } from "@expo-google-fonts/lato";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useSharedValue,
} from "react-native-reanimated";
import PeopleIcon from "@/assets/icons/PeopleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { TabsProvider } from "@/context/TabsContext";
import { ScrollProvider, useScroll } from "@/context/ScrollContext";
import { useTheme } from "@/context/ThemeContext";
import PcmiChatIcon from "@/assets/icons/PcmiChatIcon";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { readPersistedAuthState, getIsOnline } from "@/utils/offline/network";

const HEADER_HEIGHT = 40;
const TAB_BAR_HEIGHT = 50;

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

const TabsInner = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [allowOfflineTabs, setAllowOfflineTabs] = useState<boolean>(false);
  const [checkedOffline, setCheckedOffline] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const screenWidth = Dimensions.get("window").width;
  const { colors, isDarkMode } = useTheme();
  const { scrollY, headerTranslateY } = useScroll();

  const isHomeScreen = pathname === "/";
  const isHomeScreenSV = useSharedValue(isHomeScreen);
  useEffect(() => {
    isHomeScreenSV.value = isHomeScreen;
  }, [isHomeScreen]);
  const isVideosScreen = pathname === "/videos";
  const isProfileScreen = pathname === "/menu";
  const isTabsRoute = [
    "/",
    "/search",
    "/videos",
    "/notifications",
    "/menu",
  ].includes(pathname);

  // Ensure Android navigation bar matches tab background when tabs are focused
  useFocusEffect(
    useCallback(() => {
      try {
        if (Platform.OS === "android" && isTabsRoute) {
          NavigationBar.setBackgroundColorAsync(colors.background).catch(
            () => {}
          );
          NavigationBar.setButtonStyleAsync("light").catch(() => {});
          SystemUI.setBackgroundColorAsync(colors.background);
        }
      } catch {}
      return () => {};
    }, [colors.background, isTabsRoute])
  );

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = isHomeScreenSV.value ? headerTranslateY.value : 0;
    return {
      transform: [{ translateY }],
      height: isHomeScreenSV.value ? HEADER_HEIGHT : 0,
      overflow: "hidden",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
    };
  });

  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    const translateY = isHomeScreenSV.value ? headerTranslateY.value : 0;
    return {
      transform: [{ translateY }],
      position: "absolute",
      top: isHomeScreenSV.value ? HEADER_HEIGHT : 0,
      left: 0,
      right: 0,
      zIndex: 1,
    };
  });

  const handleMessagePress = () => {
    router.push("/messages");
  };

  const [fontsLoaded] = useFonts({ Lato_700Bold });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const online = await getIsOnline();
        if (!online) {
          const persisted = await readPersistedAuthState();
          if (persisted?.isSignedIn) {
            if (!cancelled) setAllowOfflineTabs(true);
          }
        }
      } catch {}
      if (!cancelled) setCheckedOffline(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoaded && !isSignedIn && !allowOfflineTabs) {
    if (!checkedOffline) return null;
    return <Redirect href="/(auth)" />;
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: isVideosScreen ? "black" : colors.background,
      }}
    >
      {isVideosScreen ? (
        <StatusBar
          style="light"
          hidden={false}
          translucent
          backgroundColor="transparent"
          animated
        />
      ) : (
        <StatusBar
          style={isDarkMode ? "light" : "dark"}
          hidden={false}
          translucent={false}
          backgroundColor={colors.background}
          animated
        />
      )}

      <Animated.View style={headerAnimatedStyle}>
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

      <View style={{ flex: 1 }}>
        <MaterialTopTabs
          initialLayout={{ width: screenWidth }}
          screenOptions={{
            tabBarPosition: "top",
            tabBarShowLabel: false,
            lazy: true,
            animationEnabled: true,
            swipeEnabled: true,
            tabBarStyle: { elevation: 0 },
          }}
          tabBar={(props) => (
              <Animated.View style={tabBarAnimatedStyle}>
                <TopIconBar
                  navigation={props.navigation}
                  pathname={pathname}
                  colors={colors}
                  screenWidth={screenWidth}
                />
              </Animated.View>
            )
          }
        >
          <MaterialTopTabs.Screen name="index" />
          <MaterialTopTabs.Screen name="search" />
          <MaterialTopTabs.Screen name="videos" />
          <MaterialTopTabs.Screen name="notifications" />
          <MaterialTopTabs.Screen name="menu" />
        </MaterialTopTabs>
      </View>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <ScrollProvider headerHeight={HEADER_HEIGHT} tabBarHeight={TAB_BAR_HEIGHT}>
      <TabsProvider>
        <TabsInner />
      </TabsProvider>
    </ScrollProvider>
  );
}

const TopIconBar = memo(function TopIconBar({
  navigation,
  pathname,
  colors,
  screenWidth,
}: any) {
  const ROUTES = ["/", "/search", "/videos", "/notifications", "/menu"];
  const activeIndex = ROUTES.indexOf(pathname);

  return (
    <View
      className="border-b"
      style={{ backgroundColor: colors.background, borderColor: colors.border }}
    >
      <View
        className="flex-row justify-around items-center"
        style={{ height: TAB_BAR_HEIGHT }}
      >
        <TouchableOpacity
          className="flex-1 items-center justify-center h-full"
          onPress={() => navigation.jumpTo("index")}
          activeOpacity={1}
        >
          <Home size={26} color={pathname === "/" ? colors.blue : "white"} />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center h-full"
          onPress={() => navigation.jumpTo("search")}
          activeOpacity={1}
        >
          <PeopleIcon
            size={27}
            color={pathname === "/search" ? colors.blue : "white"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center h-full"
          onPress={() => navigation.jumpTo("videos")}
          activeOpacity={1}
        >
          <TvMinimalPlay
            size={26}
            color={pathname === "/videos" ? colors.blue : "white"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center h-full"
          onPress={() => navigation.jumpTo("notifications")}
          activeOpacity={1}
        >
          <Bell
            size={26}
            color={pathname === "/notifications" ? colors.blue : "white"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center h-full"
          onPress={() => navigation.jumpTo("menu")}
          activeOpacity={1}
        >
          <Menu
            size={26}
            color={pathname === "/menu" ? colors.blue : "white"}
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
            width: `${100 / ROUTES.length}%`,
            left: `${(activeIndex > -1 ? activeIndex : 0) * (100 / ROUTES.length)}%`,
          }}
        />
      </View>
    </View>
  );
});
