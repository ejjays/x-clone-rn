import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { Text, View, ActivityIndicator } from "react-native";

export default function SSOCallback() {
  const { isSignedIn } = useAuth();

  if (isSignedIn === true) {
    // If the user is signed in, redirect them to the home screen.
    return <Redirect href="/(tabs)" />;
  }

  // While Clerk is processing the authentication, you can show a loading indicator.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{ marginTop: 20 }}>Completing sign-in...</Text>
    </View>
  );
}