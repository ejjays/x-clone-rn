import { useComments } from "@/hooks/useComments"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { Post } from "@/types"
import { Feather } from "@expo/vector-icons"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Modalize } from "react-native-modalize"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import CommentCard from "./CommentCard"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

interface CommentsModalProps {
  selectedPost: Post | null
}

const CommentsModal = forwardRef<Modalize, CommentsModalProps>(({ selectedPost }, ref) => {
  const modalizeRef = useRef<Modalize>(null)
  // Use bottom inset for keyboard padding, but not top
  const { bottom } = useSafeAreaInsets()
  const { commentText, setCommentText, createComment, isCreatingComment } = useComments()
  const { currentUser } = useCurrentUser()

  useImperativeHandle(ref, () => modalizeRef.current as Modalize)

  const handleClose = () => {
    modalizeRef.current?.close()
  }

  const handleCreateComment = () => {
    if (selectedPost) {
      createComment(selectedPost._id)
    }
  }

  // A simple handle for aesthetics
  const renderHeader = () => (
    <View className="items-center py-4 bg-white rounded-t-2xl">
      <View className="w-10 h-1 bg-gray-300 rounded-full" />
    </View>
  )

  const renderFooter = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // The offset helps push the input above the tab bar if needed, but we cover it
      keyboardVerticalOffset={0} 
    >
      <View
        className="bg-white border-t border-gray-200"
        style={{
          paddingBottom: bottom === 0 ? 16 : bottom,
          paddingTop: 16,
        }}
      >
        <View className="flex-row items-center px-4">
          <Image
            source={{
              uri:
                currentUser?.profilePicture ||
                `https://ui-avatars.com/api/?name=${currentUser?.firstName}+${currentUser?.lastName}`,
            }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View className="flex-1 bg-gray-100 rounded-full flex-row items-center pr-2">
            <TextInput
              className="flex-1 p-3 text-base text-gray-900"
              placeholder="Add a comment..."
              placeholderTextColor="#9CA3AF"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              onPress={handleCreateComment}
              disabled={isCreatingComment || !commentText.trim()}
              className="p-2"
            >
              {isCreatingComment ? (
                <ActivityIndicator size="small" color="#1DA1F2" />
              ) : (
                <Feather
                  name="send"
                  size={22}
                  color={commentText.trim() ? "#1DA1F2" : "#9CA3AF"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )

  return (
    <Modalize
      ref={modalizeRef}
      // This is the key change: we make the modal itself take the full screen height
      modalHeight={SCREEN_HEIGHT}
      // We explicitly set the top offset to 0 to cover the header
      modalTopOffset={0} 
      // This style applies to the modal's view container
      modalStyle={{
        backgroundColor: "#F9FAFB",
        borderTopLeftRadius: 20, // Rounded top-left corner
        borderTopRightRadius: 20, // Rounded top-right corner
        overflow: "hidden", // Ensures content respects the border radius
      }}
      // The overlay being transparent makes the background content visible until covered
      overlayStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} 
      // We let the content scroll inside, not adjust the modal height
      adjustToContentHeight={false}
      // We will use our own simple handle
      withHandle={false}
      HeaderComponent={renderHeader()}
      FooterComponent={renderFooter()}
      flatListProps={{
        data: selectedPost?.comments || [],
        renderItem: ({ item }) => <CommentCard comment={item} />,
        keyExtractor: (item) => item._id,
        showsVerticalScrollIndicator: false,
        contentContainerStyle: {
          paddingHorizontal: 16,
          paddingBottom: 50, // Extra space at the bottom of the list
          flexGrow: 1,
        },
        ListEmptyComponent: () => (
          <View className="flex-1 items-center justify-center py-20">
            <View className="items-center">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Feather name="message-circle" size={24} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-medium text-gray-900 mb-2">No comments yet</Text>
              <Text className="text-gray-500 text-center text-base max-w-xs">
                Be the first to share what you think!
              </Text>
            </View>
          </View>
        ),
      }}
      onClosed={() => setCommentText("")}
    />
  )
})

CommentsModal.displayName = "CommentsModal"

export default CommentsModal