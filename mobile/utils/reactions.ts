import type { ReactionName } from "@/types";
import AngryEmoji from "@/assets/icons/reactions/AngryEmoji";
import CryingEmoji from "@/assets/icons/reactions/CryingEmoji";
import HeartEmoji from "@/assets/icons/reactions/HeartEmoji";
import LaughingEmoji from "@/assets/icons/reactions/LaughingEmoji";
import LikeEmoji from "@/assets/icons/reactions/LikeEmoji";
import WowEmoji from "@/assets/icons/reactions/WowEmoji";

export const reactionComponents: Record<
  ReactionName,
  (props: any) => JSX.Element
> = {
  like: LikeEmoji,
  love: HeartEmoji,
  haha: LaughingEmoji,
  wow: WowEmoji,
  sad: CryingEmoji,
  angry: AngryEmoji,
};

export const reactionTextColor: Record<string, string> = {
  like: "text-blue-500",
  love: "text-red-500",
  haha: "text-yellow-500",
  wow: "text-yellow-500",
  sad: "text-yellow-500",
  angry: "text-red-600",
};
