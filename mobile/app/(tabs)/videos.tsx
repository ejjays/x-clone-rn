import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { StatusBar as RNStatusBar, Platform, View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, useWindowDimensions } from "react-native";
import { useIsFocused, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SystemUI from "expo-system-ui";
import BottomSheet from "@gorhom/bottom-sheet";

import CommentsBottomSheet from "@/components/CommentsBottomSheet";
import { VideoCommentBar, COMMENT_BAR_HEIGHT } from "@/components/VideoCommentBar";
import type { Post } from "@/types";
import { StatusBar } from "expo-status-bar";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/context/ThemeContext";
import VideoItem from "@/features/videos/components/VideoItem";
import { useVideosStatusBar } from "@/features/videos/hooks/useVideosStatusBar";
import { videosScreenStyles as styles } from "@/features/videos/styles";
import { usePosts } from "@/hooks/usePosts";


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

// VideoItem moved to features/videos/components/VideoItem

export default function VideosScreen() {
  const { posts, isLoading, error, refetch } = usePosts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRefetching, setIsRefetching] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const { colors, isDarkMode } = useTheme(); // Use useTheme hook

  useVideosStatusBar();

  const tabBarHeight = useOptionalTabBarHeight();
  // This bottomSafeOffset is used for the FlatList content padding and VideoItem height adjustment.
  // For the CommentsBottomSheet, we will only pass the tabBarHeight to avoid double counting insets.bottom.
  const bottomSafeOffset = Math.max(0, insets.bottom) + tabBarHeight;

  // Using fixed COMMENT_BAR_HEIGHT for consistent sizing

  const videoPosts = useMemo(
    () => posts.filter((p) => p.video?.trim()),
    [posts]
  );

  const handleOpenComments = () => bottomSheetRef.current?.snapToIndex(0);
  const handleCloseComments = () => bottomSheetRef.current?.close();

  // Calculate header height: insets.top + paddingTop (8) + title height (28) + paddingBottom (10)
  const headerHeight = insets.top + 8 + 28 + 10;
  // Each item should be the screen height minus header and comment bar
  const itemHeight = height - headerHeight - (COMMENT_BAR_HEIGHT + Math.max(0, insets.bottom));

  useEffect(() => {
    // Ensure the sheet is closed whenever this screen mounts or loses focus
    if (!isFocused) {
      handleCloseComments();
    }
  }, [isFocused]);

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  const handleMomentumEnd = useCallback((e) => {
    const y = e.nativeEvent.contentOffset?.y ?? 0;
    const index = Math.max(0, Math.round(y / itemHeight));
    setActiveIndex(index);
  }, [itemHeight]);

  const [ready, setReady] = useState(false);
  useFocusEffect(
    useCallback(() => {
      // Make screen ready immediately; avoid awaited NavigationBar ops to keep tab nav instant
      setReady(true);
      try {
        RNStatusBar.setHidden(false);
        if (Platform.OS === 'android') {
          SystemUI.setBackgroundColorAsync('transparent');
        }
      } catch {}
      return () => {
        setReady(false);
        try {
          RNStatusBar.setHidden(false);
          if (Platform.OS === 'android') {
            SystemUI.setBackgroundColorAsync('#000000');
          }
        } catch {}
      };
    }, [])
  );

  const renderItem = useCallback(({ item, index }: { item: Post, index: number }) => (
    <VideoItem
      item={item}
      isVisible={index === activeIndex}
      isScreenFocused={isFocused}
      onCommentPress={handleOpenComments}
      insets={insets}
      bottomSafeOffset={bottomSafeOffset}
      commentBarHeight={COMMENT_BAR_HEIGHT}
      width={width}
      height={itemHeight}
    />
  ), [activeIndex, isFocused, insets, bottomSafeOffset, width, itemHeight]);


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
        key={`${COMMENT_BAR_HEIGHT}-${width}`}
        data={videoPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, i) => ({
          length: itemHeight,
          offset: itemHeight * i,
          index: i,
        })}
        decelerationRate={0.985}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={11}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 0 }}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        disableIntervalMomentum
        removeClippedSubviews
        overScrollMode="never"
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleMomentumEnd}
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

      <VideoCommentBar onCommentPress={handleOpenComments} />

      {ready && (
        <CommentsBottomSheet
          bottomSheetRef={bottomSheetRef}
          onClose={handleCloseComments}
          bottomOffset={COMMENT_BAR_HEIGHT + tabBarHeight}
        />
      )}
    </View>
  );
}

