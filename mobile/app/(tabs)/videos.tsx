import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native"
import {
  Camera,
  Search,
  UserCircle,
  Heart,
  MessageCircle,
  Share,
  Send,
  Gift,
  MoreHorizontal,
} from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const VideosScreen = () => {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-4 py-2"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-2xl font-bold text-white">Reels</Text>
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity className="p-2">
            <Camera size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Search size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <UserCircle size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Video Content Area */}
      <ScrollView
        className="flex-1"
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={800}
        decelerationRate="fast"
      >
        {/* Video Item */}
        <View className="h-screen relative">
          {/* Background Video Placeholder */}
          <View className="absolute inset-0 bg-gray-800">
            <Image
              source={{ uri: "/placeholder.svg?height=800&width=400" }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Right Side Actions */}
          <View className="absolute right-3 bottom-32 space-y-6">
            {/* Like */}
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <Heart size={28} color="white" />
              </View>
              <Text className="text-white text-xs font-semibold mt-1">5.8k</Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <MessageCircle size={28} color="white" />
              </View>
              <Text className="text-white text-xs font-semibold mt-1">289</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <Share size={28} color="white" />
              </View>
              <Text className="text-white text-xs font-semibold mt-1">333</Text>
            </TouchableOpacity>

            {/* Send */}
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <Send size={28} color="white" />
              </View>
              <Text className="text-white text-xs font-semibold mt-1">Send</Text>
            </TouchableOpacity>

            {/* More */}
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <MoreHorizontal size={28} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom Overlay */}
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            {/* Send Gift Button */}
            <TouchableOpacity className="flex-row items-center bg-black/40 rounded-full px-4 py-2 mb-4 self-start">
              <Gift size={16} color="white" />
              <Text className="text-white text-sm font-medium ml-2">Send a gift</Text>
            </TouchableOpacity>

            {/* User Info */}
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-gray-600 mr-3">
                <Image source={{ uri: "/placeholder.svg?height=40&width=40" }} className="w-full h-full rounded-full" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-white font-semibold text-base">Muk-Station</Text>
                  <View className="w-4 h-4 bg-blue-500 rounded-full ml-2 items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                  <Text className="text-white/70 text-sm ml-2">• Following</Text>
                </View>
              </View>
            </View>

            {/* Video Title */}
            <Text className="text-white text-base font-medium mb-2">Beginner scales part 2</Text>

            {/* Progress Bar */}
            <View className="w-full h-1 bg-white/20 rounded-full">
              <View className="w-1/3 h-full bg-white rounded-full" />
            </View>
          </View>
        </View>

        {/* Additional Video Items */}
        <View className="h-screen relative">
          <View className="absolute inset-0 bg-gray-700">
            <Image
              source={{ uri: "/placeholder.svg?height=800&width=400" }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Right Side Actions */}
          <View className="absolute right-3 bottom-32 space-y-6">
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <Heart size={28} color="white" />
              </View>
              <Text className="text-white text-xs font-semibold mt-1">2.1k</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <MessageCircle size={28} color="white" />
              </View>
              <Text className="text-white text-xs font-semibold mt-1">156</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <Share size={28} color="white" />
              </View>
              <Text className="text-white text-xs font-semibold mt-1">89</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <Send size={28} color="white" />
              </View>
              <Text className="text-white text-xs font-semibold mt-1">Send</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 rounded-full bg-black/20 items-center justify-center">
                <MoreHorizontal size={28} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom Overlay */}
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <TouchableOpacity className="flex-row items-center bg-black/40 rounded-full px-4 py-2 mb-4 self-start">
              <Gift size={16} color="white" />
              <Text className="text-white text-sm font-medium ml-2">Send a gift</Text>
            </TouchableOpacity>

            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-gray-600 mr-3">
                <Image source={{ uri: "/placeholder.svg?height=40&width=40" }} className="w-full h-full rounded-full" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-white font-semibold text-base">CreativeUser</Text>
                  <Text className="text-white/70 text-sm ml-2">• Follow</Text>
                </View>
              </View>
            </View>

            <Text className="text-white text-base font-medium mb-2">Amazing guitar tutorial for beginners</Text>

            <View className="w-full h-1 bg-white/20 rounded-full">
              <View className="w-2/3 h-full bg-white rounded-full" />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default VideosScreen
