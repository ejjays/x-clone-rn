import { useUser } from "@clerk/clerk-expo";
import { Plus } from "lucide-react-native";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";

const Stories = () => {
  const { user } = useUser();
  const { colors } = useTheme(); // Use useTheme hook

  const stories = [
    {
      id: 0,
      username: "Create story",
      avatar: user?.imageUrl || "https://randomuser.me/api/portraits/men/0.jpg",
      storyImage: user?.imageUrl || "https://picsum.photos/seed/0/200/300",
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
      username: "Princess Leah Alloso",
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
    <View className="py-3 border-y" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
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
            <View className="absolute top-2 left-2 border-2 rounded-full" style={{ borderColor: item.id === 0 ? colors.blue : colors.blue }}>
              {item.id === 0 ? (
                <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.blue }}>
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
