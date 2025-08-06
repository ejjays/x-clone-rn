import type { User } from "@/types";
import { MoreHorizontal } from "lucide-react-native";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import PcmiChatIcon from "@/assets/icons/PcmiChatIcon";
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
        className="w-16 h-16 rounded-full mr-4"
        defaultSource={{
          uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`,
        }}
      />

      {/* User Info */}
      <View className="flex-1">
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          @{user.username}
        </Text>
        {user.bio && (
          <Text
            className="text-sm mt-1"
            numberOfLines={2}
            style={{ color: colors.textSecondary }}
          >
            {user.bio}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center space-x-2">
        {showMessageButton && (
          <TouchableOpacity
            className="w-12 h-12 rounded-full items-center justify-center"
            onPress={handleMessage}
          >
            <PcmiChatIcon size={30} color={colors.icon} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="w-8 h-8 items-center justify-center"
          onPress={handleMoreOptions}
        >
          <MoreHorizontal size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default UserCard;
