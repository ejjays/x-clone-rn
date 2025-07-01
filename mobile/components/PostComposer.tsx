import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { View, Image, TextInput, TouchableOpacity } from "react-native";

const PostComposer = () => {
  const { user } = useUser();

  return (
    <View className="p-4 bg-white flex-row items-center border-b border-gray-200">
      <Image
        source={{ uri: user?.imageUrl }}
        className="w-10 h-10 rounded-full mr-3"
      />
      <View className="flex-1 bg-gray-100 rounded-full px-4 py-2.5">
        <TextInput
          placeholder="What's on your mind?"
          placeholderTextColor="#657786"
          className="text-base"
        />
      </View>
      <TouchableOpacity className="ml-4">
        <Feather name="image" size={24} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );
};

export default PostComposer;