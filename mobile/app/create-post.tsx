// mobile/app/create-post.tsx
import { useCreatePost } from "@/hooks/useCreatePost"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { router } from "expo-router"
import { Image as ImageIcon, Send, Trash, X } from "lucide-react-native"
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native"

const CreatePostScreen = () => {
  const { currentUser } = useCurrentUser()
  const { content, setContent, selectedImage, isCreating, pickImageFromGallery, removeImage, createPost } =
    useCreatePost()

  const handleCreatePost = () => {
    // We pass a callback to the createPost function to handle navigation on success
    createPost(() => {
      router.back()
    })
  }

  const isPostButtonDisabled = (!content.trim() && !selectedImage) || isCreating

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -150}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <X size={24} color="#1C1E21" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Create post</Text>
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

        <ScrollView className="flex-1">
          <View className="p-4">
            {/* User Info */}
            <View className="flex-row items-center mb-4">
              <Image source={{ uri: currentUser?.profilePicture }} className="w-12 h-12 rounded-full mr-3" />
              <View>
                <Text className="font-bold text-base text-gray-900">
                  {currentUser?.firstName} {currentUser?.lastName}
                </Text>
                <Text className="text-gray-500">@{currentUser?.username}</Text>
              </View>
            </View>

            {/* Text Input */}
            <TextInput
              placeholder="What's on your mind?"
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              className="text-xl leading-7 text-gray-900"
              style={{ minHeight: 120, maxHeight: 400, paddingTop: 10, paddingBottom: 10 }}
            />

            {/* Image Preview */}
            {selectedImage && (
              <View className="mt-4 relative bg-gray-100 rounded-lg">
                <Image source={{ uri: selectedImage }} className="w-full h-72 rounded-lg" resizeMode="cover" />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full"
                  onPress={removeImage}
                >
                  <Trash size={18} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View className="border-t border-gray-200 px-4 py-3">
          <TouchableOpacity
            onPress={pickImageFromGallery}
            className="flex-row items-center bg-gray-100 p-3 rounded-lg"
          >
            <ImageIcon size={24} color="#4CAF50" />
            <Text className="ml-3 font-semibold text-base text-gray-800">Photos/videos</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default CreatePostScreen