import { Image, Text, TouchableOpacity, View } from "react-native"
import { router } from "expo-router"

export default function Welcome() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 px-8 justify-center">
        {/* WELCOME ILLUSTRATION */}
        <View className="items-center mb-16">
          <Image
            source={require("../../assets/images/welcome-illustration.png")}
            className="w-80 h-80"
            resizeMode="contain"
          />
        </View>

        {/* TITLE */}
        <View className="mb-12">
          <Text className="text-4xl font-bold text-blue-600 text-center leading-tight mb-6">
            Connect with Your{"\n"}Faith Community
          </Text>
          <Text className="text-center text-gray-700 text-base px-4 leading-6">
            Join PCMI Infanta and stay connected with{"\n"}sermons, events, and your church family
          </Text>
        </View>

        {/* BUTTONS */}
        <View className="flex-row gap-4 mt-8">
          <TouchableOpacity
            className="flex-1 bg-blue-600 rounded-2xl py-4 shadow-lg"
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white font-bold text-lg text-center">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 justify-center" onPress={() => router.push("/(auth)/register")}>
            <Text className="text-gray-800 font-semibold text-lg text-center">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
