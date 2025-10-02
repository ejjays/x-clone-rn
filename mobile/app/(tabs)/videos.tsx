import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  StatusBar as RNStatusBar,
  StatusBar,
  Platform,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Animated,
  InteractionManager,
} from "react-native";
import {
  useIsFocused,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import BottomSheet from "@gorhom/bottom-sheet";
import CommentsBottomSheet from "@/components/CommentsBottomSheet";




import type { Post } from "@/types";
// Remove expo-status-bar to use native StatusBar for precise Android control
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/context/ThemeContext";
import VideoItem from "@/features/videos/components/VideoItem";
import ReelsListWrapper from "@/features/videos/ReelsListWrapper";
// import { useVideosStatusBar } from "@/features/videos/hooks/useVideosStatusBar";
import { videosScreenStyles as styles } from "@/features/videos/styles";
import { usePosts } from "@/hooks/usePosts";

/**
 * Safely attempt to read bottom tab bar height.
 * Returns 0 if this screen isn't inside a BottomTabNavigator.
 */
function useOptionalTabBarHeight() {
  try {
    return useBottomTabBarHeight();
  } catch {
    // No bottom tab bar in top-tabs setup; fallback to 0
    return 0;
  }
}

// VideoItem moved to features/videos/components/VideoItem

export default function VideosScreen() {
  const { posts, isLoading, error, refetch } = usePosts();
  const params = useLocalSearchParams();
  const initialVideoId = typeof params?.videoId === 'string' ? params.videoId : undefined;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRefetching, setIsRefetching] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const commentsSheetRef = useRef<BottomSheet>(null);

  const handleOpenComments = () => {
    commentsSheetRef.current?.expand();
  };

  const handleCloseComments = () => {
    commentsSheetRef.current?.close();
  };

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { colors, isDarkMode } = useTheme(); // Use useTheme hook
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const tabBarHeight = useOptionalTabBarHeight();
  const bottomSafeOffset = Math.max(0, insets.bottom) + tabBarHeight;

  const videoPosts = useMemo(() => posts.filter((p) => p.video?.trim()), [posts]);

  useEffect(() => {
    if (!isFocused) {
      handleCloseComments();
    }
  }, [isFocused]);

  useEffect(() => {
    if (!initialVideoId || videoPosts.length === 0) return;
    const index = videoPosts.findIndex((p) => p._id === initialVideoId);
    if (index >= 0) setActiveIndex(index);
  }, [initialVideoId, videoPosts.length]);

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  const [ready, setReady] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setReady(true);
      });

      return () => {
        task.cancel();
        setReady(false);
      };
    }, [])
  );

  const renderItem = useCallback(
    ({
      item,
      index,
      isActive,
    }: {
      item: Post;
      index: number;
      isActive: boolean;
    }) => (
      <VideoItem
        item={item}
        isVisible={isActive && isFocused}
        isScreenFocused={isFocused}
        insets={insets}
        bottomSafeOffset={bottomSafeOffset}
        width={width}
        height={containerHeight}
        onCommentPress={handleOpenComments}
      />
    ),
    [isFocused, insets, bottomSafeOffset, width, containerHeight]
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { flex: 1, backgroundColor: "#242526" }]}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Could not load videos.</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={[styles.infoText, { color: "#1877F2" }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (videoPosts.length === 0) {
    return (
      <View style={[styles.centered, { flex: 1, backgroundColor: "#242526" }]}>
        <Animated.View
          style={[
            styles.header,
            {
              position: "absolute",
              top: 0,
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: 'transparent',
              opacity: headerOpacity,
            },
          ]}
        >
            <TouchableOpacity
              onPress={() => router.back()}
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
        </Animated.View>
        <Ionicons name="videocam-off-outline" size={64} color="#9CA3AF" />
        <Text style={styles.infoText}>No videos have been posted yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#242526" }} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
      <Animated.View
        style={[
          styles.header,
          {
            position: "absolute",
            top: 0,
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: 'transparent',
            opacity: headerOpacity,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
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
      </Animated.View>

      {ready && containerHeight > 0 && (
        <ReelsListWrapper
          data={videoPosts}
          height={containerHeight}
          width={width}
          onIndexChange={setActiveIndex}
          renderItem={renderItem as any}
          initialIndex={activeIndex}
        />
      )}

      {ready && (
        <CommentsBottomSheet
          bottomSheetRef={commentsSheetRef}
          onClose={handleCloseComments}
          bottomOffset={tabBarHeight}
          topOffset={50}
        />
      )}
    </View>
  );
}
