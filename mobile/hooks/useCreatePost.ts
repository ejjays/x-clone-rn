// mobile/hooks/useCreatePost.ts
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApiClient } from "../utils/api";

export const useCreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: "image" | "video" } | null>(null);
  const api = useApiClient();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; mediaUri?: string; mediaType?: "image" | "video" }) => {
      const formData = new FormData();
      formData.append("content", postData.content);

      if (postData.mediaUri && postData.mediaType) {
        const uriParts = postData.mediaUri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const mimeType = postData.mediaType === "image" ? `image/${fileType === "jpg" ? "jpeg" : fileType}` : `video/${fileType}`;

        formData.append("media", {
          uri: postData.mediaUri,
          name: `upload.${fileType}`,
          type: mimeType,
        } as any);

        formData.append("mediaType", postData.mediaType);
      }

      return api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (_, variables) => {
      setContent("");
      setSelectedMedia(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      if (variables.onSuccess) {
        variables.onSuccess();
      }
    },
    onError: (error: any) => {
      console.error("Post creation failed:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to create post. Please try again.");
    },
  });

  const handleMediaPicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      Alert.alert("Permission Required", "We need permission to access your media to continue.");
      return;
    }

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false, // No cropping for video or images
      quality: 1,
    };

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedMedia({ uri: asset.uri, type: asset.type as "image" | "video" });
    }
  };

  const createPost = (onSuccess?: () => void) => {
    if (!content.trim() && !selectedMedia) {
      Alert.alert("Empty Post", "Please write something or add media.");
      return;
    }

    const postData: { content: string; mediaUri?: string; mediaType?: "image" | "video"; onSuccess?: () => void } = {
      content: content.trim(),
    };

    if (selectedMedia) {
      postData.mediaUri = selectedMedia.uri;
      postData.mediaType = selectedMedia.type;
    }

    if (onSuccess) {
      postData.onSuccess = onSuccess;
    }

    createPostMutation.mutate(postData);
  };

  return {
    content,
    setContent,
    selectedMedia,
    isCreating: createPostMutation.isPending,
    pickMedia: handleMediaPicker,
    removeMedia: () => setSelectedMedia(null),
    createPost,
  };
};