import { Feather } from "@expo/vector-icons"
import { Text, View } from "react-native"

const NoNotificationsFound = () => {
  return (
    <View className="flex-1 items-center justify-center px-8 bg-white" style={{ minHeight: 400 }}>
      <View className="items-center">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Feather name="bell" size={32} color="#65676B" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-3">No notifications yet</Text>
        <Text className="text-gray-500 text-center text-base leading-6 max-w-xs">
          When people like, comment, or follow you, you'll see it here.
        </Text>
      </View>
    </View>
  )
}

export default NoNotificationsFound
