import { Modalize } from "react-native-modalize";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import {
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
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

const PostActionBottomSheet = forwardRef<
  PostActionBottomSheetRef,
  PostActionBottomSheetProps
>(({ onClose, onDelete, onCopyText, postContent }, ref) => {
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

  // This handler will be called *after* the Modalize component has fully closed
  const handleModalizeClosed = () => {
    // Defer the onClose call to prevent scheduling updates during useInsertionEffect
    // This ensures the parent's state update happens after the animation completes.
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
      onClosed={handleModalizeClosed}
      modalTopOffset={0} // Ensures the modal overlay covers the entire screen
    >
      <View className="p-4">
        <TouchableOpacity
          className="flex-row items-center py-3"
          onPress={() => {
            modalizeRef.current?.close();
            // Add Save Post functionality here later
          }}
        >
          <Ionicons name="bookmark" size={24} color="black" />
          <Text className="ml-3 text-black text-lg font-semibold">Save Post</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-3"
          onPress={() => {
            modalizeRef.current?.close();
            // Add Pin Post functionality here later
          }}
        >
          <Entypo name="pin" size={24} color="black" />
          <Text className="ml-3 text-black text-lg font-semibold">Pin Post</Text>
        </TouchableOpacity>

        {postContent && (
          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={handleCopyTextPress}
          >
            <Ionicons name="copy" size={24} color="black" />
            <Text className="ml-3 text-black text-lg font-semibold">Copy Text</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="flex-row items-center py-3"
          onPress={handleDeletePress}
        >
          <Entypo name="trash" size={24} color="red" />
          <Text className="ml-3 text-red-500 text-lg font-semibold">
            Delete Post
          </Text>
        </TouchableOpacity>

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
});

export default PostActionBottomSheet;
