"use client"

// mobile/app/(tabs)/_layout.tsx
import { useAuth } from "@clerk/clerk-expo"
import { Feather } from "@expo/vector-icons"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { Redirect, usePathname, withLayoutContext } from "expo-router"
import { useEffect } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

const { Navigator } = createMaterialTopTabNavigator()
export const MaterialTopTabs = withLayoutContext(Navigator)

const HEADER_HEIGHT = 60
const TAB_BAR_HEIGHT = 50 // Height of the tab bar

const TabsLayout = () => {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  // Animated values
  const headerHeight = useSharedValue(HEADER_HEIGHT)
  const tabBarHeight = useSharedValue(TAB_BAR_HEIGHT)

  const isHomeScreen = pathname === "/"
  const isProfileScreen = pathname === "/profile"

  // Animate header and tab bar based on current screen
  useEffect(() => {
    // Header animation
    headerHeight.value = withTiming(isHomeScreen ? HEADER_HEIGHT : 0, {
      duration: 300,
    })

    // Tab bar animation - hide on profile, show on others
    tabBarHeight.value = withTiming(isProfileScreen ? 0 : TAB_BAR_HEIGHT, {
      duration: 300,
    })
  }, [isHomeScreen, isProfileScreen, headerHeight, tabBarHeight])

  // Animated styles
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: headerHeight.value / HEADER_HEIGHT,
      overflow: "hidden",
    }
  })

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      height: tabBarHeight.value,
      opacity: tabBarHeight.value / TAB_BAR_HEIGHT,
      overflow: "hidden",
    }
  })

  if (!isSignedIn) return <Redirect href="/(auth)" />

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Animated Header */}
      <Animated.View style={animatedHeaderStyle}>
        <View className="flex-row justify-between items-center px-4 h-full">
          <Text className="text-4xl font-bold text-blue-600">pcmi</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
              <Feather name="plus" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
              <Feather name="search" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 p-2.5 rounded-full">
              <Feather name="message-circle" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Content Area */}
      <View className="flex-1">
        <MaterialTopTabs
          screenOptions={{
            tabBarActiveTintColor: "#1877F2",
            tabBarInactiveTintColor: "#657786",
            tabBarIndicatorStyle: {
              backgroundColor: "#1877F2",
              height: 3,
            },
            tabBarStyle: {
              backgroundColor: "#fff",
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E5E5",
              paddingTop: 0,
              marginTop: 0,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            },
            tabBarContentContainerStyle: {
              paddingTop: 0,
            },
          }}
          tabBar={(props) => (
            <Animated.View style={animatedTabBarStyle}>
              <View className="bg-white border-b border-gray-200">
                <View className="flex-row justify-around items-center h-full">
                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("index")}
                  >
                    <Feather name="home" size={24} color={pathname === "/" ? "#1877F2" : "#657786"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("search")}
                  >
                    <Feather name="users" size={24} color={pathname === "/search" ? "#1877F2" : "#657786"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("notifications")}
                  >
                    <Feather name="bell" size={24} color={pathname === "/notifications" ? "#1877F2" : "#657786"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("messages")}
                  >
                    <Feather name="tv" size={24} color={pathname === "/messages" ? "#1877F2" : "#657786"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center h-full"
                    onPress={() => props.navigation.navigate("profile")}
                  >
                    <Feather name="menu" size={24} color={pathname === "/profile" ? "#1877F2" : "#657786"} />
                  </TouchableOpacity>
                </View>

                {/* Active indicator */}
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
                  <Animated.View
                    className="h-full bg-blue-500"
                    style={{
                      width: "20%",
                      transform: [
                        {
                          translateX:
                            pathname === "/"
                              ? 0
                              : pathname === "/search"
                                ? 71.2
                                : pathname === "/notifications"
                                  ? 142.4
                                  : pathname === "/messages"
                                    ? 213.6
                                    : 284.8,
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
          <MaterialTopTabs.Screen name="notifications" />
          <MaterialTopTabs.Screen name="messages" />
          <MaterialTopTabs.Screen name="profile" />
        </MaterialTopTabs>
      </View>
    </SafeAreaView>
  )
}
export default TabsLayout
