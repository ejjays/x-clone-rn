import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  PanResponder,
  Animated,
  StyleSheet,
} from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Dimensions } from "react-native";
import ConfirmationAlert from "./ConfirmationAlert";
import { setStringAsync } from 'expo-clipboard';
import { useTheme } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 

interface PostActionBottomSheetProps {
  onClose: () => void;
  onDelete: () => void;
  onCopyText: (text: string) => void;
  postContent?: string;
  isOwnPost?: boolean;          
  isAdmin?: boolean;            
  postOwnerName?: string;       
}

export interface PostActionBottomSheetRef {
  open: () => void;
  close: () => void;
}

const { height } = Dimensions.get("window");
const SNAP_TO_CLOSE_THRESHOLD = height * 0.2;
const DRAG_THRESHOLD = 5;

const PostActionBottomSheet = forwardRef<
  PostActionBottomSheetRef,
  PostActionBottomSheetProps
>(({ onClose, onDelete, onCopyText, postContent, isOwnPost = true, isAdmin = false, postOwnerName }, ref) => {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomSheetStyle = useMemo(() => ({
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: insets.bottom,
    transform: [{ translateY: translateY }],
  }), [colors.background, insets.bottom]);

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
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const shouldSet = Math.abs(gestureState.dy) > DRAG_THRESHOLD;
        if (shouldSet) {
          setIsDragging(true);
        }
        return shouldSet;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy); 
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
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
    if (!isDragging) {
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
  setIsDeleting(true);
  try {
    await onDelete();
    setShowDeleteConfirm(false);
    requestAnimationFrame(() => {
      handleClose();
    });
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    setIsDeleting(false);
  }
};

  const handleCopyTextPress = () => {
    if (!isDragging) {
      handleClose();
      if (postContent) {
        setStringAsync(postContent);
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

  const deleteText = isOwnPost ? "Delete Post" : "Delete Post (Admin)";
  const confirmationTitle = isOwnPost ? "Delete Post" : "Delete Post (Admin Action)";
  const confirmationMessage = isOwnPost 
    ? "Are you sure you want to delete this post? This action cannot be undone."
    : `Are you sure you want to delete ${postOwnerName}\'s post? This action cannot be undone and will be logged as an admin action.`;

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
        <Animated.View style={bottomSheetStyle} {...panResponder.panHandlers}>
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#444444",
              borderRadius: 2,
              alignSelf: "center",
              marginTop: 12,
              marginBottom: 8,
            }}
          />

          <View className="px-4 pb-2">
            {/* Only show Save/Pin options for own posts */}
            {isOwnPost && (
              <>
                <TouchableOpacity
                  className="flex-row items-center py-4"
                  onPress={() => {
                    if (!isDragging) {
                      handleClose();
                    }
                  }}
                >
                  <Ionicons name="bookmark" size={22} color="white" />
                  <Text className="ml-3 text-gray-200 text-lg font-semibold">
                    Save Post
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center py-4"
                  onPress={() => {
                    if (!isDragging) {
                      handleClose();
                    }
                  }}
                >
                  <Entypo name="pin" size={22} color="white" />
                  <Text className="ml-3 text-gray-200 text-lg font-semibold">
                    Pin Post
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            {postContent && (
              <TouchableOpacity
                className="flex-row items-center py-4"
                onPress={handleCopyTextPress}
              >
                <Ionicons name="copy" size={21} color="white" />
                <Text className="ml-3 text-gray-200 text-lg font-semibold">
                  Copy Text
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={handleDeletePress}
            >
              <Entypo name="trash" size={22} color="red" />
              <Text className="ml-3 text-red-500 text-lg font-semibold">
                {deleteText}
              </Text>
            </TouchableOpacity>
            
          </View>
        </Animated.View>
      </Pressable>
      <ConfirmationAlert
        visible={showDeleteConfirm}
        title={confirmationTitle}
        message={confirmationMessage}
        confirmText="Delete"
        cancelText="Cancel"
        confirmTextColor="#FF2C2C"
        icon="trash-outline"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
});

export default PostActionBottomSheet;