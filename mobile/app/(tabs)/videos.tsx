import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { InteractionManager, StatusBar as RNStatusBar, Platform } from "react-native";
import { useIsFocused, useNavigation, useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Pressable, ActivityIndicator, Animated, RefreshControl, Alert, ToastAndroid, useWindowDimensions } from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  useSafeAreaInsets,
  type EdgeInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Ionicons, Entypo } from "@expo/vector-icons";
import * as SystemUI from "expo-system-ui";
import { VideoView, useVideoPlayer } from "expo-video";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
// Removed NavigationBar toggling to avoid jank on tab transitions

import CommentsBottomSheet from "@/components/CommentsBottomSheet";
import PostReactionsPicker, {
  postReactions,
} from "@/components/PostReactionsPicker";
import PostActionBottomSheet, {
  PostActionBottomSheetRef,
} from "@/components/PostActionBottomSheet";

import { usePosts } from "@/hooks/usePosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Post } from "@/types";
import { formatNumber } from "@/utils/formatters";
import { StatusBar } from "expo-status-bar";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as NavigationBar from "expo-navigation-bar";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme


/**
 * Safely attempt to read bottom tab bar height.
 * Returns 0 if this screen isn\'t inside a BottomTabNavigator.
 */
function useOptionalTabBarHeight() {
  try {
    return useBottomTabBarHeight();
  } catch {
    // No bottom tab bar in top-tabs setup; fallback to 0
    return 0;
  }
}

