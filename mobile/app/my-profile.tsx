import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { ChevronLeft } from "lucide-react-native";

export default function MyProfile() {
  const { currentUser } = useCurrentUser();
  const { colors } = useTheme();

  if (!currentUser) {
    return <View className="flex-1" style={{ backgroundColor: colors.background }} />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image
            source={{ uri: currentUser.bannerImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop" }}
            className="w-full h-56"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPressIn={() => router.back()}
            style={{ position: "absolute", top: 14, left: 14, padding: 8, borderRadius: 9999, backgroundColor: "rgba(0,0,0,0.35)" }}
          >
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>

          <View style={{ marginTop: -64, paddingHorizontal: 16 }}>
            <Image
              source={{ uri: currentUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName + " " + currentUser.lastName)}&background=2563EB&color=fff&size=120` }}
              className="w-32 h-32 rounded-full border-4"
              style={{ borderColor: colors.background }}
            />
            <Text className="text-2xl font-bold mt-4" style={{ color: colors.text }}>
              {currentUser.firstName} {currentUser.lastName}
            </Text>
            {currentUser.bio ? (
              <Text className="mt-2" style={{ color: colors.textSecondary }}>{currentUser.bio}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

