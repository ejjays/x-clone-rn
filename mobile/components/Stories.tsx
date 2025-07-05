import { useUser } from "@clerk/clerk-expo";
import { Plus } from "lucide-react-native"; // Replaced Feather
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";

// Mock data for stories
const MOCK_STORIES = [
  {
    id: 1,
    name: "Jhomar Reyes",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    storyImage:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&q=80",
  },
  {
    id: 2,
    name: "Aquila",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    storyImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    id: 3,
    name: "Logan Wood",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    storyImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  },
  {
    id: 4,
    name: "James Doe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    storyImage:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&q=80",
  },
];

const Stories = () => {
  const { user } = useUser();

  return (
    <View className="bg-white py-3 border-y border-gray-200">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {/* Create Story Card */}
        <TouchableOpacity className="w-28 h-48 rounded-xl overflow-hidden border border-gray-200">
          <Image
            source={{ uri: user?.imageUrl }}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 w-full h-16 bg-white items-center justify-end pb-2">
            <Text className="text-gray-800 font-semibold text-xs">
              Create story
            </Text>
          </View>
          <View className="absolute top-28 left-1/2 -ml-5 bg-blue-500 rounded-full w-10 h-10 items-center justify-center border-4 border-white">
            <Plus size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* Mock Stories */}
        {MOCK_STORIES.map((story) => (
          <TouchableOpacity
             key={story.id}
             className="w-28 h-48 rounded-xl overflow-hidden"
             >
            <Image
              source={{ uri: story.storyImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute top-2 left-2 border-2 border-blue-500 rounded-full">
              <Image
                source={{ uri: story.avatar }}
                className="w-9 h-9 rounded-full"
              />
            </View>
            <Text className="absolute bottom-2 left-2 text-white font-bold text-sm">
              {story.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Stories;