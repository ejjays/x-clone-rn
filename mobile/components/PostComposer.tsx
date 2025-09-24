import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const PostComposer = () => {
  const { user } = useUser();
  const { colors } = useTheme(); // Get colors from useTheme hook

  return (
    <View className="p-4" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center">
        <TouchableOpacity onPressIn={() => router.push("/my-profile")}>
          <Image
            source={{ uri: user?.imageUrl }}
            className="w-10 h-10 rounded-full mr-3"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPressIn={() => router.push("/create-post")}
          className="flex-1 rounded-full px-4 py-3"
          activeOpacity={0.7}
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            Share your thoughts...
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPressIn={() => router.push({
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
