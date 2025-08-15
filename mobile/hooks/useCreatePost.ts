// mobile/hooks/useCreatePost.ts
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from 'axios';
import { useApiClient } from "../utils/api";

// --- IMPORTANT: MAKE SURE THESE VALUES ARE CORRECT ---
const CLOUDINARY_CLOUD_NAME = "dagzpmz00";
const CLOUDINARY_UPLOAD_PRESET = "ejpogi";
// ----------------------------------------------------

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
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
      
      try {
        console.log(`Uploading ${media.type} to Cloudinary...`);
        const response = await axios.post(uploadUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const secureUrl = response.data.secure_url;

        // REMOVED EXPENSIVE VIDEO TRANSFORMATIONS TO SAVE CREDITS
        // The previous transformation was consuming 10-20+ credits per video upload
        // Now videos will be uploaded in their original format, using minimal credits
        
        console.log('Cloudinary upload successful. Final URL:', secureUrl);
        return secureUrl;

      } catch (e: any) {
        console.error("Cloudinary upload failed:", e.response?.data || e.message);
        Alert.alert("Upload Failed", "Could not upload your media. Please check your internet connection and try again.");
        return null;
      }
  };

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
      mediaUrl = await uploadMediaToCloudinary(selectedMedia);
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