// mobile/hooks/useCreatePost.ts
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useApiClient } from "../utils/api"

export const useCreatePost = () => {
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const api = useApiClient()
  const queryClient = useQueryClient()

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; imageUri?: string }) => {
      const formData = new FormData()

      if (postData.content) {
        formData.append("content", postData.content)
      }

      if (postData.imageUri) {
        const uriParts = postData.imageUri.split(".")
        const fileType = uriParts[uriParts.length - 1].toLowerCase()

        const mimeTypeMap: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        }
        const mimeType = mimeTypeMap[fileType] || "image/jpeg"

        formData.append("image", {
          uri: postData.imageUri,
          name: `upload.${fileType}`,
          type: mimeType,
        } as any)
      }

      return api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    },
    // We pass the callback to onSuccess
    onSuccess: (_, variables) => {
      setContent("")
      setSelectedImage(null)
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      // Alert.alert("Success", "Your post has been created!")

      // If a callback was provided in the original call, execute it.
      if (variables.onSuccess) {
        variables.onSuccess()
      }
    },
    onError: (error: any) => {
      console.error("Post creation failed:", error.response?.data || error.message)
      Alert.alert("Error", "Failed to create post. Please try again.")
    },
  })

  const handleImagePicker = async (useCamera: boolean = false) => {
    let permissionResult
    if (useCamera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    }

    if (permissionResult.status !== "granted") {
      const source = useCamera ? "camera" : "photo library"
      Alert.alert("Permission Required", `We need permission to access your ${source} to continue.`)
      return
    }

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions)

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  // createPost now accepts an optional callback
  const createPost = (onSuccess?: () => void) => {
    if (!content.trim() && !selectedImage) {
      Alert.alert("Empty Post", "Please write something or add an image.")
      return
    }

    const postData: { content: string; imageUri?: string; onSuccess?: () => void } = {
      content: content.trim(),
    }

    if (selectedImage) {
      postData.imageUri = selectedImage
    }

    if (onSuccess) {
      postData.onSuccess = onSuccess
    }

    createPostMutation.mutate(postData)
  }

  return {
    content,
    setContent,
    selectedImage,
    isCreating: createPostMutation.isPending,
    pickImageFromGallery: () => handleImagePicker(false),
    takePhoto: () => handleImagePicker(true),
    removeImage: () => setSelectedImage(null),
    createPost,
  }
}