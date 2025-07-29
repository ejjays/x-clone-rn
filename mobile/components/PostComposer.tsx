import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Image, Text, TouchableOpacity } from "react-native";

const PostComposer = () => {
  const { user } = useUser();

  return (
    <View className="p-4 bg-white">
      <View className="flex-row items-center">
        <Image
          source={{ uri: user?.imageUrl }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <TouchableOpacity
          onPress={() => router.push("/create-post")}
          className="flex-1 bg-gray-100 rounded-full px-4 py-3"
          activeOpacity={0.7}
        >
          <Text className="text-base text-gray-500">
            Share your thoughts...
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: "/create-post",
            params: { from: "image" }
          })}
          className="ml-4"
        >
          <MaterialCommunityIcons
            name="file-image"
            size={27}
            color={"#4CAF50"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostComposer;
