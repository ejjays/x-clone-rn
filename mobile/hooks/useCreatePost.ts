import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApiClient } from "../utils/api";

export const useCreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const api = useApiClient();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; imageUri?: string }) => {
      const formData = new FormData();

      if (postData.content) {
        formData.append("content", postData.content);
      }

      if (postData.imageUri) {
        const uriParts = postData.imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1].toLowerCase();

        // A more robust map for mime types
        const mimeTypeMap: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };
        const mimeType = mimeTypeMap[fileType] || "image/jpeg"; // Default to jpeg

        formData.append("image", {
          uri: postData.imageUri,
          name: `upload.${fileType}`,
          type: mimeType,
        } as any);
      }

      // Important: Use the correct headers for multipart/form-data
      return api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      setContent("");
      setSelectedImage(null);
      // Invalidate posts query to refetch and show the new post
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      Alert.alert("Success", "Your post has been created!");
    },
    onError: (error: any) => {
      console.error("Post creation failed:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to create post. Please try again.");
    },
  });

  const handleImagePicker = async (useCamera: boolean = false) => {
    let permissionResult;

    if (useCamera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (permissionResult.status !== "granted") {
      const source = useCamera ? "camera" : "photo library";
      Alert.alert(
        "Permission Required",
        `We need permission to access your ${source} to continue.`
      );
      return;
    }

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images for now
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Compress image to reduce size
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const createPost = () => {
    if (!content.trim() && !selectedImage) {
      Alert.alert("Empty Post", "Please write something or add an image.");
      return;
    }

    const postData: { content: string; imageUri?: string } = {
      content: content.trim(),
    };

    if (selectedImage) {
      postData.imageUri = selectedImage;
    }

    createPostMutation.mutate(postData);
  };

  return {
    content,
    setContent,
    selectedImage,
    isCreating: createPostMutation.isPending,
    pickImageFromGallery: () => handleImagePicker(false),
    takePhoto: () => handleImagePicker(true), // Added for future use
    removeImage: () => setSelectedImage(null),
    createPost,
  };
};