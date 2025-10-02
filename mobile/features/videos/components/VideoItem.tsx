import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
  ActivityIndicator,
  Pressable,
  ToastAndroid,
} from "react-native";
import { Ionicons, Entypo, FontAwesome5, Feather, Octicons } from "@expo/vector-icons";
import { sharePost } from "@/utils/share";
import Video from "react-native-video";
import { getPlayableVideoUrl } from "@/utils/media";
import * as Haptics from "expo-haptics";

import { usePosts } from "@/hooks/usePosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Post } from "@/types";
import { formatNumber } from "@/utils/formatters";
import PostActionBottomSheet, {
  PostActionBottomSheetRef,
} from "@/components/PostActionBottomSheet";
import PostReactionsPicker from "@/components/PostReactionsPicker";
import { videoItemStyles as styles } from "@/features/videos/styles";
import VerifiedBadge from "@/components/VerifiedBadge";
import ShareIcon from "@/assets/icons/ShareIcon";
import { setStringAsync } from 'expo-clipboard';

import type { EdgeInsets } from "react-native-safe-area-context";

type VideoItemProps = {
  item: Post;
  isVisible: boolean;
  isScreenFocused: boolean;
  insets: EdgeInsets;
  bottomSafeOffset: number;
  width: number;
  height: number;
};

