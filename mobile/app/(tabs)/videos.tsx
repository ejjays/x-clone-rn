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

const { height, width } = Dimensions.get("window");

const VideoItem = ({
  item,
  isVisible,
  isScreenFocused,
  onCommentPress,
  insets,
}: {
  item: Post;
  isVisible: boolean;
  isScreenFocused: boolean;
  onCommentPress: () => void;
  insets: EdgeInsets;
}) => {
  const videoRef = useRef<Video>(null);
  const likeButtonRef = useRef<TouchableOpacity>(null);
  // Set initial isPlaying to false, so it doesn't autoplay until explicitly in view.
  const [isPlaying, setIsPlaying] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorMeasurements, setAnchorMeasurements] = useState(null);
  const [selectedReaction, setSelectedReaction] = useState(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isVisible && isScreenFocused) {
      videoRef.current.playAsync().then(() => setIsPlaying(true));
    } else {
      videoRef.current.pauseAsync();
      // Reset position only when not visible (to start from top next time)
      if (!isVisible) {
        videoRef.current.setStatusAsync({ positionMillis: 0 });
      }
      setIsPlaying(false);
    }
  }, [isVisible, isScreenFocused]);

  const onPlayPausePress = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying((prev) => !prev);
    }
  };

  const handleLongPress = () => {
    likeButtonRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
      // @ts-ignore
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
    <View style={styles.videoContainer}>
      <Pressable onPress={onPlayPausePress} style={styles.videoPressable}>
                 <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: item.video! }}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay={false}
          onError={(error) =>
            console.log(`Video Error for post ${item._id}:`, error)
          }
        />
        {!isPlaying &&
          isVisible && ( // Only show play icon if visible and not playing
            <View style={styles.playIconContainer}>
              <Ionicons
                name="play"
                size={80}
                color="rgba(255, 255, 255, 0.7)"
              />
            </View>
          )}
      </Pressable>

      <View
        style={[
          styles.overlay,
          {
            paddingBottom: insets.bottom + 90,
            paddingLeft: insets.left + 15,
            paddingRight: insets.right + 15,
            paddingTop: insets.top + 60,
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
                     <Text style={styles.caption} numberOfLines={3}>{item.content}</Text>
        </View>
        <View style={styles.rightContainer}>
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
            />

            <Text style={styles.iconText}>
              {formatNumber(item.reactions.length)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onCommentPress}
          >
            <Ionicons name="chatbubble-ellipses" size={30} color="white" />
            <Text style={styles.iconText}>
              {formatNumber(item.comments.length)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer}>
            <Ionicons name="share-social" size={30} color="white" />
            <Text style={styles.iconText}>0</Text>
          </TouchableOpacity>
        </View>
      </View>
      <PostReactionsPicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReactionSelect}
        // @ts-ignore
        anchorMeasurements={anchorMeasurements}
      />
    </View>
  );
};

export default function VideosScreen() {
  const { posts, isLoading, error, refetch } = usePosts();
  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const videoPosts = useMemo(() => {
    return posts.filter((post) => post.video && post.video.trim() !== "");
  }, [posts]);

  const handleOpenComments = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleCloseComments = () => {
    bottomSheetRef.current?.close();
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = useCallback(
    ({
      viewableItems: newViewableItems,
    }: {
      viewableItems: Array<{ item: Post; key: string }>;
    }) => {
      setViewableItems(newViewableItems.map((item) => item.key as string));
    },
    []
  );

  // When the screen loses focus, clear visible items to force pause in VideoItem
  useEffect(() => {
    if (!isFocused) {
      setViewableItems([]);
    }
  }, [isFocused]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <VideoItem
        item={item}
        isVisible={viewableItems.includes(item._id)}
        isScreenFocused={!!isFocused}
        onCommentPress={handleOpenComments}
        insets={insets}
      />
    ),
    [viewableItems, insets, isFocused]
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
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={[styles.infoText, { color: "#1877F2" }]}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (videoPosts.length === 0) {
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
             <FlatList
         data={videoPosts}
         renderItem={renderItem}
         keyExtractor={(item) => item._id}
         pagingEnabled
         showsVerticalScrollIndicator={false}
         onViewableItemsChanged={onViewableItemsChanged}
         viewabilityConfig={viewabilityConfig}
         getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
         decelerationRate="fast"
         initialNumToRender={2}
         maxToRenderPerBatch={3}
         windowSize={5}
       />
      <CommentsBottomSheet
        bottomSheetRef={bottomSheetRef}
        onClose={handleCloseComments}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
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
  videoContainer: {
    width: width,
    height: height,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    width: width,
    height: height,
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
