import { useUser } from "@clerk/clerk-expo";
import { Plus } from "lucide-react-native"; // Replaced Feather
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";

const Stories = () => {
  const { user } = useUser();

  const stories = [
    {
      id: 0,
      username: "Create story",
      avatar: user?.imageUrl || "https://randomuser.me/api/portraits/men/0.jpg", // Use user's avatar or a placeholder
      storyImage: user?.imageUrl || "https://picsum.photos/seed/0/200/300", // Use user's avatar or a placeholder for story background
    },
    {
      id: 1,
      username: "Jeremy Alloso",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      storyImage: "https://picsum.photos/seed/1/200/300",
    },
    {
      id: 2,
      username: "Mae Maban",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      storyImage: "https://picsum.photos/seed/2/200/300",
    },
    {
      id: 3,
      username: "Cassel Wilson",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      storyImage: "https://picsum.photos/seed/3/200/300",
    },
    {
      id: 4,
      username: "Jaica Armada",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      storyImage: "https://picsum.photos/seed/4/200/300",
    },
    {
      id: 5,
      username: "James Marlon Alloso",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      storyImage: "https://picsum.photos/seed/5/200/300",
    },
    {
      id: 6,
      username: "Ashley Hernandez",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      storyImage: "https://picsum.photos/seed/6/200/300",
    },
    {
      id: 7,
      username: "Christ Son Alloso",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      storyImage: "https://picsum.photos/seed/7/200/300",
    },
    {
      id: 8,
      username: "Zaidel Garcia",
      avatar: "https://randomuser.me/api/portraits/women/8.jpg",
      storyImage: "https://picsum.photos/seed/8/200/300",
    },
    {
      id: 9,
      username: "Manny Dimasaka",
      avatar: "https://randomuser.me/api/portraits/men/9.jpg",
      storyImage: "https://picsum.photos/seed/9/200/300",
    },
    {
      id: 10,
      username: "Von Hernandez",
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      storyImage: "https://picsum.photos/seed/10/200/300",
    },
  ];

  return (
    <View className="bg-white py-3 border-y border-gray-200">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        data={stories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            className="w-28 h-48 rounded-xl overflow-hidden"
          >
            <Image
              source={{ uri: item.storyImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute top-2 left-2 border-2 border-blue-500 rounded-full">
              {item.id === 0 ? (
                <View className="w-9 h-9 rounded-full bg-blue-500 items-center justify-center">
                  <Plus size={24} color="white" />
                </View>
              ) : (
                <Image
                  source={{ uri: item.avatar }}
                  className="w-9 h-9 rounded-full"
                />
              )}
            </View>
            <Text className="absolute bottom-2 left-2 text-white font-bold text-sm">
              {item.username}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Stories;
