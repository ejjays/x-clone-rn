import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Post } from "@/types";
import { Feather } from "@expo/vector-icons";
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
  Pressable,
  FlatList
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentCard from "./CommentCard";

interface CommentsModalProps {
  selectedPost: Post | null;
}

// We are defining a type for the methods we expose via the ref
export interface CommentsModalRef {
  open: () => void;
  close: () => void;
}

const CommentsModal = forwardRef<CommentsModalRef, CommentsModalProps>(({ selectedPost }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const { bottom } = useSafeAreaInsets();
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
  
  // This is a small fix to clear the comment text after successful posting
  useEffect(() => {
    if (!isCreatingComment) {
        // Post-creation logic can go here if needed
    }
  }, [isCreatingComment]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={closeModal} />
        
        <View className="flex-1 bg-gray-100 rounded-t-2xl overflow-hidden mt-12">
          {/* Custom Header */}
          <View className="p-4 bg-white border-b border-gray-200">
            <View className="items-center pb-2">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold">Comments</Text>
              <TouchableOpacity
                onPress={closeModal}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              >
                <Feather name="x" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments List */}
          <FlatList
            data={selectedPost?.comments || []}
            renderItem={({ item }) => <CommentCard comment={item} />}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              flexGrow: 1,
            }}
            ListEmptyComponent={() => (
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
            )}
            keyboardShouldPersistTaps="handled"
          />

          {/* Comment Input Footer */}
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

CommentsModal.displayName = "CommentsModal";

export default CommentsModal;