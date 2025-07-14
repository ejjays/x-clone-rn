import { Image, Text, TouchableOpacity, View } from "react-native"
import { router } from "expo-router"

export default function Welcome() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-between">
        <View className="flex-1 justify-center">
          {/* WELCOME ILLUSTRATION */}
          <View className="items-center mb-12">
            <Image
              source={require("../../assets/images/welcome-illustration.jpg")}
              className="w-80 h-80"
              resizeMode="contain"
            />
          </View>

          {/* TITLE */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-blue-600 text-center leading-tight">
              Discover Your{"\n"}Dream Job here
            </Text>
            <Text className="text-center text-gray-600 text-base mt-4 px-4">
              Explore all the existing job roles based on your{"\n"}interest and study major
            </Text>
          </View>

          {/* BUTTONS */}
          <View className="flex-row gap-4 mt-8">
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-2xl py-4"
              onPress={() => router.push("/(auth)/login")}
            >
              <Text className="text-white font-semibold text-lg text-center">Login</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1" onPress={() => router.push("/(auth)/register")}>
              <Text className="text-black font-semibold text-lg text-center py-4">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}
