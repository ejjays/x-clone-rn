import { useSocialAuth } from "@/hooks/useSocialAuth";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/clerk-expo";

export default function Register() {
  // This now correctly uses the more specific `isSocialAuthLoading` from our updated hook.
  const { handleSocialAuth, isSocialAuthLoading } = useSocialAuth();
  const { isLoaded, signUp, setActive } = useSignUp();

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
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 px-8 justify-center">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-blue-600 text-center mb-6">Create Account</Text>
          <Text className="text-center text-gray-800 text-base font-medium leading-6 px-4">
            Create an account so you can connect with{"\n"}your faith community at PCMI Infanta
          </Text>
        </View>

        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <TextInput
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base border-2 border-gray-200 focus:border-blue-600 text-gray-800"
              placeholder="First Name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View className="flex-1">
            <TextInput
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base border-2 border-gray-200 focus:border-blue-600 text-gray-800"
              placeholder="Last Name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <View className="mb-6">
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base pr-12 border-2 border-gray-200 focus:border-blue-600 text-gray-800"
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="mb-6">
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base pr-12 text-gray-800 border-2 border-gray-200 focus:border-blue-600"
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

        <View className="mb-10">
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base pr-12 text-gray-800 border-2 border-gray-200 focus:border-blue-600"
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-5"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-5 mb-8 flex-row items-center justify-center"
          style={{
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={handleEmailRegister}
          disabled={isLoading}
        >
          {isEmailRegistering ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg text-center">Sign up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="mb-10" onPress={() => router.push("/(auth)/login")}>
          <Text className="text-center text-blue-600 text-base font-medium">Already have an account</Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-gray-300 mr-2" />
          <Text className="text-center text-gray-500 text-base font-medium">Or continue with</Text>
          <View className="flex-1 h-px bg-gray-300 ml-2" />
        </View>

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
            {isSocialAuthLoading ? (
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
            {isSocialAuthLoading ? (
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