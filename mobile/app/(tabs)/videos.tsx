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
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CommentsBottomSheet from "@/components/CommentsBottomSheet";
import PostReactionsPicker from "@/components/PostReactionsPicker";
import * as Haptics from "expo-haptics";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { formatNumber } from "@/utils/formatters";
import { StatusBar } from "expo-status-bar";
import ReelsList, { type VideoItemType } from "react-native-reels-list";
import BottomSheet from "@gorhom/bottom-sheet";

const { height } = Dimensions.get("window");

export default function VideosScreen() {
  const { posts, isLoading, error, refetch } = usePosts();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState<any>(null);
  const [selectedReaction, setSelectedReaction] = useState<any>(null);
  const bottomSheetRef = useRef<BottomSheet>(null!);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const videoPosts = useMemo(() => {
    return posts.filter((post) => post.video && post.video.trim() !== "");
  }, [posts]);

  const videos: Array<VideoItemType & { post: Post }> = useMemo(() =>
    videoPosts.map((p) => ({
      key: p._id,
      source: p.video as string,
      thumbnail: p.image || p.user.profilePicture || "",
      post: p,
    })),
  [videoPosts]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      const visibleItem = viewableItems.find((i: any) => i.isViewable);
      if (visibleItem && typeof visibleItem.index === "number") {
        setCurrentVideoIndex(visibleItem.index);
      }
    },
    []
  );

  const handleGetItemLayout = useCallback(
    (_: ArrayLike<VideoItemType> | null | undefined, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    []
  );

  const handleOpenComments = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleCloseComments = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  useEffect(() => {
    if (!isFocused) {
      setCurrentVideoIndex(-1 as unknown as number);
    }
  }, [isFocused]);

  const handleLongPress = useCallback((targetRef: any) => {
    (targetRef.current as any)?.measure((
      _x: number,
      _y: number,
      _w: number,
      _h: number,
      pageX: number,
      pageY: number
    ) => {
      setAnchorMeasurements({ pageX, pageY });
      setPickerVisible(true);
    });
  }, []);

  const handleReactionSelect = useCallback((reaction: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReaction(reaction);
    setPickerVisible(false);
  }, []);

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
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={[styles.infoText, { color: "#1877F2" }]}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (videos.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={styles.headerTitle}>Reels</Text>
        </View>
        <Ionicons name="videocam-off-outline" size={64} color="#9CA3AF" />
        <Text style={styles.infoText}>No videos have been posted yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Reels</Text>
      </View>

      <ReelsList
        videos={videos}
        currentVideoIndex={currentVideoIndex}
        handleGetItemLayout={handleGetItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        videoHeight={height}
        isMuted={isMuted}
        showSeekbar
        showLoadingIndicator
        useNativeControls={false}
        holdToPause
        bottomOffset={insets.bottom + 8}
        overlayComponent={({ item }) => {
          const likeButtonRef = useRef<View>(null);
          const post = (item as any).post as Post;
          return (
            <View
              pointerEvents="box-none"
              style={[
                styles.overlay,
                {
                  paddingBottom: insets.bottom + 40,
                  paddingLeft: insets.left + 15,
                  paddingRight: insets.right + 15,
                  paddingTop: insets.top + 40,
                },
              ]}
            >
              <View style={styles.leftContainer}>
                <View style={styles.userInfo}>
                  <Image source={{ uri: post.user.profilePicture }} style={styles.avatar} />
                  <Text style={styles.username}>
                    {post.user.firstName} {post.user.lastName}
                  </Text>
                </View>
                <Text style={styles.caption} numberOfLines={2}>
                  {post.content}
                </Text>
              </View>
              <View style={styles.rightContainer}>
                <View ref={likeButtonRef}>
                  <TouchableOpacity
                    onPress={() => handleReactionSelect("like")}
                    onLongPress={() => handleLongPress(likeButtonRef as any)}
                    style={styles.iconContainer}
                  >
                    <Ionicons
                      name={selectedReaction ? "heart" : "heart-outline"}
                      size={30}
                      color="white"
                    />
                    <Text style={styles.iconText}>{formatNumber(post.reactions.length)}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.iconContainer} onPress={handleOpenComments}>
                  <Ionicons name="chatbubble-ellipses" size={30} color="white" />
                  <Text style={styles.iconText}>{formatNumber(post.comments.length)}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconContainer} onPress={handleOpenComments}>
                  <Ionicons name="share-social" size={30} color="white" />
                  <Text style={styles.iconText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconContainer} onPress={() => setIsMuted((m) => !m)}>
                  <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={28} color="white" />
                  <Text style={styles.iconText}>{isMuted ? "Mute" : "Sound"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <CommentsBottomSheet bottomSheetRef={bottomSheetRef} onClose={handleCloseComments} />
      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        // @ts-ignore
        anchorMeasurements={anchorMeasurements}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  centered: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject as any,
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 60,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
    marginRight: 10,
  },
  username: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  caption: {
    color: "white",
    fontSize: 14,
    marginRight: 70,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  iconText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
});
