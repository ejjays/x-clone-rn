import Share from "react-native-share";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import type { Post } from "@/types";
import { getPlayableVideoUrl } from "@/utils/media";

const buildShareMessage = (post: Post): string => {
  const author = `${post.user?.firstName ?? ""} ${post.user?.lastName ?? ""}`.trim();
  const content = (post.content ?? "").trim();
  if (author && content) return `${author}: ${content}`;
  if (author) return `${author} shared a post`;
  return content || "Check this post";
};

export const sharePost = async (post: Post) => {
  try {
    Haptics.selectionAsync().catch(() => {});

    const message = buildShareMessage(post);
    let url: string | undefined;
    if (post.image) url = post.image;
    else if (post.video) url = getPlayableVideoUrl(post.video);

    const options: Share.Options = {
      title: "Share Post",
      message,
      failOnCancel: false,
      url,
    } as Share.Options;

    await Share.open(options);
  } catch (err: any) {
    // User canceled or error; no-op
  }
};

