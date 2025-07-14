import { useSocialAuth } from "@/hooks/useSocialAuth"
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native"
import { router } from "expo-router"
import { useState } from "react"

export default function Register() {
  const { handleSocialAuth, isLoading } = useSocialAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleEmailRegister = () => {
    // TODO: Implement email registration functionality
    console.log("Email register:", { email, password, confirmPassword })
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-center">
        {/* TITLE */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-blue-600 text-center mb-4">Create Account</Text>
          <Text className="text-center text-black text-base px-4">
            Create an account so you can explore all the{"\n"}existing jobs
          </Text>
        </View>

        {/* EMAIL INPUT */}
        <View className="mb-4">
          <TextInput
            className="bg-gray-100 rounded-2xl px-6 py-4 text-base border-2 border-blue-600"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* PASSWORD INPUT */}
        <View className="mb-4">
          <TextInput
            className="bg-gray-100 rounded-2xl px-6 py-4 text-base"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* CONFIRM PASSWORD INPUT */}
        <View className="mb-8">
          <TextInput
            className="bg-gray-100 rounded-2xl px-6 py-4 text-base"
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* SIGN UP BUTTON */}
        <TouchableOpacity className="bg-blue-600 rounded-2xl py-4 mb-6" onPress={handleEmailRegister}>
          <Text className="text-white font-semibold text-lg text-center">Sign up</Text>
        </TouchableOpacity>

        {/* ALREADY HAVE ACCOUNT LINK */}
        <TouchableOpacity className="mb-8" onPress={() => router.push("/(auth)/login")}>
          <Text className="text-center text-gray-600 text-base">Already have an account</Text>
        </TouchableOpacity>

        {/* OR CONTINUE WITH */}
        <Text className="text-center text-blue-600 text-base mb-6">Or continue with</Text>

        {/* SOCIAL AUTH BUTTONS */}
        <View className="flex-row justify-center gap-4">
          <TouchableOpacity
            className="bg-gray-100 rounded-2xl p-4 w-16 h-16 items-center justify-center"
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
            className="bg-gray-100 rounded-2xl p-4 w-16 h-16 items-center justify-center"
            onPress={() => handleSocialAuth("oauth_apple")}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Image source={require("../../assets/images/apple.png")} className="w-6 h-8" resizeMode="contain" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
