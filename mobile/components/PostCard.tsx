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
import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import PostReactionsPicker from "./PostReactionsPicker";
import * as Haptics from "expo-haptics";
import LikeIcon from "../assets/icons/LikeIcon";
import { Video } from "expo-video";
import { getPlayableVideoUrl } from "@/utils/media";
import {
  reactionComponents,
  reactionTextColor,
  reactionLabels,
} from "@/utils/reactions";
import { FontAwesome, AntDesign, Fontisto } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import VerifiedBadge from "@/components/VerifiedBadge";
import * as Clipboard from 'expo-clipboard';
import { sharePost } from "@/utils/share";

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
  onReactionPickerVisibilityChange?: (isVisible: boolean) => void;
  edgeToEdgeMedia?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const DRAG_THRESHOLD = 50;
const SNAP_TO_CLOSE_THRESHOLD = screenHeight / 4; 

const AnimatedImage = Animated.createAnimatedComponent(Image);

const PostCard = ({
  currentUser,
  onDelete,
  reactToPost,
  post,
  onComment,
  currentUserReaction,
  onOpenPostMenu,
  onReactionPickerVisibilityChange,
  edgeToEdgeMedia,
}: PostCardProps) => {
  const isOwnPost = post.user._id === currentUser._id;
  const likeButtonRef = useRef<RNView>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<{
    pageX: number;
    pageY: number;
  } | null>(null);

  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const { isDarkMode, colors } = useTheme();
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false); 

  const imageTranslateY = useRef(new Animated.Value(0)).current; 
  const modalFadeAnim = useRef(new Animated.Value(0)).current; 
  const contentOpacityAnim = useRef(new Animated.Value(0)).current; 

  const openImageModal = useCallback(() => {
    setIsImageModalVisible(true);
    setShowModalContent(true); 
    imageTranslateY.setValue(50);
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(imageTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 10,
      }),
      Animated.timing(contentOpacityAnim, {
        toValue: 1, 
        duration: 300,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
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
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsImageModalVisible(false);
      imageTranslateY.setValue(0); 
      modalFadeAnim.setValue(0); 
      contentOpacityAnim.setValue(0); 
      setShowModalContent(true); 
    });
  }, []);

  const toggleModalContent = useCallback(() => {
    setShowModalContent((prev) => {
      const newShowModalContent = !prev;
      Animated.timing(contentOpacityAnim, {
        toValue: newShowModalContent ? 1 : 0, 
        duration: 200,
        useNativeDriver: true,
      }).start();
      return newShowModalContent;
    });
  }, [contentOpacityAnim]); 

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        imageTranslateY.setValue(gestureState.dy);
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
      setImageHeight(null);
      setImageAspectRatio(null);
    } else if (post.video) {
      setIsMediaLoading(true);
      setVideoHeight(Math.round((screenWidth * 9) / 16));
      setVideoAspectRatio(16 / 9);
    } else {
      setImageHeight(null);
      setVideoHeight(null);
      setVideoAspectRatio(null);
      setIsMediaLoading(false);
    }
  }, [post.image, post.video]);

  useEffect(() => {
    if (onReactionPickerVisibilityChange) {
      onReactionPickerVisibilityChange(pickerVisible);
    }
  }, [pickerVisible, onReactionPickerVisibilityChange]);

  const handleVideoLoad = (playbackStatus: any) => {
    if (
      playbackStatus &&
      playbackStatus.isLoaded &&
      playbackStatus.naturalSize
    ) {
      const { width, height, orientation } = playbackStatus.naturalSize as {
        width: number;
        height: number;
        orientation?: "portrait" | "landscape" | undefined;
      };

      const displayedWidth =
        orientation === "portrait" && width > height ? height : width;
      const displayedHeight =
        orientation === "portrait" && width > height ? width : height;

      const calculatedHeight = Math.round(
        (screenWidth / displayedWidth) * displayedHeight
      );
      setVideoHeight(calculatedHeight);
      if (displayedWidth > 0 && displayedHeight > 0) {
        setVideoAspectRatio(displayedWidth / displayedHeight);
      }
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
    // Use window-relative measurement for reliability across platforms
    likeButtonRef.current?.measureInWindow((x, y, width, _height) => {
      const hasValidCoords = typeof x === "number" && typeof y === "number";
      const anchorX = hasValidCoords ? x + (width || 0) / 2 : screenWidth / 2;
      const anchorY = hasValidCoords ? y : screenHeight / 2;
      setAnchorMeasurements({ pageX: anchorX, pageY: anchorY });
      requestAnimationFrame(() => setPickerVisible(true));
    });
  };

  const handleCopyPostContent = () => {
    if (post.content) {
      Clipboard.setStringAsync(post.content);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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

  const contentTextClass =
    !post.image && !post.video
      ? getDynamicPostTextStyle(post.content)
      : "text-lg font-normal";
  const postContentFontFamily = contentTextClass.includes("font-semibold")
    ? "Poppins_600SemiBold"
    : "Poppins_400Regular";

  return (
    <>
      <View style={{ backgroundColor: colors.background }}>
        {/* Post Header */}
        <View className="flex-row px-2 py-3 items-center">
          <Image
            source={
              post.user.profilePicture
                ? { uri: post.user.profilePicture }
                : require("../assets/images/default-avatar.png")
            }
            className="w-14 h-14 rounded-full mr-3"
          />
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="font-bold text-lg" style={{ color: colors.text }}>
                {post.user.firstName} {post.user.lastName}
              </Text>
              {post.user.isVerified ? (
                <VerifiedBadge style={{ marginLeft: 6 }} size={16} />
              ) : null}
            </View>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {formatDate(post.createdAt)}
            </Text>
          </View>
          {/* Show menu if user owns the post OR user is admin */}
          {(isOwnPost || currentUser.isAdmin) && (
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
            style={{ color: colors.text, fontFamily: postContentFontFamily }}
            onLongPress={handleCopyPostContent} // Added onLongPress here
          >
            {post.content}
          </Text>
        )}
      </View>

      {/* Media Display */}
      {post.image && (
        <TouchableOpacity onPress={openImageModal} activeOpacity={1}>
          <Image
            source={{ uri: post.image }}
            style={{ width: screenWidth, height: undefined as unknown as number, aspectRatio: imageAspectRatio ?? 4/3 }}
            resizeMode="cover"
            onLoad={(e: any) => {
              try {
                const w = e?.nativeEvent?.source?.width;
                const h = e?.nativeEvent?.source?.height;
                if (w && h) {
                  setImageAspectRatio(w / h);
                }
              } finally {
                setIsMediaLoading(false);
              }
            }}
            onError={() => {
              setImageAspectRatio(4 / 3);
              setIsMediaLoading(false);
            }}
          />
        </TouchableOpacity>
      )}
      {post.video && (videoHeight !== null || videoAspectRatio !== null) && (
        <Video
          source={{ uri: getPlayableVideoUrl(post.video) }}
          style={
            edgeToEdgeMedia
              ? {
                  width: screenWidth,
                  height: videoAspectRatio
                    ? Math.round(screenWidth / videoAspectRatio)
                    : (videoHeight as number),
                }
              : { width: screenWidth, height: videoHeight as number }
          }
          useNativeControls
          resizeMode={"contain"}
          isLooping
          shouldPlay={false}
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
          <View ref={likeButtonRef} collapsable={false} style={{ flex: 1 }}>
            <Pressable
              onPress={handleQuickPress}
              onLongPress={handleLongPress}
              delayLongPress={150}
              className="items-center py-2.5"
            >
              <ReactionButton />
            </Pressable>
          </View>

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

          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2.5" onPress={() => sharePost(post)}>
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
            { opacity: modalFadeAnim }, 
          ]}
        >
          {/* Close button - OUTSIDE of content opacity animation */}
          <Animated.View 
            style={[
              { 
                position: "absolute",
                top: 40,
                left: 10, /* Changed from right to left */
                zIndex: 1000, // Higher z-index
                opacity: contentOpacityAnim 
              }
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                closeImageModal(
                  imageTranslateY.__getValue() > 0 ? "down" : "up"
                )
              }
              style={{
                backgroundColor: "rgba(0,0,0,0.5)", // Add background for better visibility
                borderRadius: 20,
                padding: 8,
              }}
            >
              <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>

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
            
            {/* Content with ONLY opacity animation control */}
            <Animated.View
              style={[
                styles.modalContentContainer,
                { opacity: contentOpacityAnim }, // Only controlled by animation now
              ]}
            >
              {/* User Info and Content */}
              <View className="flex-row items-center mb-3">
                <Image
                  source={
                    post.user.profilePicture
                      ? { uri: post.user.profilePicture }
                      : require("../assets/images/default-avatar.png")
                  }
                  className="w-10 h-10 rounded-full mr-2"
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {post.user.firstName} {post.user.lastName}
                </Text>
                {post.user.isVerified ? (
                  <VerifiedBadge style={{ marginLeft: 6 }} size={14} />
                ) : null}
              </View>
              
              {post.content && (
                <Text
                  style={{ color: "white", fontSize: 16, marginBottom: 15 }}
                >
                  {post.content}
                </Text>
              )}

              {/* Reactions and Comments Count (Modal) */}
              {((post.reactions && post.reactions.length > 0) ||
                (post.comments && post.comments.length > 0)) && (
                <View className="flex-row justify-between items-center py-1">
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
                          return (
                            <Emoji key={reaction} width={20} height={20} />
                          );
                        })}
                      </View>
                      <Text
                        className="text-base ml-2"
                        style={{ color: "white" }}
                      >
                        {formatNumber(post.reactions.length)}
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}

                  {post.comments && post.comments.length > 0 && (
                    <Text className="text-base" style={{ color: "white" }}>
                      {formatNumber(post.comments.length)}{" "}
                      {post.comments.length === 1 ? "comment" : "comments"}
                    </Text>
                  )}
                </View>
              )}

              {/* Post Actions (Modal) */}
              <View
                className="flex-row justify-around pt-3 mt-3"
                style={{
                  borderTopColor: "rgba(255,255,255,0.2)",
                  borderTopWidth: 1,
                }}
              >
                <View ref={likeButtonRef} collapsable={false} style={{ flex: 1 }}>
                  <Pressable
                    onPress={handleQuickPress}
                    onLongPress={handleLongPress}
                    delayLongPress={150}
                    className="items-center py-2.5"
                  >
                    <ReactionButton />
                  </Pressable>
                </View>

                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-2.5"
                  onPress={() => onComment(post._id)}
                >
                  <CommentIcon size={22} color="white" />
                  <Text
                    className="font-semibold ml-1.5"
                    style={{ color: "white" }}
                  >
                    Comment
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2.5" onPress={() => sharePost(post)}>
                  <ShareIcon size={22} color="white" />
                  <Text
                    className="font-semibold ml-1.5"
                    style={{ color: "white" }}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
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
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  modalContentContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
});

export default memo(PostCard);
