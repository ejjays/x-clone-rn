import type { Post, User, Reaction, ReactionName } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  type View as RNView,
  Pressable,
  Dimensions,
  Modal,
  StyleSheet,
  PanResponder,
  Animated,
} from "react-native";
import CommentIcon from "../assets/icons/Comment";
import ShareIcon from "../assets/icons/ShareIcon";
import { useRef, useState, useEffect, useCallback } from "react";
import PostReactionsPicker from "./PostReactionsPicker";
import * as Haptics from "expo-haptics";
import LikeIcon from "../assets/icons/LikeIcon";
import { Video, ResizeMode } from "expo-av";
import {
  reactionComponents,
  reactionTextColor,
  reactionLabels,
} from "@/utils/reactions";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const getDynamicPostTextStyle = (content: string): string => {
  if (content.length <= 60) {
    return "text-2xl font-semibold";
  } else if (content.length > 60 && content.length <= 150) {
    return "text-xl font-semibold";
  } else {
    return "text-lg font-normal";
  }
};

interface PostCardProps {
  post: Post;
  reactToPost: (args: { postId: string; reactionType: string | null }) => void;
  onDelete: (postId: string) => void;
  onComment: (postId: string) => void;
  currentUser: User;
  currentUserReaction: Reaction | null;
  onOpenPostMenu: (post: Post) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const DRAG_THRESHOLD = 50;
const SNAP_TO_CLOSE_THRESHOLD = screenHeight / 4; // Close if dragged more than 1/4 of the screen height

const AnimatedImage = Animated.createAnimatedComponent(Image);

const PostCard = ({
  currentUser,
  onDelete,
  reactToPost,
  post,
  onComment,
  currentUserReaction,
  onOpenPostMenu,
}: PostCardProps) => {
  const isOwnPost = post.user._id === currentUser._id;
  const likeButtonRef = useRef<RNView>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{
    pageX: number;
    pageY: number;
  } | null>(null);

  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const { isDarkMode, colors } = useTheme();
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [showModalContent, setShowModalContent] = useState(true); // New state for content visibility

  const imageTranslateY = useRef(new Animated.Value(0)).current; // Initialize centered
  const modalFadeAnim = useRef(new Animated.Value(0)).current; // Sole controller for overall modal opacity
  const contentOpacityAnim = useRef(new Animated.Value(1)).current; // New Animated.Value for content opacity

  const openImageModal = useCallback(() => {
    setIsImageModalVisible(true);
    Animated.timing(modalFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const closeImageModal = useCallback((direction: "up" | "down") => {
    const toValue = direction === "up" ? -screenHeight : screenHeight;
    Animated.parallel([
      Animated.timing(imageTranslateY, {
        toValue: toValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalFadeAnim, {
        // Animate overall modal opacity to 0
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsImageModalVisible(false);
      imageTranslateY.setValue(0); // Reset to initial off-screen position for next open
      modalFadeAnim.setValue(0); // Reset for next open
      contentOpacityAnim.setValue(1); // Reset content opacity to visible
      setShowModalContent(true); // Reset content visibility
    });
  }, []);

  const toggleModalContent = useCallback(() => {
    setShowModalContent((prev) => !prev);
    Animated.timing(contentOpacityAnim, {
      toValue: showModalContent ? 0 : 1, // Fade out if currently visible, fade in if hidden
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showModalContent]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        imageTranslateY.setValue(gestureState.dy);
        // Directly set modalFadeAnim based on drag distance for a cohesive feel
        const newOpacity =
          1 - Math.abs(gestureState.dy) / SNAP_TO_CLOSE_THRESHOLD;
        modalFadeAnim.setValue(Math.max(0, newOpacity));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > SNAP_TO_CLOSE_THRESHOLD) {
          const direction = gestureState.dy > 0 ? "down" : "up";
          closeImageModal(direction);
        } else {
          Animated.parallel([
            Animated.spring(imageTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 10,
            }),
            Animated.spring(modalFadeAnim, {
              // Spring back overall modal opacity to 1
              toValue: 1,
              useNativeDriver: true,
              bounciness: 10,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (post.image) {
      setIsMediaLoading(true);
      Image.getSize(
        post.image,
        (width, height) => {
          const calculatedHeight = Math.round((screenWidth / width) * height);
          setImageHeight(calculatedHeight);
          setIsMediaLoading(false);
        },
        (error) => {
          console.error(`Couldn't get image size for ${post.image}:`, error);
          setImageHeight(200);
          setIsMediaLoading(false);
        }
      );
    } else if (post.video) {
      setIsMediaLoading(true);
      setVideoHeight(Math.round(screenWidth * 0.5));
    } else {
      setImageHeight(null);
      setVideoHeight(null);
      setIsMediaLoading(false);
    }
  }, [post.image, post.video]);

  const handleVideoLoad = (playbackStatus: any) => {
    if (
      playbackStatus &&
      playbackStatus.isLoaded &&
      playbackStatus.naturalSize
    ) {
      const { width, height } = playbackStatus.naturalSize;
      const calculatedHeight = Math.round((screenWidth / width) * height);
      setVideoHeight(calculatedHeight);
    }
    setIsMediaLoading(false);
  };

  const handleVideoError = (error: any) => {
    console.error(`Video Error for post ${post._id} (${post.video}):`, error);
    setIsMediaLoading(false);
  };

  const handleQuickPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newReaction = currentUserReaction?.type === "like" ? null : "like";
    reactToPost({ postId: post._id, reactionType: newReaction });
  };

  const handleLongPress = () => {
    likeButtonRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
      setAnchorMeasurements({ pageX, pageY });
      setPickerVisible(true);
    });
  };

  const handleReactionSelect = (reactionType: ReactionName) => {
    reactToPost({ postId: post._id, reactionType });
    setPickerVisible(false);
  };

  const getTopThreeReactions = () => {
    if (!post.reactions || post.reactions.length === 0) {
      return [];
    }

    const reactionCounts = post.reactions.reduce(
      (acc, reaction) => {
        if (reaction && reaction.type) {
          acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        }
        return acc;
      },
      {} as Record<ReactionName, number>
    );

    return Object.entries(reactionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)
      .slice(0, 3);
  };

  const ReactionButton = () => {
    const reactionLabel = reactionLabels[currentUserReaction?.type] || "Like";

    let textColor;

    switch (currentUserReaction?.type) {
      case "like":
        textColor = "#1877F2";
        break;
      case "love":
        textColor = "#E4405F";
        break;
      case "sad":
      case "celebrate":
      case "haha":
      case "wow":
        textColor = "#FFD972";
        break;
      case "angry":
        textColor = "#FF6347";
        break;
      default:
        textColor = colors.textSecondary;
        break;
    }

    return (
      <View className="flex-row items-center">
        <LikeIcon userReaction={currentUserReaction?.type} size={22} />
        <Text
          className="font-semibold capitalize ml-2"
          style={{ color: textColor }}
        >
          {reactionLabel}
        </Text>
      </View>
    );
  };

  return (
    <>
      <View style={{ backgroundColor: colors.background }}>
        {/* Post Header */}
        <View className="flex-row px-2 py-3 items-center">
          <Image
            source={{ uri: post.user.profilePicture || "" }}
            className="w-14 h-14 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="font-bold text-lg" style={{ color: colors.text }}>
              {post.user.firstName} {post.user.lastName}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {formatDate(post.createdAt)}
            </Text>
          </View>
          {isOwnPost && (
            <TouchableOpacity
              onPress={() => onOpenPostMenu(post)}
              className="p-2"
            >
              <FontAwesome
                name="ellipsis-h"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Post Content */}
        {post.content && (
          <Text
            className={`my-3 px-2 ${
              !post.image && !post.video
                ? getDynamicPostTextStyle(post.content)
                : "text-lg font-normal"
            }`}
            style={{ color: colors.text }}
          >
            {post.content}
          </Text>
        )}
      </View>

      {/* Media Display */}
      {isMediaLoading && (post.image || post.video) && (
        <View
          style={{
            width: screenWidth,
            height: 200,
            backgroundColor: colors.surface,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.textMuted }}>Loading media...</Text>
        </View>
      )}

      {post.image && !isMediaLoading && imageHeight !== null && (
        <TouchableOpacity onPress={openImageModal}>
          <Image
            source={{ uri: post.image }}
            style={{ width: screenWidth, height: imageHeight }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {post.video && !isMediaLoading && videoHeight !== null && (
        <Video
          source={{ uri: post.video }}
          style={{ width: screenWidth, height: videoHeight }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onLoad={handleVideoLoad}
          onError={handleVideoError}
        />
      )}

      <View style={{ backgroundColor: colors.background }}>
        {/* Reactions and Comments Count */}
        {((post.reactions && post.reactions.length > 0) ||
          (post.comments && post.comments.length > 0)) && (
          <View className="flex-row justify-between items-center px-4 py-1">
            {post.reactions && post.reactions.length > 0 ? (
              <View className="flex-row items-center">
                <View className="flex-row">
                  {getTopThreeReactions().map((reaction) => {
                    const Emoji =
                      reactionComponents[
                        reaction as keyof typeof reactionComponents
                      ];
                    if (!Emoji) {
                      return null;
                    }
                    return <Emoji key={reaction} width={20} height={20} />;
                  })}
                </View>
                <Text
                  className="text-base ml-2"
                  style={{ color: colors.textSecondary }}
                >
                  {formatNumber(post.reactions.length)}
                </Text>
              </View>
            ) : (
              <View />
            )}

            {post.comments && post.comments.length > 0 && (
              <Text
                className="text-base"
                style={{ color: colors.textSecondary }}
              >
                {formatNumber(post.comments.length)}{" "}
                {post.comments.length === 1 ? "comment" : "comments"}
              </Text>
            )}
          </View>
        )}

        {/* Post Actions */}
        <View
          className="flex-row justify-around py-1 border-t"
          style={{ borderColor: colors.border, marginTop: 8 }}
        >
          <Pressable
            ref={likeButtonRef}
            onPress={handleQuickPress}
            onLongPress={handleLongPress}
            className="flex-1 items-center py-2.5"
          >
            <ReactionButton />
          </Pressable>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2.5"
            onPress={() => onComment(post._id)}
          >
            <CommentIcon size={22} color={colors.textSecondary} />
            <Text
              className="font-semibold ml-1.5"
              style={{ color: colors.textSecondary }}
            >
              Comment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2.5">
            <ShareIcon size={22} color={colors.textSecondary} />
            <Text
              className="font-semibold ml-1.5"
              style={{ color: colors.textSecondary }}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        anchorMeasurements={anchorMeasurements}
      />
      <Modal visible={isImageModalVisible} transparent={true}>
        <Animated.View
          style={[
            styles.modalContainer,
            { opacity: modalFadeAnim }, // Apply modalFadeAnim here
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() =>
              closeImageModal(imageTranslateY.__getValue() > 0 ? "down" : "up")
            }
          >
            <FontAwesome name="close" size={24} color="white" />
          </TouchableOpacity>
          <Pressable
            onPress={toggleModalContent}
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AnimatedImage
              source={{ uri: post.image }}
              style={[
                styles.fullscreenImage,
                { transform: [{ translateY: imageTranslateY }] },
              ]}
              resizeMode="contain"
              {...panResponder.panHandlers}
            />
          </Pressable>
          {/* New content for the modal */}
          <Animated.View
            style={[
              styles.modalContentContainer,
              { opacity: contentOpacityAnim },
            ]}
          >
            {/* User Info */}
            <View className="flex-row items-center mb-2">
              <Text className="font-bold text-base" style={{ color: "white" }}>
                {post.user.firstName} {post.user.lastName}
              </Text>
            </View>

            {/* Post Content */}
            {post.content && (
              <Text className="text-base mb-4" style={{ color: "white" }}>
                {post.content}
              </Text>
            )}

            {/* Reactions and Comments Count - within modal */}
            {((post.reactions && post.reactions.length > 0) ||
              (post.comments && post.comments.length > 0)) && (
              <View className="flex-row justify-between items-center px-0 py-1 mb-4">
                {post.reactions && post.reactions.length > 0 ? (
                  <View className="flex-row items-center">
                    <View className="flex-row">
                      {getTopThreeReactions().map((reaction) => {
                        const Emoji =
                          reactionComponents[
                            reaction as keyof typeof reactionComponents
                          ];
                        if (!Emoji) {
                          return null;
                        }
                        return <Emoji key={reaction} width={20} height={20} />;
                      })}
                    </View>
                    <Text
                      className="text-base ml-2"
                      style={{ color: "#CCCCCC" }}
                    >
                      {formatNumber(post.reactions.length)}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}

                {post.comments && post.comments.length > 0 && (
                  <Text className="text-base" style={{ color: "#CCCCCC" }}>
                    {formatNumber(post.comments.length)}{" "}
                    {post.comments.length === 1 ? "comment" : "comments"}
                  </Text>
                )}
              </View>
            )}

            {/* Post Actions (Re-using existing logic) */}
            <View className="flex-row justify-around py-1">
              <Pressable
                ref={likeButtonRef}
                onPress={handleQuickPress}
                onLongPress={handleLongPress}
                className="flex-1 items-center py-2.5"
              >
                <ReactionButton />
              </Pressable>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-2.5"
                onPress={() => onComment(post._id)}
              >
                <CommentIcon size={22} color={"white"} />
                <Text
                  className="font-semibold ml-1.5"
                  style={{ color: "white" }}
                >
                  Comment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2.5">
                <ShareIcon size={22} color={"white"} />
                <Text
                  className="font-semibold ml-1.5"
                  style={{ color: "white" }}
                >
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  modalContentContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
});

export default PostCard;
