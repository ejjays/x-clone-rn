import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types";
import { Feather } from "@expo/vector-icons";
import { forwardRef } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { Modalize } from "react-native-modalize";
import CommentCard from "./CommentCard";

const MODAL_HEIGHT = Dimensions.get("window").height * 0.8;

interface CommentsModalProps {
  selectedPost: Post | null;
}

const CommentsModal = forwardRef<Modalize, CommentsModalProps>(
  ({ selectedPost }, ref) => {
    const { commentText, setCommentText, createComment, isCreatingComment } =
      useComments();
    const { currentUser } = useCurrentUser();

    const renderHeader = () => (
      <View className="p-4 border-b border-gray-200 bg-white">
        <Text className="text-lg font-bold text-center">Comments</Text>
      </View>
    );

    const renderContent = () => {
      if (!selectedPost) return null;
      return (
        <FlatList
          data={selectedPost.comments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CommentCard comment={item} />}
          ListHeaderComponent={
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-start space-x-3">
                <Image
                  source={{ uri: selectedPost.user.profilePicture }}
                  className="size-10 rounded-full"
                />
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">
                    {selectedPost.user.firstName} {selectedPost.user.lastName}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    @{selectedPost.user.username}
                  </Text>
                  <Text className="text-base text-gray-800 mt-2 leading-6">
                    {selectedPost.content}
                  </Text>
                </View>
              </View>
            </View>
          }
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      );
    };

    return (
      <Modalize
        ref={ref}
        modalHeight={MODAL_HEIGHT}
        handlePosition="inside"
        HeaderComponent={renderHeader}
        keyboardAvoidingBehavior="padding"
        FooterComponent={
          <View className="p-4 bg-white border-t border-gray-200">
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
      >
        {renderContent()}
      </Modalize>
    );
  }
);

export default CommentsModal;