const VideoItem = ({
  item,
  isVisible,
  isScreenFocused,
  onCommentPress,
  insets,
  bottomSafeOffset,
  commentBarHeight,
  width,
  height,
}: {
  item: Post;
  isVisible: boolean;
  isScreenFocused: boolean;
  onCommentPress: () => void;
  insets: EdgeInsets;
  bottomSafeOffset: number;
  commentBarHeight: number;
  width: number;
  height: number;
}) => {
  const player = useVideoPlayer(item.video ? { uri: item.video } : undefined);
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<any>(null);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);  
  const [containerWidth, setContainerWidth] = useState<number>(width);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastTapRef = useRef<number>(0);
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const [videoOrientation, setVideoOrientation] = useState<
    "portrait" | "landscape" | null
  >(null);

  // Animation value for the heart icon bounce
  const heartScale = useRef(new Animated.Value(1)).current; // New animated value

  // Autoplay / pause
  useEffect(() => {
    if (!player) return;
    if (isVisible && isScreenFocused) {
      (player as any).play?.();
      (player as any).setIsMuted?.(isMuted);
      setIsPlaying(true);
    } else {
      (player as any).pause?.();
      (player as any).setIsMuted?.(true);
      if (!isVisible) (player as any).seekTo?.(0);
      setIsPlaying(false);
    }
  }, [isVisible, isScreenFocused, isMuted]);

  const onPlayPausePress = async () => {
    if (!player) return;
    if (isPlaying) (player as any).pause?.();
    else (player as any).play?.();
    setIsPlaying((p) => !p);
  };

  const onContainerPress = async () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // double-tap => like animation
      if (process.env.EXPO_PUBLIC_DEBUG_LOGS === "1") {
        console.log(
          `[VideoItem - ${item._id}] Double tap. Item reactions before reactToPost:`,
          item.reactions
        );
      }
      reactToPost({ postId: item._id, reactionType: "like" });
      Animated.sequence([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      await onPlayPausePress();
    }
    lastTapRef.current = now;
  };

  const toggleMute = async () => {
    const next = !isMuted;
    setIsMuted(next);
    if (!player) return;
    (player as any).setIsMuted?.(next);
  };


  const containerHeight = useMemo(() => {
    // Make each reel occupy the full viewport height to prevent the next
    // video from peeking at the bottom.
    return height;
  }, [height]);


  const dynamicResizeMode = useMemo(() => {
    if (item.videoFit === "full") return "cover" as const;
    if (item.videoFit === "original") return "contain" as const;
    if (!naturalWidth || !naturalHeight) return "contain" as const;

    const dimsSayLandscape = naturalWidth > naturalHeight;
    const isLandscape = videoOrientation
      ? videoOrientation === "landscape"
      : dimsSayLandscape;

    if (isLandscape) return "contain" as const;

    const hOverW = naturalHeight / naturalWidth;
    return hOverW >= 1.6 ? "cover" : "contain";
  }, [item.videoFit, naturalWidth, naturalHeight, videoOrientation]);

  // Track progress using the player's timeUpdate when available
  useEffect(() => {
    if (!player) return;
    const sub = (player as any).addListener?.("timeUpdate", ({ currentTime, duration }) => {
      if (duration) setProgress(currentTime / duration);
    });
    return () => sub?.remove?.();
  }, [player]);

  // Reaction picker
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

    // Trigger bounce animation for any reaction selection
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 0.8, // Scale down quickly
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1, // Spring back to original size
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // PostAction handlers
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
    await Clipboard.setStringAsync(text);

    if (Platform.OS === "android") {
      ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
    }

    postActionBottomSheetRef.current?.close();
  };

  const itemOuterHeight = height;
  const statusBarOverlayHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || insets.top) : insets.top;

  return (
    <View style={[styles.videoContainer, { width, height: itemOuterHeight + statusBarOverlayHeight }]}>
      <Pressable
        style={[styles.videoPressable, { height: height + statusBarOverlayHeight }]}
        onPress={onContainerPress}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {item.video && (
          <VideoView
            style={[StyleSheet.absoluteFillObject, { top: -statusBarOverlayHeight, left: 0, right: 0, bottom: 0, backgroundColor: 'black' }]}
            player={player}
            contentFit={dynamicResizeMode}
          />
        )}

        <Animated.View
          style={[styles.playIconContainer, { opacity: heartOpacity }]}
          pointerEvents="none"
        >
          <Ionicons name="heart" size={96} color="rgba(255,255,255,0.85)" />
        </Animated.View>
        {!isPlaying && isVisible && (
          <View style={styles.playIconContainer}>
            <Ionicons name="play" size={80} color="rgba(255,255,255,0.7)" />
          </View>
        )}
      </Pressable>

      {/* Remove previous black cover; rely on SystemUI transparent background and video fill */}

      <View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            paddingTop: 8,
            paddingLeft: insets.left + 15,
            paddingRight: insets.right + 15,
            paddingBottom: commentBarHeight,
          },
        ]}
      >
        {/* Left side: user info + caption */}
        <View style={styles.leftContainer}>
          <View style={styles.userInfo}>
            <Image
              source={
                item.user.profilePicture
                  ? { uri: item.user.profilePicture }
                  : require("../../assets/images/default-avatar.png")
              }
              style={styles.avatar}
            />
            <Text style={styles.username}>
              {item.user.firstName} {item.user.lastName}
            </Text>
          </View>
          <Text style={[styles.caption, { marginBottom: 10 }]} numberOfLines={2}>
            {item.content}
          </Text>
        </View>

        {/* Right side: actions */}
        <View style={[styles.rightContainer]}>
          <TouchableOpacity
            ref={likeButtonRef}
            onPress={() => {
              console.log(
                `[VideoItem - ${item._id}] Heart icon pressed. Triggering animation.`
              );
              reactToPost({
                postId: item._id,
                reactionType: currentReaction?.type === "like" ? null : "like",
              });
              // Trigger bounce animation on direct like/unlike
              Animated.sequence([
                Animated.timing(heartScale, {
                  toValue: 0.8, // Scale down quickly
                  duration: 100,
                  useNativeDriver: true,
                }),
                Animated.spring(heartScale, {
                  toValue: 1, // Spring back to original size
                  friction: 3,
                  tension: 40,
                  useNativeDriver: true,
                }),
              ]).start();
            }}
            onLongPress={handleLongPress}
            style={styles.iconContainer}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={
                  currentReaction?.type === "like"
                    ? "heart-sharp"
                    : "heart-outline"
                }
                size={30}
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
            onPress={onCommentPress}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={30}
              color="white"
              style={styles.iconShadow}
            />
            <Text style={styles.iconText}>
              {formatNumber(item.comments.length)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconContainer}>
            <Ionicons
              name="share-social-outline"
              size={30}
              color="white"
              style={styles.iconShadow}
            />
            <Text style={styles.iconText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconContainer} onPress={toggleMute}>
            <Ionicons
              name={isMuted ? "volume-mute-outline" : "volume-high-outline"}
              size={28}
              color="white"
              style={styles.iconShadow}
            />
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

      {/* Progress Bar */}
      <View
        pointerEvents="none"
        style={[
          styles.progressBackground,
          { bottom: commentBarHeight },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(progress * 100)}%` },
          ]}
        />
      </View>

      {/* Reaction Picker */}
      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        anchorMeasurements={anchorMeasurements}
      />

      {/* Post Actions */}
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
};

export default function VideosScreen() {
  const { posts, isLoading, error, refetch } = usePosts();
  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const [isRefetching, setIsRefetching] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const { colors, isDarkMode } = useTheme(); // Use useTheme hook

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        try {
          RNStatusBar.setTranslucent(true);
          RNStatusBar.setBackgroundColor('transparent');
        } catch {}
      }
      return () => {
        if (Platform.OS === 'android') {
          try {
            RNStatusBar.setTranslucent(false);
            RNStatusBar.setBackgroundColor('#000000');
          } catch {}
        }
      };
    }, [])
  );

  const tabBarHeight = useOptionalTabBarHeight();
  // This bottomSafeOffset is used for the FlatList content padding and VideoItem height adjustment.
  // For the CommentsBottomSheet, we will only pass the tabBarHeight to avoid double counting insets.bottom.
  const bottomSafeOffset = Math.max(0, insets.bottom) + tabBarHeight;

  const [commentBarHeight, setCommentBarHeight] = useState<number>(64);

  const videoPosts = useMemo(
    () => posts.filter((p) => p.video?.trim()),
    [posts]
  );

  const handleOpenComments = () => bottomSheetRef.current?.snapToIndex(0);
  const handleCloseComments = () => bottomSheetRef.current?.close();

  // Each item should be exactly the screen height for perfect paging
  const itemHeight = height;

  useEffect(() => {
    if (isFocused) {
      handleCloseComments();
    }
  }, [isFocused]);

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const onViewableItemsChanged = useCallback(
    ({ viewableItems: vItems }) => setViewableItems(vItems.map((vi) => vi.key)),
    []
  );

  useEffect(() => {
    if (!isFocused) setViewableItems([]);
  }, [isFocused]);

  // Effect to hide/show the system navigation bar on Android
  // Removed focus effect that toggles system nav bar; this was introducing delays

  const [ready, setReady] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(async () => {
        setReady(true);
        // Hide status bar for immersive experience
        try {
          RNStatusBar.setHidden(true);
          if (Platform.OS === 'android') {
            await SystemUI.setBackgroundColorAsync('transparent');
          }
        } catch {}
        // Hide Android system nav bar for reels only
        if (Platform.OS === "android") {
          try {
            await NavigationBar.setVisibilityAsync("hidden");
            await NavigationBar.setBehaviorAsync("overlay-swipe");
            await NavigationBar.setBackgroundColorAsync("transparent");
          } catch {}
        }
      });
      return () => {
        setReady(false);
        try {
          RNStatusBar.setHidden(false);
          if (Platform.OS === 'android') {
            await SystemUI.setBackgroundColorAsync('#000000');
          }
        } catch {}
        // Restore nav bar on leaving reels
        if (Platform.OS === "android") {
          try {
            NavigationBar.setVisibilityAsync("visible");
            NavigationBar.setBehaviorAsync("inset-swipe");
          } catch {}
        }
        task.cancel();
      };
    }, [])
  );

  const renderItem = useCallback(({ item }: { item: Post }) => (
    <VideoItem
      item={item}
      isVisible={viewableItems.includes(item._id)}
      isScreenFocused={isFocused}
      onCommentPress={handleOpenComments}
      insets={insets}
      bottomSafeOffset={bottomSafeOffset}
      commentBarHeight={commentBarHeight}
      width={width}
      height={height}
    />
  ), [viewableItems, isFocused, insets, bottomSafeOffset, commentBarHeight, width, height]);


  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.infoText}>Loading videos...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.infoText}>Could not load videos.</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={[styles.infoText, { color: "#1877F2" }]}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (videoPosts.length === 0) {
    return (
      <View style={styles.centered}>
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, flexDirection: "row", paddingHorizontal: 16 },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("index")}
            style={{ marginRight: 8 }}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color="white"
              style={styles.iconShadow}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reels</Text>
        </View>
        <Ionicons name="videocam-off-outline" size={64} color="#9CA3AF" />
        <Text style={styles.infoText}>No videos have been posted yet.</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, flexDirection: "row", paddingHorizontal: 16 },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("index")}
          style={{ marginRight: 0 }}
          delayPressIn={0}
          activeOpacity={1}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="white"
            style={styles.iconShadow}
            className="mr-2"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reels</Text>
      </View>

      {ready && (
      <FlatList
        key={`${commentBarHeight}-${width}`}
        data={videoPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, i) => ({
          length: itemHeight,
          offset: itemHeight * i,
          index: i,
        })}
        decelerationRate={0.985}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={11}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 0 }}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        disableIntervalMomentum
        removeClippedSubviews
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            colors={[colors.refreshControlColor]}
            tintColor={colors.refreshControlColor}
            progressBackgroundColor={colors.refreshControlBackgroundColor}
          />
        }
      />)}

      {/* Comment input placeholder */}
      <View
        onLayout={(e) => setCommentBarHeight(e.nativeEvent.layout.height)}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: bottomSafeOffset,
          backgroundColor: colors.background,
          zIndex: 20,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleOpenComments}
          style={{
            margin: 12,
            backgroundColor: colors.surface,
            borderRadius: 24,
            paddingVertical: 10,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            Add a comment...
          </Text>
        </TouchableOpacity>
      </View>

      <CommentsBottomSheet
        bottomSheetRef={bottomSheetRef}
        onClose={handleCloseComments}
        bottomOffset={tabBarHeight} // Pass only tabBarHeight
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "black", // Keep black for now as videos are full screen
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: { color: "white", fontSize: 16, marginTop: 10 },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
    backgroundColor: "transparent", // Keep transparent for video overlay
    alignItems: "center",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "white" },
  videoContainer: {
    backgroundColor: "black",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  videoPressable: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 5,
    alignItems: "flex-end",
  },
  leftContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingLeft: 0,
    paddingRight: 10,
  },
  rightContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
    marginRight: 10,
  },
  username: { color: "white", fontWeight: "bold", fontSize: 16 },
  caption: {
    color: "white",
    fontSize: 14,
  },
  iconContainer: { alignItems: "center", marginBottom: 5 },
  iconText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  iconShadow: {
    textShadowColor: "black",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  progressBackground: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
});
