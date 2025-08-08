import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import LottieView from "lottie-react-native"; 

export default function SSOCallback() {
  const { isSignedIn } = useAuth();

  if (isSignedIn === true) {
    // If the user is signed in, redirect them to the home screen.
    return <Redirect href="/(tabs)" />;
  }

  // While Clerk is processing the authentication, you can show a loading indicator.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        source={require('../assets/animations/loading-loader.json')}
        autoPlay={true}
        loop={true}
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}