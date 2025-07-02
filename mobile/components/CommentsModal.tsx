"use client"

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
  const { top, bottom } = useSafeAreaInsets()
  const { commentText, setCommentText, createComment, isCreatingComment } = useComments()
  const { currentUser } = useCurrentUser()
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useImperativeHandle(ref, () => modalizeRef.current as Modalize)

  const handleClose = () => {
    modalizeRef.current?.close()
    setCommentText("")
  }

  const renderHeader = () => (
    <View className="bg-white">
      {/* Handle */}
      <View className="items-center py-3">
        <View className="w-10 h-1 bg-gray-300 rounded-full" />
      </View>

      {/* Header with close button */}
      <View className="flex-row items-center justify-between px-4 pb-4 border-b border-gray-100">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">Comments</Text>
          <Text className="text-sm text-gray-500">{selectedPost?.comments?.length || 0} comments</Text>
        </View>
        <TouchableOpacity
          onPress={handleClose}
          className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
        >
          <Feather name="x" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderFooter = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View
        className="bg-white border-t border-gray-100"
        style={{
          paddingBottom: Math.max(bottom, 16),
          paddingTop: 16,
        }}
      >
        <View className="flex-row items-end px-4 space-x-3">
          <Image source={{ uri: currentUser?.profilePicture }} className="w-8 h-8 rounded-full" />
          <View className="flex-1 max-h-24">
            <View className="flex-row items-end bg-gray-50 rounded-2xl px-4 py-2">
              <TextInput
                className="flex-1 text-base max-h-20"
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                textAlignVertical="center"
                onFocus={() => setIsKeyboardVisible(true)}
                onBlur={() => setIsKeyboardVisible(false)}
              />
              <TouchableOpacity
                onPress={() => createComment(selectedPost!._id)}
                disabled={isCreatingComment || !commentText.trim()}
                className="ml-2 p-1"
              >
                {isCreatingComment ? (
                  <ActivityIndicator size="small" color="#1877F2" />
                ) : (
                  <Feather name="send" size={20} color={commentText.trim() ? "#1877F2" : "#9CA3AF"} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )

  return (
    <Modalize
      ref={modalizeRef}
      modalStyle={{
        backgroundColor: "#F9FAFB",
        marginTop: top,
      }}
      modalHeight={SCREEN_HEIGHT - top}
      alwaysOpen={0}
      snapPoint={SCREEN_HEIGHT * 0.4}
      HeaderComponent={renderHeader}
      FooterComponent={renderFooter}
      handlePosition="inside"
      handleStyle={{ backgroundColor: "transparent" }}
      overlayStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      modalTopOffset={0}
      adjustToContentHeight={false}
      panGestureEnabled={true}
      closeOnOverlayTap={true}
      withHandle={false}
      keyboardAvoidingBehavior={Platform.OS === "ios" ? "padding" : "height"}
      flatListProps={{
        data: selectedPost?.comments || [],
        renderItem: ({ item }) => <CommentCard comment={item} />,
        keyExtractor: (item) => item._id,
        showsVerticalScrollIndicator: false,
        contentContainerStyle: {
          padding: 16,
          paddingTop: 8,
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
        keyboardShouldPersistTaps: "handled",
        keyboardDismissMode: "interactive",
      }}
      onClosed={() => setCommentText("")}
    />
  )
})

CommentsModal.displayName = "CommentsModal"

export default CommentsModal
