import { useSocialAuth } from "@/hooks/useSocialAuth"
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native"
import { router } from "expo-router"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"

export default function Login() {
  const { handleSocialAuth, isLoading } = useSocialAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleEmailLogin = () => {
    // TODO: Implement email login functionality
    console.log("Email login:", { email, password })
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 px-8 justify-center">
        {/* TITLE */}
        <View className="mb-12">
          <Text className="text-4xl font-bold text-blue-600 text-center mb-6">Login here</Text>
          <Text className="text-center text-gray-800 text-base font-medium leading-6">
            Welcome back you've{"\n"}been missed!
          </Text>
        </View>

        {/* EMAIL INPUT */}
        <View className="mb-6">
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base border-2 border-blue-600 pr-12"
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
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
              className="bg-gray-100 rounded-2xl px-6 py-5 text-base pr-12"
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
          <Text className="text-center text-gray-700 text-base font-medium">Create new account</Text>
        </TouchableOpacity>

        {/* OR CONTINUE WITH */}
        <Text className="text-center text-blue-600 text-base font-medium mb-8">Or continue with</Text>

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
              <Image source={require("../../assets/images/google.png")} className="w-8 h-8" resizeMode="contain" />
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
          >
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
