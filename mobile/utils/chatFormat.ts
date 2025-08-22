// mobile/utils/chatFormat.ts
import { format, isToday, isYesterday } from "date-fns";

export const REACTION_TO_EMOJI: Record<string, string> = {
  like: "👍",
  love: "❤️",
  fire: "🔥",
  haha: "🤣",
  smile_tear: "🥲",
  angry: "😡",
  // legacy/aliases mapping if present in the data
  thumbsup: "👍",
  enraged: "😡",
  kissing_heart: "❤️",
};

export const formatMessageTime = (date: Date) => {
  if (isToday(date)) return `TODAY AT ${format(date, "h:mm a").toUpperCase()}`;
  if (isYesterday(date)) return `YESTERDAY AT ${format(date, "d MMM 'AT' h:mm a").toUpperCase()}`;
  return format(date, "d MMM yyyy 'AT' h:mm a").toUpperCase();
};

export const shouldShowTimestamp = (currentMessage: any, previousMessage: any) => {
  if (!previousMessage) return true;
  const timeDiff =
    new Date(currentMessage.created_at).getTime() -
    new Date(previousMessage.created_at).getTime();
  return timeDiff > 30 * 60 * 1000;
};