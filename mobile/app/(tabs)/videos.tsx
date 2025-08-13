import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Pressable,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import {
  useSafeAreaInsets,
  type EdgeInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import BottomSheet from "@gorhom/bottom-sheet";
import CommentsBottomSheet from "@/components/CommentsBottomSheet";
import PostReactionsPicker, {
  postReactions,
} from "@/components/PostReactionsPicker";
import * as Haptics from "expo-haptics";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { formatNumber } from "@/utils/formatters";
import { StatusBar } from "expo-status-bar";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const { height, width } = Dimensions.get("window");

/**
 * Safely attempt to read bottom tab bar height.
 * Returns 0 if this screen isn't inside a BottomTabNavigator.
 */
function useOptionalTabBarHeight() {
  try {
    return useBottomTabBarHeight();
  } catch {
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
}: {
  item: Post;
  isVisible: boolean;
  isScreenFocused: boolean;
  onCommentPress: () => void;
  insets: EdgeInsets;
  bottomSafeOffset: number;
}) => {
  const videoRef = useRef<Video>(null);
  const likeButtonRef = useRef<TouchableOpacity>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<any>(null);
  const [selectedReaction, setSelectedReaction] = useState<any>(null);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(width);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastTapRef = useRef<number>(0);
  const heartOpacity = useRef(new Animated.Value(0)).current;

  // Autoplay / pause based on visibility + screen focus
  useEffect(() => {
    if (!videoRef.current) return;
    async function sync() {
      if (isVisible && isScreenFocused) {
        await videoRef.current.setStatusAsync({ isMuted, shouldPlay: true });
        await videoRef.current.playAsync();
        setIsPlaying(true);
      } else {
        await videoRef.current.setStatusAsync({
          shouldPlay: false,
          isMuted: true,
        });
        await videoRef.current.pauseAsync();
        if (!isVisible) {
          await videoRef.current.setStatusAsync({ positionMillis: 0 });
        }
        setIsPlaying(false);
      }
    }
    sync();
  }, [isVisible, isScreenFocused, isMuted]);

  const onPlayPausePress = async () => {
    if (!videoRef.current) return;
    if (isPlaying) await videoRef.current.pauseAsync();
    else await videoRef.current.playAsync();
    setIsPlaying((p) => !p);
  };

  const onContainerPress = async () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // double-tap => like
      setSelectedReaction(postReactions.find((r) => r.type === "like") || null);
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
    await videoRef.current?.setStatusAsync({ isMuted: next });
  };

  const computedHeight = useMemo(() => {
    if (!naturalWidth || !naturalHeight) return height;
    const aspect = naturalWidth / naturalHeight;
    return Math.min(height, containerWidth / aspect);
  }, [naturalWidth, naturalHeight, containerWidth]);

  const handleLongPress = () => {
    likeButtonRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      setAnchorMeasurements({ pageX, pageY });
      setPickerVisible(true);
    });
  };

  const handleReactionSelect = (reaction: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReaction(reaction);
    setPickerVisible(false);
  };

  return (
    <View
      style={[styles.videoContainer, { height: height - bottomSafeOffset }]}
    >
      <Pressable
        style={styles.videoPressable}
        onPress={onContainerPress}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Video
          ref={videoRef}
          style={StyleSheet.absoluteFillObject}
          source={{ uri: item.video! }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={false}
          onLoad={(status) => {
            if (status.naturalSize?.width && status.naturalSize?.height) {
              setNaturalWidth(status.naturalSize.width);
              setNaturalHeight(status.naturalSize.height);
            }
          }}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.durationMillis) {
              setProgress(
                Math.min(1, status.positionMillis / status.durationMillis)
              );
            }
          }}
        />
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

      <View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            paddingLeft: insets.left + 15,
            paddingRight: insets.right + 15,
            paddingBottom: bottomSafeOffset + 70,
          },
        ]}
      >
        <View style={styles.leftContainer}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: item.user.profilePicture }}
              style={styles.avatar}
            />
            <Text style={styles.username}>
              {item.user.firstName} {item.user.lastName}
            </Text>
          </View>
          <Text style={styles.caption} numberOfLines={2}>
            {item.content}
          </Text>
        </View>

        <View
          style={[
            styles.rightContainer,
            {
              paddingBottom: bottomSafeOffset + 80,
              justifyContent: "flex-end",
            },
          ]}
        >
          <TouchableOpacity
            ref={likeButtonRef}
            onPress={() =>
              handleReactionSelect(
                selectedReaction
                  ? null
                  : postReactions.find((r) => r.type === "like")
              )
            }
            onLongPress={handleLongPress}
            style={styles.iconContainer}
          >
            <Ionicons
              name={selectedReaction ? "heart" : "heart-outline"}
              size={30}
              color="white"
              style={{
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 3,
              }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 12,
                marginTop: 5,
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 7,
              }}
            >
              {formatNumber(item.reactions.length)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onCommentPress}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={30}
              color="white"
              style={{
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 3,
              }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 12,
                marginTop: 5,
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 7,
              }}
            >
              {formatNumber(item.comments.length)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onCommentPress}
          >
            <Ionicons
              name="share-social"
              size={30}
              color="white"
              style={{
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 3,
              }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 12,
                marginTop: 5,
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 7,
              }}
            >
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconContainer} onPress={toggleMute}>
            <Ionicons
              name={isMuted ? "volume-mute" : "volume-high"}
              size={28}
              color="white"
              style={{
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 3,
              }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 12,
                marginTop: 5,
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 7,
              }}
            >
              {isMuted ? "Mute" : "Sound"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mock comment input at bottom */}
        <View
          style={{
            position: "absolute",
            left: insets.left + 12,
            right: insets.right + 12,
            bottom: bottomSafeOffset + 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCommentPress}
            style={styles.commentMockInput}
          >
            <Text style={styles.commentMockPlaceholder}>Add a comment...</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: bottomSafeOffset + 8,
          height: 3,
          backgroundColor: "rgba(255,255,255,0.25)",
          borderRadius: 2,
        }}
      >
        <View
          style={{
            width: `${Math.round(progress * 100)}%`,
            height: "100%",
            backgroundColor: "#fff",
            borderRadius: 2,
          }}
        />
      </View>

      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        anchorMeasurements={anchorMeasurements}
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

  const tabBarHeight = useOptionalTabBarHeight();
  const bottomSafeOffset = Math.max(0, insets.bottom) + tabBarHeight;
  const marginTop = -insets.top - 80;

  const videoPosts = useMemo(
    () => posts.filter((p) => p.video && p.video.trim() !== ""),
    [posts]
  );

  const handleOpenComments = () => bottomSheetRef.current?.snapToIndex(0);
  const handleCloseComments = () => bottomSheetRef.current?.close();

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const onViewableItemsChanged = useCallback(
    ({
      viewableItems: vItems,
    }: {
      viewableItems: Array<{ item: Post; key: string }>;
    }) => {
      setViewableItems(vItems.map((vi) => vi.key));
    },
    []
  );

  useEffect(() => {
    if (!isFocused) setViewableItems([]);
  }, [isFocused]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <VideoItem
        item={item}
        isVisible={viewableItems.includes(item._id)}
        isScreenFocused={isFocused}
        onCommentPress={handleOpenComments}
        insets={insets}
        bottomSafeOffset={bottomSafeOffset}
      />
    ),
    [viewableItems, insets, isFocused, bottomSafeOffset]
  );

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
      <SafeAreaView style={styles.centered}>
        <View style={[styles.header, { paddingTop: 10 }]}>
          <Text
            style={[
              styles.headerTitle,
              {
                textShadowColor: "black",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 7,
              },
            ]}
          >
            Reels
          </Text>
        </View>
        <Ionicons name="videocam-off-outline" size={64} color="#9CA3AF" />
        <Text style={styles.infoText}>No videos have been posted yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: 10 }]}>
        <Text
          style={[
            styles.headerTitle,
            {
              textShadowColor: "black",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 7,
            },
          ]}
        >
          Reels
        </Text>
      </View>
      <FlatList
        data={videoPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, i) => {
          const itemHeight = height - bottomSafeOffset;
          return {
            length: itemHeight,
            offset: itemHeight * i,
            index: i,
          };
        }}
        decelerationRate="fast"
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        style={{ marginTop }}
        contentContainerStyle={{ paddingBottom: bottomSafeOffset }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            colors={["#1877F2"]}
            tintColor="#1877F2"
            progressBackgroundColor="black"
          />
        }
      />
      <CommentsBottomSheet
        bottomSheetRef={bottomSheetRef}
        onClose={handleCloseComments}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: "black" },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "white" },
  centered: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: { color: "white", fontSize: 16, marginTop: 10 },
  videoContainer: {
    width,
    height,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPressable: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  video: { width, height },
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
  },
  leftContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 15,
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
  caption: { color: "white", fontSize: 14, marginRight: 70 },
  iconContainer: { alignItems: "center", marginBottom: 25 },
  iconText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
    textShadowColor: "black",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  commentMockInput: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  commentMockPlaceholder: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
  },
});
