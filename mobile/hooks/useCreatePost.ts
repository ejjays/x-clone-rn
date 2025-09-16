// mobile/hooks/useCreatePost.ts
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApiClient } from "../utils/api";
import { uploadMediaToImageKit } from "@/utils/imagekit";

// Signed uploads via backend; no unsigned presets in client

export const useCreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: "image" | "video" } | null>(null);
  const [videoFit, setVideoFit] = useState<"original" | "full">("full");
  const [isUploading, setIsUploading] = useState(false);
  const api = useApiClient();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; mediaUrl?: string; mediaType?: "image" | "video"; videoFit?: "original" | "full"; onSuccess?: () => void }) => {
      return api.post("/posts", postData);
    },
    onSuccess: (_: any, variables: { onSuccess?: () => void }) => {
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
  
  // Posts: upload to ImageKit (keep chat on Cloudinary)
  const uploadMediaForPost = async (media: { uri: string; type: 'image' | 'video' }): Promise<string | null> => {
    const url = await uploadMediaToImageKit(media, api)
    if (!url) {
      Alert.alert('Upload Failed', 'Could not upload your media. Please try again.')
    }
    return url
  }

  const handleMediaPicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert("Permission Required", `We need permission to access your media. Please grant access in your phone's settings.`);
        return;
      }
      
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8, // Reduced from 1 to 0.8 to save on file size and credits
      };

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedMedia({ uri: asset.uri, type: asset.type as "image" | "video" });
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
      mediaUrl = await uploadMediaForPost(selectedMedia);
      if (!mediaUrl) {
         setIsUploading(false);
         return;
      }
    }

    const postData: { content: string; mediaUrl?: string; mediaType?: 'image' | 'video'; videoFit?: 'original' | 'full'; onSuccess?: () => void } = {
      content: content.trim(),
    };

    if (mediaUrl && selectedMedia) {
      postData.mediaUrl = mediaUrl;
      postData.mediaType = selectedMedia.type;
      if (selectedMedia.type === 'video') {
        postData.videoFit = videoFit;
      }
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
    videoFit,
    setVideoFit,
    isCreating: isUploading || createPostMutation.isPending,
    pickMedia: handleMediaPicker,
    removeMedia: () => setSelectedMedia(null),
    createPost,
  };
};