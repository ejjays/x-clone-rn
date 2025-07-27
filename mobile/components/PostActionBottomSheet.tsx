import { Modalize } from "react-native-modalize";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useRef } from "react";

interface PostActionBottomSheetProps {
  onClose: () => void;
  onDelete: () => void;
  onCopyText: (text: string) => void;
  postContent?: string;
}

export interface PostActionBottomSheetRef {
  open: () => void;
  close: () => void;
}

const PostActionBottomSheet = forwardRef<PostActionBottomSheetRef, PostActionBottomSheetProps>(
  ({
    onClose,
    onDelete,
    onCopyText,
    postContent,
  }, ref) => {
    const modalizeRef = useRef<Modalize>(null);

    useImperativeHandle(ref, () => ({
      open: () => modalizeRef.current?.open(),
      close: () => modalizeRef.current?.close(),
    }));

    const handleDeletePress = () => {
      modalizeRef.current?.close();
      Alert.alert(
        "Delete Post",
        "Are you sure you want to delete this post?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: onDelete,
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    };

    const handleCopyTextPress = () => {
      modalizeRef.current?.close();
      if (postContent) {
        onCopyText(postContent);
      }
    };

    // This handler will be called when the Modalize component itself closes (e.g., swipe down, programmatic close)
    const handleModalizeClose = () => {
      // Defer the onClose call to prevent scheduling updates during useInsertionEffect
      setTimeout(() => onClose(), 0);
    };

    return (
      <Modalize
        ref={modalizeRef}
        modalStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
        handlePosition="inside"
        adjustToContentHeight={true}
        onClose={handleModalizeClose} // Use the internal handler here
      >
        <View className="p-4">
          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={handleDeletePress}
          >
            <FontAwesome name="trash" size={20} color="red" />
            <Text className="ml-3 text-red-500 text-lg">Delete Post</Text>
          </TouchableOpacity>
          {postContent && (
            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={handleCopyTextPress}
            >
              <FontAwesome name="copy" size={20} color="#657786" />
              <Text className="ml-3 text-gray-800 text-lg">Copy Text</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-row items-center py-3 mt-2 border-t border-gray-200"
            onPress={() => modalizeRef.current?.close()}
          >
            <Text className="flex-1 text-center text-blue-500 text-lg font-bold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    );
  }
);

export default PostActionBottomSheet;
