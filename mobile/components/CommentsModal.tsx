import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types";
import { Feather } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentCard from "./CommentCard";

const MODAL_HEIGHT = Dimensions.get("window").height * 0.95;

interface CommentsModalProps {
  selectedPost: Post | null;
}

const CommentsModal = forwardRef<Modalize, CommentsModalProps>(
  ({ selectedPost }, ref) => {
    const modalizeRef = useRef<Modalize>(null);
    const { bottom } = useSafeAreaInsets();
    const { commentText, setCommentText, createComment, isCreatingComment } =
      useComments();
    const { currentUser } = useCurrentUser();

    useImperativeHandle(ref, () => modalizeRef.current as Modalize);

    const renderHeader = () => (
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-2xl">
        <View className="w-6" />
        <Text className="text-lg font-bold text-center">Comments</Text>
        <TouchableOpacity
          onPress={() => modalizeRef.current?.close()}
          className="p-1"
        >
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );

    return (
      <Modalize
        ref={modalizeRef}
        modalHeight={MODAL_HEIGHT}
        handlePosition="inside"
        withHandle={false}
        modalStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        HeaderComponent={renderHeader}
        FooterComponent={
          <View
            className="p-4 bg-white border-t border-gray-200"
            style={{ paddingBottom: bottom || 16 }}
          >
            <View className="flex-row items-center space-x-3">
              <Image
                source={{ uri: currentUser?.profilePicture }}
                className="size-10 rounded-full"
              />
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4">
                <TextInput
                  className="flex-1 py-3 text-base"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity
                  onPress={() => createComment(selectedPost!._id)}
                  disabled={isCreatingComment || !commentText.trim()}
                >
                  {isCreatingComment ? (
                    <ActivityIndicator size="small" color="#1877F2" />
                  ) : (
                    <Feather
                      name="send"
                      size={24}
                      color={
                        commentText.trim() ? "#1877F2" : "rgba(0,0,0,0.3)"
                      }
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        flatListProps={{
          data: selectedPost?.comments || [],
          renderItem: ({ item }) => <CommentCard comment={item} />,
          keyExtractor: (item) => item._id,
          showsVerticalScrollIndicator: false,
          contentContainerStyle: { padding: 16 },
          ListEmptyComponent: (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500">No comments yet.</Text>
              <Text className="text-gray-400 text-sm">Be the first to comment!</Text>
            </View>
          ),
        }}
      />
    );
  }
);

export default CommentsModal;