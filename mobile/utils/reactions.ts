import type { ReactionName } from "../types";
import AngryEmoji from "../assets/icons/reactions/AngryEmoji";
import CelebrateEmoji from "../assets/icons/reactions/CelebrateEmoji";
import CryingEmoji from "../assets/icons/reactions/CryingEmoji";
import HeartEmoji from "../assets/icons/reactions/HeartEmoji";
import LaughingEmoji from "../assets/icons/reactions/LaughingEmoji";
import LikeEmoji from "../assets/icons/reactions/LikeEmoji";
import WowEmoji from "../assets/icons/reactions/WowEmoji";
import type { JSX } from "react"; // Declare JSX variable

export const reactionComponents: Record<
  ReactionName,
  (props: any) => JSX.Element
> = {
  like: LikeEmoji,
  love: HeartEmoji,
  celebrate: CelebrateEmoji,
  wow: WowEmoji,
  haha: LaughingEmoji,
  sad: CryingEmoji,
  angry: AngryEmoji,
};

export const reactionTextColor: Record<string, string> = {
  like: "text-blue-500",
  love: "text-red-500",
  celebrate: "text-yellow-500",
  wow: "text-yellow-500",
  haha: "text-yellow-500",
  sad: "text-blue-400",
  angry: "text-red-600",
};

export const getReactionComponent = (reactionType: ReactionName) => {
  return reactionComponents[reactionType];
};

export const reactionLabels: Record<ReactionName, string> = {
  like: "Like",
  love: "Love",
  celebrate: "Celebrate",
  wow: "Wow",
  haha: "Haha",
  sad: "Sad",
  angry: "Angry",
};
