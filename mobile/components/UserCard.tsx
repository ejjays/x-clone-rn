import type { User } from "@/types";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useFollow } from "@/hooks/useFollow";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface UserCardProps {
  user: User;
  onFollow?: (userId: string) => void;
  onMessage?: (user: User) => void;
  showMessageButton?: boolean;
}

const UserCard = ({
  user,
  onMessage,
  showMessageButton = true,
}: UserCardProps) => {
  const { colors } = useTheme();
  const { followUser, isLoading: isFollowLoading } = useFollow();
  const { currentUser } = useCurrentUser();

  // Check if current user is following this user
  const isFollowing = currentUser?.following?.includes(user._id) || false;

  const handleFollow = () => {
    followUser(user.clerkId); // Use clerkId as the backend expects it
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
            style={{
              backgroundColor: isFollowing ? "#707070" : "#d63b7e",
              opacity: isFollowLoading ? 0.7 : 1,
            }}
            onPress={handleFollow}
            disabled={isFollowLoading}
          >
            <Text className="text-white font-semibold">
              {isFollowLoading
                ? "Loading..."
                : isFollowing
                  ? "Unfollow"
                  : "Follow"}
            </Text>
          </TouchableOpacity>

          {showMessageButton && (
            <TouchableOpacity
              className="px-6 py-2 rounded-lg"
              style={{ backgroundColor: "#1877F2" }}
              onPress={handleMessage}
            >
              <Text className="text-white font-semibold">Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserCard;