export default function VideoItem({
  item,
  isVisible,
  isScreenFocused,
  insets,
  bottomSafeOffset,
  width,
  height,
}: VideoItemProps) {
  const videoRef = useRef<Video | null>(null);
  const likeButtonRef = useRef<TouchableOpacity>(null);
  const postActionBottomSheetRef = useRef<PostActionBottomSheetRef>(null);
  const { currentUser } = useCurrentUser();
  const { deletePost, reactToPost, getCurrentUserReaction } = usePosts();

  const currentReaction = useMemo(() => {
    const reaction = getCurrentUserReaction(item.reactions, currentUser);
    if (process.env.EXPO_PUBLIC_DEBUG_LOGS === "1") {
      console.log(`[VideoItem - ${item._id}] Current Reaction:`, reaction);
      console.log(`[VideoItem - ${item._id}] Item Reactions:`, item.reactions);
    }
    return reaction;
  }, [item.reactions, currentUser, item._id]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const lastTapRef = useRef<number>(0);

  const heartScale = useRef(new Animated.Value(1)).current;
  const playIconScale = useRef(new Animated.Value(0)).current; // Initial scale for play icon
  const [isLoaded, setIsLoaded] = useState(false);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(width);
  const indicatorOpacity = useRef(new Animated.Value(0)).current; // Initial opacity for play icon

  useEffect(() => {
    if (!isVisible && videoRef.current) {
      try {
        (videoRef.current as any).seek(0);
      } catch {}
    }
  }, [isVisible]);

  const toggleMute = async () => {
    const next = !isMuted;
    setIsMuted(next);
    // Removed player check as it's not defined
  };

  const containerHeight = useMemo(() => {
    // Height is already passed excluding the comment bar area
    return Math.max(0, height);
  }, [height]);

  const dynamicResizeMode = useMemo(() => {
    // Respect post preference: 'full' => cover, 'original' => contain; default to cover
    return item.videoFit === "original"
      ? ("contain" as const)
      : ("cover" as const);
  }, [item.videoFit]);

  const handleLongPress = () => {
    likeButtonRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      setAnchorMeasurements({ pageX, pageY });
      setPickerVisible(true);
    });
  };

  const handleReactionSelect = (reaction: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reactToPost({
      postId: item._id,
      reactionType: reaction ? reaction.type : null,
    });
    setPickerVisible(false);

    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isOwnPost = currentUser?._id === item.user._id;
  const isAdmin = currentUser?.isAdmin || false;

  const handlePostActionsPress = () => {
    postActionBottomSheetRef.current?.open();
  };

  const handleDeletePost = () => {
    deletePost(item._id);
    postActionBottomSheetRef.current?.close();
  };

  const handleCopyText = async (text: string) => {
    await setStringAsync(text);
    if (Platform.OS === "android") {
      ToastAndroid.show(
        "Copied to clipboard",
        ToastAndroid.SHORT
      );
    }
    postActionBottomSheetRef.current?.close();
  };

  const animatePlayIcon = (toValue: number, callback?: () => void) => {
    Animated.parallel([
      Animated.timing(indicatorOpacity, {
        toValue: toValue,
        duration: 20,
        useNativeDriver: true,
      }),
      Animated.spring(playIconScale, {
        toValue: toValue === 1 ? 1.09 : 0, // Bounce up when showing, shrink when hiding
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (toValue === 0) {
        playIconScale.setValue(0); // Reset scale after hiding
      }
      callback?.();
    });
  };

  useEffect(() => {
    if (isUserPaused) {
      animatePlayIcon(1); // Show play icon with animation
    } else {
      animatePlayIcon(0); // Hide play icon with animation
    }
  }, [isUserPaused]);

  return (
    <View
      style={[
        styles.videoContainer,
        { width, height, backgroundColor: "black" },
      ]}
    >
      <View style={[styles.videoWrapper, { height: containerHeight }]}>
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { justifyContent: "center", alignItems: "center" },
          ]}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {item.video && (
            <>
              {item.videoFit === "original" && !isLoaded && (
                <ActivityIndicator size="small" color="#fff" />
              )}
              <Video
                ref={(r) => (videoRef.current = r)}
                source={{ uri: getPlayableVideoUrl(item.video) }}
                style={
                  item.videoFit === "original"
                    ? {
                        width: containerWidth,
                        aspectRatio:
                          naturalWidth && naturalHeight
                            ? naturalWidth / naturalHeight
                            : 9 / 16,
                        opacity: isLoaded ? 1 : 0,
                      }
                    : StyleSheet.absoluteFillObject
                }
                controls={false}
                resizeMode={dynamicResizeMode}
                repeat
                muted={isMuted}
                paused={!isVisible || !isScreenFocused || isUserPaused}
                onLoad={(data: any) => {
                  try {
                    const ns = data?.naturalSize;
                    if (ns?.width && ns?.height) {
                      setNaturalWidth(Number(ns.width));
                      setNaturalHeight(Number(ns.height));
                    }
                    setIsLoaded(true);
                  } catch {
                    setIsLoaded(true);
                  }
                }}
              />
              {/* Tap anywhere on the video to toggle play/pause */}
              <Pressable
                style={StyleSheet.absoluteFillObject}
                onPress={() => {
                  setIsUserPaused((prev) => !prev);
                }}
              />
              {/* Center indicator icon */}
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: indicatorOpacity,
                  transform: [{ scale: playIconScale }],
                }}
              >
                {isUserPaused ? (
                  <FontAwesome5 name="play" size={50} color="#FFFFFF" />
                ) : null}
              </Animated.View>
            </>
          )}
        </View>

        <View
          pointerEvents="box-none"
          style={[
            styles.overlay,
            {
              position: "absolute",
              top: 10,
              left: insets.left + 15,
              right: insets.right + 15,
              bottom: Math.max(0, insets.bottom),
              // paddingTop: 10,
              // paddingLeft: insets.left + 15,
              // paddingRight: insets.right + 15,
              // paddingBottom: item.videoFit === 'cover' ? commentBarHeight + Math.max(0, insets.bottom) + insets.top : commentBarHeight + Math.max(0, insets.bottom),
            },
          ]}
        >
          <View style={styles.leftContainer}>
            <View style={styles.userInfo}>
              <Image
                source={
                  item.user.profilePicture
                    ? { uri: item.user.profilePicture }
                    : require("../../../assets/images/default-avatar.png")
                }
                style={styles.avatar}
              />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.username}>
                  {item.user.firstName} {item.user.lastName}
                </Text>
                {item.user.isVerified ? (
                  <VerifiedBadge style={{ marginLeft: 6 }} size={14} />
                ) : null}
              </View>
            </View>
            <Text
              style={[styles.caption, { marginBottom: 10 }]}
              numberOfLines={2}
            >
              {item.content}
            </Text>
          </View>

          <View style={[styles.rightContainer]}>
            <TouchableOpacity
              ref={likeButtonRef}
              onPress={() => {
                reactToPost({
                  postId: item._id,
                  reactionType:
                    currentReaction?.type === "like" ? null : "like",
                });
                Animated.sequence([
                  Animated.timing(heartScale, {
                    toValue: 0.8,
                    duration: 50,
                    useNativeDriver: true,
                  }),
                  Animated.spring(heartScale, {
                    toValue: 1,
                    friction: 3,
                    tension: 100,
                    useNativeDriver: true,
                  }),
                ]).start();
              }}
              onLongPress={handleLongPress}
              style={styles.iconContainer}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Octicons
                  name={currentReaction?.type === "like" ? "heart-fill" : "heart"}
                  size={28}
                  color={currentReaction?.type === "like" ? "red" : "white"}
                  style={styles.iconShadow}
                />
              </Animated.View>
              <Text style={styles.iconText}>
                {formatNumber(item.reactions.length)}
              </Text>
            </TouchableOpacity>



            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => sharePost(item)}
            >
              <ShareIcon width={30} height={30} color="white" strokeWidth="0.6" />
              <Text style={styles.iconText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer} onPress={toggleMute}>
              {isMuted ? (
                <Feather
                  name="volume-x"
                  size={30} // Increased size to 30
                  color="white"
                  style={styles.iconShadow}
                />
              ) : (
                <Ionicons
                  name="volume-medium-outline"
                  size={30} // Increased size to 30
                  color="white"
                  style={styles.iconShadow}
                />
              )}
              <Text style={styles.iconText}>{isMuted ? "Mute" : "Sound"}</Text>
            </TouchableOpacity>

            {(isOwnPost || isAdmin) && (
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={handlePostActionsPress}
              >
                <Entypo
                  name="dots-three-horizontal"
                  size={28}
                  color="white"
                  style={styles.iconShadow}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        anchorMeasurements={anchorMeasurements}
      />

      <PostActionBottomSheet
        ref={postActionBottomSheetRef}
        onClose={() => postActionBottomSheetRef.current?.close()}
        onDelete={handleDeletePost}
        onCopyText={handleCopyText}
        postContent={item.content}
        isOwnPost={isOwnPost}
        isAdmin={isAdmin}
        postOwnerName={`${item.user.firstName} ${item.user.lastName}`}
      />
    </View>
  );
}
