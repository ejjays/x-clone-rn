import { useSocialAuth } from "@/hooks/useSocialAuth";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

export default function Register() {
  // This now correctly uses the more specific `isSocialAuthLoading` from our updated hook.
  const { handleSocialAuth, isSocialAuthLoading } = useSocialAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { colors, isDarkMode } = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // This state is only for the email registration button.
  const [isEmailRegistering, setIsEmailRegistering] = useState(false);

  const handleEmailRegister = async () => {
    if (!isLoaded || isEmailRegistering) {
      return;
    }

    if (!firstName || !lastName || !emailAddress || !password) {
      Alert.alert("Missing Fields", "Please fill out all fields to register.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsEmailRegistering(true);

    try {
      const signUpAttempt = await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      if (signUpAttempt.createdSessionId) {
        await setActive({ session: signUpAttempt.createdSessionId });
        console.log("✅ User registered and session activated successfully!");
        router.replace("/(tabs)");
      } else {
        console.error("Sign up did not create a session ID.");
        Alert.alert(
          "Verification Needed",
          "Please check your email to verify your account before logging in."
        );
        router.push("/(auth)/login");
      }
    } catch (err: any) {
      console.error("Registration Error:", JSON.stringify(err, null, 2));
      const errorMessage = err.errors?.[0]?.message || "An unknown error occurred during registration.";
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsEmailRegistering(false);
    }
  };

  const isLoading = isEmailRegistering || isSocialAuthLoading;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View className="flex-1 px-8 justify-center">
        <View className="mb-8">
          <Text className="text-4xl font-bold text-center mb-3" style={{ color: colors.text }}>
            Create Account
          </Text>
          <Text className="text-center text-base font-medium leading-6 px-4" style={{ color: colors.textSecondary }}>
            Fill in the details to connect with others.
          </Text>
        </View>

        <View className="flex-row gap-4 mb-5">
          <View className="flex-1">
            <TextInput
              className="rounded-2xl px-6 py-5 text-base"
              style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }}
              placeholder="First Name"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View className="flex-1">
            <TextInput
              className="rounded-2xl px-6 py-5 text-base"
              style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }}
              placeholder="Last Name"
              placeholderTextColor={colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <View className="mb-5">
          <View className="relative">
            <TextInput
              className="rounded-2xl px-6 py-5 text-base pr-12"
              style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="mb-5">
          <View className="relative">
            <TextInput
              className="rounded-2xl px-6 py-5 text-base pr-12"
              style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }}
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

        <View className="mb-8">
          <View className="relative">
            <TextInput
              className="rounded-2xl px-6 py-5 text-base pr-12"
              style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-5"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="rounded-2xl py-5 mb-7 flex-row items-center justify-center"
          style={{ backgroundColor: colors.blue }}
          onPress={handleEmailRegister}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isEmailRegistering ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-bold text-lg text-center" style={{ color: "#ffffff" }}>Sign up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="mb-9" onPress={() => router.push("/(auth)/login")}>
          <Text className="text-center text-base font-medium" style={{ color: colors.blue }}>
            Already have an account
          </Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center mb-7">
          <View className="flex-1 h-px mr-2" style={{ backgroundColor: colors.border }} />
          <Text className="text-center text-base font-medium" style={{ color: colors.textMuted }}>
            Or continue with
          </Text>
          <View className="flex-1 h-px ml-2" style={{ backgroundColor: colors.border }} />
        </View>

        <View className="flex-row justify-center gap-6">
          <TouchableOpacity
            className="rounded-2xl p-4 w-16 h-16 items-center justify-center"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
            onPress={() => handleSocialAuth("oauth_google")}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isSocialAuthLoading ? (
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
            {isSocialAuthLoading ? (
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
            {isSocialAuthLoading ? (
              <ActivityIndicator size="small" color="#1877F2" />
            ) : (
             <Ionicons name="logo-facebook" size={30} color="#1877F2" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}