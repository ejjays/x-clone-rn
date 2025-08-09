import { useSocialAuth } from "@/hooks/useSocialAuth";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

export default function Login() {
  const { handleSocialAuth, isLoading } = useSocialAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isDarkMode, colors } = useTheme();

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View className="flex-1 px-8 justify-center">
        {/* TITLE */}
        <View className="mb-8">
          <Text
            className="text-4xl font-bold text-center mb-3"
            style={{ color: colors.text }}
          >
            Login
          </Text>
          <Text
            className="text-center text-base font-medium"
            style={{ color: colors.textSecondary }}
          >
            Welcome back, you've been missed!
          </Text>
        </View>

        {/* EMAIL INPUT */}
        <View className="mb-5">
          <View className="relative">
            <TextInput
              className="rounded-2xl px-6 py-5 text-base pr-12"
              style={{
                backgroundColor: colors.surface,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View className="absolute right-4 top-5">
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
            </View>
          </View>
        </View>

        {/* PASSWORD INPUT */}
        <View className="mb-3">
          <View className="relative">
            <TextInput
              className="rounded-2xl px-6 py-5 text-base pr-12"
              style={{
                backgroundColor: colors.surface,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity className="absolute right-4 top-5" onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FORGOT PASSWORD */}
        <TouchableOpacity className="mb-8">
          <Text className="text-right text-base font-medium" style={{ color: colors.blue }}>
            Forgot your password?
          </Text>
        </TouchableOpacity>

        {/* SIGN IN BUTTON */}
        <TouchableOpacity
          className="rounded-2xl py-5 mb-7"
          style={{ backgroundColor: colors.blue }}
          onPress={handleEmailLogin}
          activeOpacity={0.85}
        >
          <Text className="font-bold text-lg text-center" style={{ color: "#ffffff" }}>
            Sign in
          </Text>
        </TouchableOpacity>

        {/* CREATE ACCOUNT LINK */}
        <TouchableOpacity className="mb-10" onPress={() => router.push("/(auth)/register")}>
          <Text className="text-center text-base font-medium" style={{ color: colors.blue }}>
            Create new account
          </Text>
        </TouchableOpacity>

        {/* OR CONTINUE WITH */}
        <View className="flex-row items-center mb-7">
          <View className="flex-1 h-px mr-2" style={{ backgroundColor: colors.border }} />
          <Text className="text-center text-base font-medium" style={{ color: colors.textMuted }}>
            Or continue with
          </Text>
          <View className="flex-1 h-px ml-2" style={{ backgroundColor: colors.border }} />
        </View>

        {/* SOCIAL AUTH BUTTONS */}
        <View className="flex-row justify-center gap-6">
          <TouchableOpacity
            className="rounded-2xl p-4 w-16 h-16 items-center justify-center"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
            onPress={() => handleSocialAuth("oauth_google")}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <Image source={require("../../assets/images/google.png")} className="w-12 h-12" resizeMode="contain" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-2xl p-4 w-16 h-16 items-center justify-center"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
            onPress={() => handleSocialAuth("oauth_apple")}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Image source={require("../../assets/images/apple.png")} className="w-6 h-8" resizeMode="contain" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-2xl p-4 w-16 h-16 items-center justify-center"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
            onPress={() => handleSocialAuth("oauth_facebook")}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-facebook" size={30} color="#1877F2" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}