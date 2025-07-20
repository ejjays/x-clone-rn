import { useSocialAuth } from "@/hooks/useSocialAuth";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";

export default function Login() {
  const { handleSocialAuth, isLoading } = useSocialAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
      // Redirect to home or dashboard after successful login
      router.replace("/");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].message);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 px-8 justify-center">
        {/* TITLE */}
        <View className="mb-12">
          <Text className="text-4xl font-bold text-blue-800 text-center mb-6"> Login here 🔥</Text>
          <Text className="text-center text-gray-800 text-base font-medium leading-6">
            Welcome back you've{"\n"}been missed!
          </Text>
        </View>

        {/* EMAIL INPUT */}
        <View className="mb-6">
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base pr-12 border border-gray-300 focus:border-blue-600 text-gray-800"
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View className="absolute right-4 top-5">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* PASSWORD INPUT */}
        <View className="mb-4">
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base pr-12 text-gray-800 border border-gray-300 focus:border-blue-600"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity className="absolute right-4 top-5" onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FORGOT PASSWORD */}
        <TouchableOpacity className="mb-10">
          <Text className="text-blue-600 text-right text-base font-medium">Forgot your password?</Text>
        </TouchableOpacity>

        {/* SIGN IN BUTTON */}
        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-5 mb-8"
          style={{
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={handleEmailLogin}
        >
          <Text className="text-white font-bold text-lg text-center">Sign in</Text>
        </TouchableOpacity>

        {/* CREATE ACCOUNT LINK */}
        <TouchableOpacity className="mb-10" onPress={() => router.push("/(auth)/register")}>
          <Text className="text-center text-blue-600 text-base font-medium">Create new account</Text>
        </TouchableOpacity>

        {/* OR CONTINUE WITH */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-gray-300 mr-2" />
          <Text className="text-center text-gray-500 text-base font-medium">Or continue with</Text>
          <View className="flex-1 h-px bg-gray-300 ml-2" />
        </View>

        {/* SOCIAL AUTH BUTTONS */}
        <View className="flex-row justify-center gap-6">
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 w-16 h-16 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => handleSocialAuth("oauth_google")}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <Image source={require("../../assets/images/google.png")} className="w-12 h-12" resizeMode="contain" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl p-4 w-16 h-16 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => handleSocialAuth("oauth_apple")}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Image source={require("../../assets/images/apple.png")} className="w-6 h-8" resizeMode="contain" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl p-4 w-16 h-16 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => handleSocialAuth("oauth_facebook")}
            disabled={isLoading}
          >
            <Ionicons name="logo-facebook" size={30} color="#1877F2" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}