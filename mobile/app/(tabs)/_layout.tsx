import { Redirect, withLayoutContext } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

const TabsLayout = () => {
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isSignedIn) return <Redirect href="/(auth)" />;

  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: "#1877F2", // Facebook Blue
        tabBarInactiveTintColor: "#657786",
        tabBarIndicatorStyle: {
          backgroundColor: "#1877F2",
          height: 3,
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          paddingTop: insets.top, // Adjust for device notch
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={24} color={color} />
          ),
          tabBarShowLabel: false,
        }}
      />
      <MaterialTopTabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="search" size={24} color={color} />
          ),
          tabBarShowLabel: false,
        }}
      />
      <MaterialTopTabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="bell" size={24} color={color} />
          ),
          tabBarShowLabel: false,
        }}
      />
      <MaterialTopTabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="message-circle" size={24} color={color} />
          ),
          tabBarShowLabel: false,
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="user" size={24} color={color} />
          ),
          tabBarShowLabel: false,
        }}
      />
    </MaterialTopTabs>
  );
};
export default TabsLayout;