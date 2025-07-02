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

const HEADER_HEIGHT = 60 // A fixed height for our header

const TabsLayout = () => {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const headerHeight = useSharedValue(HEADER_HEIGHT)

  // The root path for our tabs layout is '/', which corresponds to the index.tsx file.
  const isHomeScreen = pathname === "/"

  // This effect runs when we switch tabs, triggering the animation.
  useEffect(() => {
    headerHeight.value = withTiming(isHomeScreen ? HEADER_HEIGHT : 0, {
      duration: 200,
    })
  }, [isHomeScreen, headerHeight])

  // This style will be applied to the header, animating its height and opacity.
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: headerHeight.value / HEADER_HEIGHT,
      overflow: "hidden", // This is crucial to hide the content when height is 0
    }
  })

  if (!isSignedIn) return <Redirect href="/(auth)" />

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
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

      {/* Top Tab Navigator - Reduced padding */}
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
            paddingTop: 0, // Remove extra padding
            marginTop: 0, // Remove extra margin
          },
          tabBarContentContainerStyle: {
            paddingTop: 0, // Remove extra padding
          },
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
            tabBarShowLabel: false,
          }}
        />
        <MaterialTopTabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ color }) => <Feather name="users" size={24} color={color} />,
            tabBarShowLabel: false,
          }}
        />
        <MaterialTopTabs.Screen
          name="notifications"
          options={{
            tabBarIcon: ({ color }) => <Feather name="bell" size={24} color={color} />,
            tabBarShowLabel: false,
          }}
        />
        <MaterialTopTabs.Screen
          name="messages"
          options={{
            tabBarIcon: ({ color }) => <Feather name="tv" size={24} color={color} />,
            tabBarShowLabel: false,
          }}
        />
        <MaterialTopTabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color }) => <Feather name="menu" size={24} color={color} />,
            tabBarShowLabel: false,
          }}
        />
      </MaterialTopTabs>
    </SafeAreaView>
  )
}
export default TabsLayout
