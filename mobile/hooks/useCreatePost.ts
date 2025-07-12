// mobile/hooks/useCreatePost.ts
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from 'axios';
import { useApiClient } from "../utils/api";

// --- IMPORTANT: MAKE SURE THESE VALUES ARE CORRECT ---
const CLOUDINARY_CLOUD_NAME = "dtna5t2em";
const CLOUDINARY_UPLOAD_PRESET = "aivq0snq";
// ----------------------------------------------------

export const useCreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: "image" | "video" } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const api = useApiClient();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; mediaUrl?: string; mediaType?: "image" | "video" }) => {
      return api.post("/posts", postData);
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
      const errorMessage = error.response?.data?.error || "Failed to create post. Please try again.";
      console.error("Post creation failed:", error.response?.data || error.message);
      Alert.alert("Error", errorMessage);
    },
  });
  
  const uploadMediaToCloudinary = async (media: { uri: string; type: 'image' | 'video' }): Promise<string | null> => {
      const formData = new FormData();
      formData.append('file', {
        uri: media.uri,
        type: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: `upload.${media.type === 'image' ? 'jpg' : 'mp4'}`,
      } as any);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
      
      try {
        const response = await axios.post(cloudinaryUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.secure_url;
      } catch (e) {
        console.error("Cloudinary upload failed:", e);
        Alert.alert("Upload Failed", "Could not upload your media. Please check your internet connection and try again.");
        return null;
      }
  };

  const handleMediaPicker = async () => {
    try {
      console.log("Requesting media library permissions...");
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        console.log("Permission denied.");
        Alert.alert("Permission Required", `We need permission to access your media. Please grant access in your phone's settings.`);
        return;
      }
      
      console.log("Permission granted. Launching image library...");
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        // FIX: The value should be the string 'All', not an enum.
        mediaTypes: 'All', 
        allowsEditing: false,
        quality: 1,
      };

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log("Asset selected:", asset);
        setSelectedMedia({ uri: asset.uri, type: asset.type as "image" | "video" });
      } else {
          console.log("Image picker was canceled or no asset was selected.");
      }
    } catch (error) {
        console.error("Error in handleMediaPicker:", error);
        Alert.alert("Error", "Could not open the media gallery. Please try again.");
    }
  };

  const createPost = async (onSuccess?: () => void) => {
    if (!content.trim() && !selectedMedia) {
      Alert.alert("Empty Post", "Please write something or add media.");
      return;
    }

    setIsUploading(true);

    let mediaUrl: string | null = null;
    if (selectedMedia) {
      mediaUrl = await uploadMediaToCloudinary(selectedMedia);
      if (!mediaUrl) {
         setIsUploading(false);
         return;
      }
    }

    const postData: { content: string; mediaUrl?: string; mediaType?: 'image' | 'video'; onSuccess?: () => void } = {
      content: content.trim(),
    };

    if (mediaUrl && selectedMedia) {
      postData.mediaUrl = mediaUrl;
      postData.mediaType = selectedMedia.type;
    }
    
    if (onSuccess) {
      postData.onSuccess = onSuccess;
    }
    
    createPostMutation.mutate(postData, {
        onSettled: () => {
            setIsUploading(false);
        }
    });
  };

  return {
    content,
    setContent,
    selectedMedia,
    isCreating: isUploading || createPostMutation.isPending,
    pickMedia: handleMediaPicker,
    removeMedia: () => setSelectedMedia(null),
    createPost,
  };
};