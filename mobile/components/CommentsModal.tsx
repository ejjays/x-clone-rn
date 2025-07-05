import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Post } from "@/types";
import { MessageCircle, Send, X } from "lucide-react-native"; // Replaced Feather
import { forwardRef, useImperativeHandle, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentCard from "./CommentCard";

// We are defining a type for the methods we expose via the ref
export interface CommentsModalRef {
  open: () => void;
  close: () => void;
}

const CommentsModal = forwardRef<CommentsModalRef, CommentsModalProps>(({ selectedPost }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  // We get the insets to apply them specifically where needed.
  const { top, bottom } = useSafeAreaInsets();
  const { commentText, setCommentText, createComment, isCreatingComment } = useComments();
  const { currentUser } = useCurrentUser();

  const openModal = useCallback(() => setIsVisible(true), []);
  const closeModal = useCallback(() => {
    setIsVisible(false);
    setCommentText(""); // Clear comment text on close
  }, [setCommentText]);

  // This exposes the `open` and `close` methods to the parent component
  useImperativeHandle(ref, () => ({
    open: openModal,
    close: closeModal,
  }), [openModal, closeModal]);

  const handleCreateComment = () => {
    if (selectedPost) {
      createComment({ postId: selectedPost._id, content: commentText.trim() });
    }
  };

  useEffect(() => {
    // This effect can be used to clear text after a comment is successfully posted.
  }, [isCreatingComment]);

  return (
    <Modal
      animationType="slide"
      transparent={false} // This is correct, ensures it covers everything.
      visible={isVisible}
      onRequestClose={closeModal}
      // This StatusBar setting is for when the modal is active
      statusBarTranslucent
    >
      <View className="flex-1 bg-gray-100 rounded-t-2xl">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* THIS IS THE FIX: The main container View has no top padding.
            We apply the top padding only to the Header content.
          */}

          {/* Custom Header with SafeArea padding */}
          <View style={{ paddingTop: top }} className="bg-white rounded-t-2xl">
            <View className="p-4 border-b border-gray-200">
              <View className="items-center pb-2">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold">Comments</Text>
                <TouchableOpacity
                  onPress={closeModal}
                  className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
                >
                  <X size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Comments List takes up the remaining space */}
          <FlatList
            data={selectedPost?.comments || []}
            renderItem={({ item }) => <CommentCard comment={item} />}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{
              padding: 16,
              flexGrow: 1,
            }}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-20">
                <View className="items-center">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <MessageCircle size={24} color="#9CA3AF" />
                  </View>
                  <Text className="text-lg font-medium text-gray-900 mb-2">No comments yet</Text>
                  <Text className="text-gray-500 text-center text-base max-w-xs">
                    Be the first to share what you think!
                  </Text>
                </View>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
          />

          {/* Comment Input Footer with SafeArea padding */}
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
                    <Send
                      size={22}
                      color={commentText.trim() ? "#1DA1F2" : "#9CA3AF"}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

CommentsModal.displayName = "CommentsModal";

export default CommentsModal;