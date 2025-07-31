// mobile/app/create-post.tsx
import { useCreatePost } from "@/hooks/useCreatePost";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import {
  View,  
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video, ResizeMode } from "expo-av";
import { useEffect, useState, useRef } from "react";

const CreatePostScreen = () => { 
  const { currentUser } = useCurrentUser();
  const {
    content,
    setContent,
    selectedMedia,
    isCreating,
    pickMedia,
    removeMedia,
    createPost,
  } = useCreatePost();
  const insets = useSafeAreaInsets();
  const local = useLocalSearchParams();

  const placeholderTexts = [
    "What are you grateful for? ✨",
    "Encourage someone today! 🙌",
    "What's in your heart? ❤️",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Determine if autoFocus should be enabled
  const shouldAutoFocus = local.from !== "image";

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (content.length === 0) {
      // Only run animation if input is empty
      intervalId = setInterval(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 505,
          useNativeDriver: true,
        }).start(() => {
          setPlaceholderIndex(
            (prevIndex) => (prevIndex + 1) % placeholderTexts.length
          );
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
      }, 4000);
    } else {
      // If content exists, ensure full opacity and stop animation
      fadeAnim.setValue(1); // Instantly set to fully visible
      if (intervalId) {
        clearInterval(intervalId);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fadeAnim, content, placeholderTexts.length]);

  const handleCreatePost = () => {
    createPost(() => {
      router.back();
    });
  };

  const isPostButtonDisabled =
    (!content.trim() && !selectedMedia) || isCreating;

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="chevron-back-sharp" size={24} color="#1C1E21" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 ml-2">
              Create post
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCreatePost}
            disabled={isPostButtonDisabled}
            className={`px-5 py-2 rounded-full ${isPostButtonDisabled ? "bg-blue-300" : "bg-blue-500"}`}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="p-4">
            {/* User Info */}
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: currentUser?.profilePicture }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="font-bold text-base text-gray-900">
                  {currentUser?.firstName} {currentUser?.lastName}
                </Text>
                <Text className="text-gray-500">@{currentUser?.username}</Text>
              </View>
            </View>

            {/* Text Input */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <TextInput
                placeholder={placeholderTexts[placeholderIndex]}
                placeholderTextColor="#9CA3AF"
                value={content}
                onChangeText={setContent}
                multiline
                autoFocus={shouldAutoFocus}
                className="text-xl leading-7 text-gray-900"
                style={{
                  minHeight: 120,
                  maxHeight: 400,
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
              />
            </Animated.View>

            {/* Media Preview */}
            {selectedMedia && (
              <View className="mt-4 relative bg-gray-100 rounded-lg">
                {selectedMedia.type === "image" ? (
                  <Image
                    source={{ uri: selectedMedia.uri }}
                    className="w-full rounded-lg"
                    style={{ aspectRatio: 16/9 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Video
                    source={{ uri: selectedMedia.uri }}
                    style={{ width: "100%", aspectRatio: 16/9 }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                  />
                )}
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-black/60 p-1 rounded-full"
                  onPress={removeMedia}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View className="border-t border-gray-200 px-4 py-3">
          <TouchableOpacity
            onPress={pickMedia}
            className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-3"
          >
            <Fontisto name="photograph" size={24} color="#4CAF50" />
            <Text className="ml-3 font-semibold text-base text-gray-800">
              Photos/videos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreatePost}
            disabled={isPostButtonDisabled}
            className={`w-full py-3 rounded-lg items-center ${isPostButtonDisabled ? "bg-blue-300" : "bg-blue-500"}`}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePostScreen;
