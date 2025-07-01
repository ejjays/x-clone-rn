import { useCreatePost } from "@/hooks/useCreatePost";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

const PostComposer = () => {
  const { user } = useUser();
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);

  // --- We are bringing back the hook that contains all our logic ---
  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    removeImage,
    createPost,
  } = useCreatePost();
  // ----------------------------------------------------------------

  // A wrapper function to handle the post creation and reset focus
  const handleCreatePost = () => {
    createPost();
    setIsTextInputFocused(false);
  };

  return (
    <View className="p-4 bg-white">
      <View className="flex-row items-center">
        <Image
          source={{ uri: user?.imageUrl }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1 bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            placeholder="What's on your mind?"
            placeholderTextColor="#657786"
            className="text-base"
            // --- Connecting the TextInput to our hook's state ---
            value={content}
            onChangeText={setContent}
            onFocus={() => setIsTextInputFocused(true)}
            // We don't use onBlur, so focus stays until post is sent or user taps away
            multiline
          />
        </View>

        {/* --- This is our new, intelligent button --- */}
        <TouchableOpacity
          className="ml-4"
          // If the input is focused, the button calls 'handleCreatePost'.
          // Otherwise, it calls 'pickImageFromGallery'.
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

      {/* --- Restoring the image preview section --- */}
      {selectedImage && (
        <View className="mt-4 relative">
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