import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Pressable,
  PanResponder,
  Animated,
} from "react-native";
import {
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { Dimensions } from "react-native";

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

const { height } = Dimensions.get("window");
const SNAP_TO_CLOSE_THRESHOLD = height * 0.2; // 20% of screen height to close
const DRAG_THRESHOLD = 5; // Pixels to distinguish a drag from a tap

const PostActionBottomSheet = forwardRef<
  PostActionBottomSheetRef,
  PostActionBottomSheetProps
>(({ onClose, onDelete, onCopyText, postContent }, ref) => {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current; // Initial position off-screen
  const [isDragging, setIsDragging] = useState(false); // New state to track if a drag is active

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
    close: () => {
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    },
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false, // No capture here, let children handle taps first
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags above a certain threshold
        const shouldSet = Math.abs(gestureState.dy) > DRAG_THRESHOLD;
        if (shouldSet) {
          setIsDragging(true); // Indicate that a drag has started
        }
        return shouldSet;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false); // Reset drag state
        if (gestureState.dy > SNAP_TO_CLOSE_THRESHOLD) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  const handleDeletePress = () => {
    if (!isDragging) { // Only fire if not dragging
      handleClose(); // Close the sheet before showing alert
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
    }
  };

  const handleCopyTextPress = () => {
    if (!isDragging) { // Only fire if not dragging
      handleClose(); // Close the sheet
      if (postContent) {
        onCopyText(postContent);
      }
    }
  };

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      {/* Full screen overlay */}
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
        onPress={handleClose}
      >
        {/* Bottom sheet content */}
        <Animated.View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 16, // Reduced from 34 to 16
            transform: [{ translateY: translateY }],
          }}
          {...panResponder.panHandlers} // Apply panHandlers to the whole content view
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#E5E5E5",
              borderRadius: 2,
              alignSelf: "center",
              marginTop: 12,
              marginBottom: 8,
            }}
          />

          <View className="px-4 pb-2">
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={() => {
                if (!isDragging) {
                  handleClose();
                  // Add Save Post functionality here later
                }
              }}
            >
              <Ionicons name="bookmark" size={24} color="black" />
              <Text className="ml-3 text-black text-lg font-semibold">
                Save Post
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={() => {
                if (!isDragging) {
                  handleClose();
                  // Add Pin Post functionality here later
                }
              }}
            >
              <Entypo name="pin" size={24} color="black" />
              <Text className="ml-3 text-black text-lg font-semibold">
                Pin Post
              </Text>
            </TouchableOpacity>
            {postContent && (
              <TouchableOpacity
                className="flex-row items-center py-4"
                onPress={handleCopyTextPress}
              >
                <Ionicons name="copy" size={24} color="black" />
                <Text className="ml-3 text-black text-lg font-semibold">
                  Copy Text
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={handleDeletePress}
            >
              <Entypo name="trash" size={24} color="red" />
              <Text className="ml-3 text-red-500 text-lg font-semibold">
                Delete Post
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-3 mt-2 border-t border-gray-200"
              onPress={() => {
                if (!isDragging) {
                  handleClose();
                }
              }}
            >
              <Text className="flex-1 text-center text-blue-500 text-lg font-bold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});

export default PostActionBottomSheet;
