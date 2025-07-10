import { View, Text, TouchableOpacity, Image, Dimensions, StatusBar, FlatList } from "react-native"
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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window")

const mockVideos = [
  {
    id: "1",
    user: {
      name: "Muk-Station",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      following: true,
    },
    title: "Beginner scales part 2",
    likes: "5.8k",
    comments: "289",
    shares: "333",
    thumbnail: "/placeholder.svg?height=800&width=400",
  },
  {
    id: "2",
    user: {
      name: "CreativeUser",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
      following: false,
    },
    title: "Amazing guitar tutorial for beginners",
    likes: "2.1k",
    comments: "156",
    shares: "89",
    thumbnail: "/placeholder.svg?height=800&width=400",
  },
  {
    id: "3",
    user: {
      name: "MusicMaster",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      following: true,
    },
    title: "Advanced chord progressions",
    likes: "8.2k",
    comments: "445",
    shares: "567",
    thumbnail: "/placeholder.svg?height=800&width=400",
  },
]

const VideoItem = ({ item, index }: { item: any; index: number }) => {
  return (
    <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }} className="relative">
      {/* Video Background - Full Screen */}
      <View className="absolute inset-0 bg-gray-900">
        <Image source={{ uri: item.thumbnail }} className="w-full h-full" resizeMode="cover" />
      </View>

      {/* Right Side Actions */}
      <View className="absolute right-3 bottom-24 z-20">
        <View className="space-y-6">
          {/* Like */}
          <TouchableOpacity className="items-center">
            <View className="w-12 h-12 rounded-full bg-black/30 items-center justify-center">
              <Heart size={28} color="white" fill="white" />
            </View>
            <Text className="text-white text-xs font-semibold mt-1">{item.likes}</Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity className="items-center">
            <View className="w-12 h-12 rounded-full bg-black/30 items-center justify-center">
              <MessageCircle size={28} color="white" />
            </View>
            <Text className="text-white text-xs font-semibold mt-1">{item.comments}</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity className="items-center">
            <View className="w-12 h-12 rounded-full bg-black/30 items-center justify-center">
              <Share size={28} color="white" />
            </View>
            <Text className="text-white text-xs font-semibold mt-1">{item.shares}</Text>
          </TouchableOpacity>

          {/* Send */}
          <TouchableOpacity className="items-center">
            <View className="w-12 h-12 rounded-full bg-black/30 items-center justify-center">
              <Send size={28} color="white" />
            </View>
            <Text className="text-white text-xs font-semibold mt-1">Send</Text>
          </TouchableOpacity>

          {/* More */}
          <TouchableOpacity className="items-center">
            <View className="w-12 h-12 rounded-full bg-black/30 items-center justify-center">
              <MoreHorizontal size={28} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Overlay */}
      <View className="absolute bottom-0 left-0 right-0 z-20">
        <View className="bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-8 pb-6">
          {/* Send Gift Button */}
          <TouchableOpacity className="flex-row items-center bg-black/50 rounded-full px-4 py-2 mb-4 self-start">
            <Gift size={16} color="white" />
            <Text className="text-white text-sm font-medium ml-2">Send a gift</Text>
          </TouchableOpacity>

          {/* User Info */}
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-gray-600 mr-3 overflow-hidden">
              <Image source={{ uri: item.user.avatar }} className="w-full h-full" resizeMode="cover" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white font-semibold text-base">{item.user.name}</Text>
                {item.user.verified && (
                  <View className="w-4 h-4 bg-blue-500 rounded-full ml-2 items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                )}
                <Text className="text-white/70 text-sm ml-2">• {item.user.following ? "Following" : "Follow"}</Text>
              </View>
            </View>
          </View>

          {/* Video Title */}
          <Text className="text-white text-base font-medium mb-3">{item.title}</Text>

          {/* Progress Bar */}
          <View className="w-full h-1 bg-white/20 rounded-full">
            <View className="w-1/3 h-full bg-white rounded-full" />
          </View>
        </View>
      </View>
    </View>
  )
}

const VideosScreen = () => {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Video List - Full Screen */}
      <FlatList
        data={mockVideos}
        renderItem={({ item, index }) => <VideoItem item={item} index={index} />}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      {/* Fixed Header Overlay */}
      <View className="absolute top-0 left-0 right-0 z-30" style={{ paddingTop: insets.top }}>
        <View className="flex-row justify-between items-center px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
          <Text className="text-2xl font-bold text-white">Reels</Text>
          <View className="flex-row items-center space-x-1">
            <TouchableOpacity className="p-2 rounded-full">
              <Camera size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded-full">
              <Search size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded-full">
              <UserCircle size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

export default VideosScreen
