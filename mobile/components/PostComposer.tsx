import { useCreatePost } from "@/hooks/useCreatePost";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";

const PostComposer = () => {
  const { user } = useUser();
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);

  // Re-introducing the hook that handles all post creation logic
  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    removeImage,
    createPost,
  } = useCreatePost();

  const handleCreatePost = () => {
    createPost();
    setIsTextInputFocused(false); // Reset focus after posting
  };

  return (
    <View className="p-4 bg-white">
      <View className="flex-row items-center border-b border-gray-200 pb-4">
        <Image
          source={{ uri: user?.imageUrl }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1 bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            placeholder="What's on your mind?"
            placeholderTextColor="#657786"
            className="text-base"
            value={content}
            onChangeText={setContent}
            onFocus={() => setIsTextInputFocused(true)}
            onBlur={() => setIsTextInputFocused(false)}
            multiline
          />
        </View>

        {/* This is the conditional icon */}
        <TouchableOpacity
          className="ml-4"
          onPress={isTextInputFocused ? handleCreatePost : pickImageFromGallery}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" />
          ) : (
            <Feather
              name={isTextInputFocused ? "send" : "image"}
              size={24}
              color={isTextInputFocused ? "#1877F2" : "#4CAF50"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Display selected image if it exists */}
      {selectedImage && (
        <View className="mt-3 relative">
          <Image
            source={{ uri: selectedImage }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full"
            onPress={removeImage}
          >
            <Feather name="x" size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PostComposer;