import type { User } from "@/types";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface UserCardProps {
  user: User;
  onFollow?: (userId: string) => void;
  onMessage?: (user: User) => void;
  isFollowing?: boolean;
  showMessageButton?: boolean;
}

const UserCard = ({
  user,
  onFollow,
  onMessage,
  isFollowing,
  showMessageButton = true,
}: UserCardProps) => {
  const { colors } = useTheme();

  const handleFollow = () => {
    if (onFollow) {
      onFollow(user._id);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(user);
    } else {
      Alert.alert(
        "Message",
        `Start a conversation with ${user.firstName} ${user.lastName}`
      );
    }
  };

  const handleMoreOptions = () => {
    Alert.alert(
      "Options",
      `More options for ${user.firstName} ${user.lastName}`,
      [
        { text: "View Profile", onPress: () => console.log("View profile") },
        {
          text: "Block User",
          style: "destructive",
          onPress: () => console.log("Block user"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Fallback profile picture if user doesn't have one
  const profilePicture =
    user.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`;

  return (
    <TouchableOpacity
      className="flex-row items-center p-4"
      activeOpacity={0.7}
      style={{ backgroundColor: colors.background }}
    >
      {/* Profile Picture */}
      <Image
        source={{ uri: profilePicture }}
        className="w-[85px] h-[85px] rounded-full mr-4"
        defaultSource={{
          uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`,
        }}
      />

      {/* User Info */}
      <View className="flex-1">
        <Text className="text-xl font-semibold" style={{ color: colors.text }}>
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          @{user.username}
        </Text>

        {/* Action Buttons */}
        <View className="flex-row items-center space-x-2 mt-2">
          <TouchableOpacity
            className="px-8 py-2 rounded-lg mr-3"
            style={{ backgroundColor: "#d63b7e" }}
          >
            <Text className="text-white font-semibold">Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-6 py-2 rounded-lg"
            style={{ backgroundColor: "#707070" }}
          >
            <Text className="text-white font-semibold">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserCard;
