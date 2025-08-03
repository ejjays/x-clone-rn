import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme

const PostComposer = () => {
  const { user } = useUser();
  const { isDarkMode } = useTheme(); // Use useTheme hook

  const colors = {
    background: isDarkMode ? "#111827" : "#ffffff",
    surface: isDarkMode ? "#1f2937" : "#f3f4f6",
    text: isDarkMode ? "#ffffff" : "#111827",
    textSecondary: isDarkMode ? "#d1d5db" : "#6b7280",
    textMuted: isDarkMode ? "#9ca3af" : "#9ca3af",
    border: isDarkMode ? "#374151" : "#e5e7eb",
    blue: "#3b82f6",
    icon: isDarkMode ? "#ffffff" : "#000000",
  };

  return (
    <View className="p-4" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center">
        <Image
          source={{ uri: user?.imageUrl }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <TouchableOpacity
          onPress={() => router.push("/create-post")}
          className="flex-1 rounded-full px-4 py-3"
          activeOpacity={0.7}
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-base" style={{ color: colors.textSecondary }}>
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
