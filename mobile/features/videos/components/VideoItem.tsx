import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Animated } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import Video from "react-native-video";
import { getPlayableVideoUrl } from "@/utils/media";
import * as Haptics from "expo-haptics";

import { usePosts } from "@/hooks/usePosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Post } from "@/types";
import { formatNumber } from "@/utils/formatters";
import PostActionBottomSheet, { PostActionBottomSheetRef } from "@/components/PostActionBottomSheet";
import PostReactionsPicker from "@/components/PostReactionsPicker";
import { videoItemStyles as styles } from "@/features/videos/styles";

import type { EdgeInsets } from "react-native-safe-area-context";

type VideoItemProps = {
	item: Post;
	isVisible: boolean;
	isScreenFocused: boolean;
	onCommentPress: () => void;
	insets: EdgeInsets;
	bottomSafeOffset: number;
	commentBarHeight: number;
	width: number;
	height: number;
};

export default function VideoItem({
	item,
	isVisible,
	isScreenFocused,
	onCommentPress,
	insets,
	bottomSafeOffset,
	commentBarHeight,
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
	const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
	const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
	const [containerWidth, setContainerWidth] = useState<number>(width);
	const [isMuted, setIsMuted] = useState(false);
	const lastTapRef = useRef<number>(0);
	const [videoOrientation, setVideoOrientation] = useState<"portrait" | "landscape" | null>(null);

	const heartScale = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		if (!isVisible && videoRef.current) {
			try { (videoRef.current as any).seek(0); } catch {}
		}
	}, [isVisible]);

	const toggleMute = async () => {
		const next = !isMuted;
		setIsMuted(next);
		if (!player) return;
		(player as any).setIsMuted?.(next);
	};

	const containerHeight = useMemo(() => {
		// Height is already passed excluding the comment bar area
		return Math.max(0, height);
	}, [height]);

	const dynamicResizeMode = useMemo(() => {
		// Respect post preference: 'full' => cover, 'original' => contain; default to cover
		return item.videoFit === 'original' ? ("contain" as const) : ("cover" as const);
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
			Animated.timing(heartScale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
			Animated.spring(heartScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
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
		await (await import("expo-clipboard")).setStringAsync(text);
		if (Platform.OS === "android") {
			(await import("react-native")).ToastAndroid.show("Copied to clipboard", (await import("react-native")).ToastAndroid.SHORT);
		}
		postActionBottomSheetRef.current?.close();
	};

	return (
		<View style={[styles.videoContainer, { width, height, backgroundColor: 'black' }]}> 
			<View style={[styles.videoWrapper, { height: containerHeight }]}> 
				<View style={StyleSheet.absoluteFillObject} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}> 
					{item.video && (
						<Video
							ref={(r) => (videoRef.current = r)}
							source={{ uri: getPlayableVideoUrl(item.video) }}
							style={StyleSheet.absoluteFillObject}
							controls
							resizeMode={dynamicResizeMode}
							repeat
							muted={isMuted}
							paused={!(isVisible && isScreenFocused)}
						/>
					)}
				</View>

				<View
					pointerEvents="box-none"
					style={[
						styles.overlay,
						{
							paddingTop: 10,
							paddingLeft: insets.left + 15,
							paddingRight: insets.right + 15,
							paddingBottom: commentBarHeight + Math.max(0, insets.bottom),
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
							<Text style={styles.username}>
								{item.user.firstName} {item.user.lastName}
							</Text>
						</View>
						<Text style={[styles.caption, { marginBottom: 10 }]} numberOfLines={2}>
							{item.content}
						</Text>
					</View>

					<View style={[styles.rightContainer]}>
						<TouchableOpacity
							ref={likeButtonRef}
							onPress={() => {
								reactToPost({
									postId: item._id,
									reactionType: currentReaction?.type === "like" ? null : "like",
								});
								Animated.sequence([
									Animated.timing(heartScale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
									Animated.spring(heartScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
								]).start();
							}}
							onLongPress={handleLongPress}
							style={styles.iconContainer}
						>
							<Animated.View style={{ transform: [{ scale: heartScale }] }}>
								<Ionicons
									name={currentReaction?.type === "like" ? "heart-sharp" : "heart-outline"}
									size={30}
									color={currentReaction?.type === "like" ? "red" : "white"}
									style={styles.iconShadow}
								/>
							</Animated.View>
							<Text style={styles.iconText}>{formatNumber(item.reactions.length)}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.iconContainer} onPress={onCommentPress}>
							<Ionicons name="chatbubble-ellipses-outline" size={30} color="white" style={styles.iconShadow} />
							<Text style={styles.iconText}>{formatNumber(item.comments.length)}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.iconContainer}>
							<Ionicons name="share-social-outline" size={30} color="white" style={styles.iconShadow} />
							<Text style={styles.iconText}>Share</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.iconContainer} onPress={toggleMute}>
							<Ionicons name={isMuted ? "volume-mute-outline" : "volume-high-outline"} size={28} color="white" style={styles.iconShadow} />
							<Text style={styles.iconText}>{isMuted ? "Mute" : "Sound"}</Text>
						</TouchableOpacity>

						{(isOwnPost || isAdmin) && (
							<TouchableOpacity style={styles.iconContainer} onPress={handlePostActionsPress}>
								<Entypo name="dots-three-horizontal" size={28} color="white" style={styles.iconShadow} />
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

