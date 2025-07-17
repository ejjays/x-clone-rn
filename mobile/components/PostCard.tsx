import React, { useCallback, useMemo, useRef } from "react";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Box,
  HStack,
  Pressable,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { IPost } from "../types";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Icon,
  MessageCircle,
  Repeat,
  Heart,
  Share,
  MoreHorizontal,
} from "lucide-react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import PostReactionsPicker from "./PostReactionsPicker";
import CommentsBottomSheet from "./CommentsBottomSheet";
import { usePost } from "../hooks/usePost";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

type PostCardProps = {
  post: IPost;
  isReply?: boolean;
};

const PostCard = ({ post, isReply = false }: PostCardProps) => {
  const { userId } = useAuth();
  const router = useRouter();
  const {
    isLiked,
    isReposted,
    likePost,
    unlikePost,
    repost,
    unrepost,
    likesCount,
    repostsCount,
    commentsCount,
  } = usePost({
    postId: post.id,
    userId: userId!,
  });
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const commentsBottomSheetRef = useRef<BottomSheetModal>(null);

  const handlePresentModal = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handlePresentComments = useCallback(() => {
    commentsBottomSheetRef.current?.present();
  }, []);

  const handleOnPostPress = () => {
    router.push(`/post/${post.id}`);
  };

  const snapPoints = useMemo(() => ["25%", "50%"], []);
  return (
    <Pressable onPress={handleOnPostPress}>
      <Box
        borderBottomWidth="$1"
        borderColor="$borderDark800"
        py="$4"
        px="$4"
        bg="$black"
      >
        {isReply && (
          <HStack alignItems="center" space="md" mb="$2">
            <Text color="$textDark400" fontSize="$sm">
              Replying to @{post.parent?.author.username}
            </Text>
          </HStack>
        )}
        <HStack space="md">
          <Avatar size="md" borderRadius="$full">
            <AvatarImage
              source={{
                uri:
                  post.author.avatar_url ||
                  `https://api.dicebear.com/8.x/lorelei/png?seed=${post.author.username}`,
              }}
              alt={post.author.username}
            />
            <AvatarFallbackText>{post.author.username}</AvatarFallbackText>
          </Avatar>
          <VStack flex={1}>
            <HStack
              justifyContent="space-between"
              alignItems="center"
              flex={1}
            >
              <HStack alignItems="center" space="sm">
                <Text color="$white" fontWeight="$bold" fontSize="$md">
                  {post.author.full_name}
                </Text>
                <Text color="$textDark400" fontSize="$md">
                  @{post.author.username}
                </Text>
                <Text color="$textDark400" fontSize="$md">
                  ·{" "}
                  {formatDistanceToNowStrict(new Date(post.created_at), {
                    addSuffix: false,
                  })}
                </Text>
              </HStack>
              <Pressable onPress={handlePresentModal}>
                <Icon as={MoreHorizontal} color="$textDark400" />
              </Pressable>
            </HStack>
            <Text color="$white" fontSize="$md">
              {post.text}
            </Text>
            {post.image_url && (
              <Box mt="$3" borderRadius="$md" overflow="hidden">
                <AvatarImage
                  source={{ uri: post.image_url }}
                  alt="post image"
                  style={{
                    width: "100%",
                    height: 300,
                  }}
                />
              </Box>
            )}

            <HStack mt="$4" justifyContent="space-between">
              <HStack alignItems="center" space="md">
                <Pressable onPress={handlePresentComments}>
                  <Icon as={MessageCircle} color="$textDark400" size={20} />
                </Pressable>
                <Text color="$textDark400" fontSize="$sm">
                  {commentsCount}
                </Text>
              </HStack>
              <HStack alignItems="center" space="md">
                <Pressable onPress={isReposted ? unrepost : repost}>
                  <Icon
                    as={Repeat}
                    color={isReposted ? "$green500" : "$textDark400"}
                    size={20}
                  />
                </Pressable>
                <Text
                  color={isReposted ? "$green500" : "$textDark400"}
                  fontSize="$sm"
                >
                  {repostsCount}
                </Text>
              </HStack>
              <HStack alignItems="center" space="md">
                <Pressable onPress={isLiked ? unlikePost : likePost}>
                  <Icon
                    as={Heart}
                    color={isLiked ? "$red500" : "$textDark400"}
                    fill={isLiked ? "$red500" : "transparent"}
                    size={20}
                  />
                </Pressable>
                <Text
                  color={isLiked ? "$red500" : "$textDark400"}
                  fontSize="$sm"
                >
                  {likesCount}
                </Text>
              </HStack>
              <HStack alignItems="center" space="md">
                <Icon as={Share} color="$textDark400" size={20} />
              </HStack>
            </HStack>
          </VStack>
        </HStack>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          backgroundStyle={{
            backgroundColor: "#171717",
          }}
          handleIndicatorStyle={{
            backgroundColor: "#404040",
          }}
        >
          <PostReactionsPicker />
        </BottomSheetModal>
        <CommentsBottomSheet ref={commentsBottomSheetRef} post={post} />
      </Box>
    </Pressable>
  );
};

export default PostCard;