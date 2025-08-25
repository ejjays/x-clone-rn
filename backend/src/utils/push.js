import { Expo } from "expo-server-sdk";
import User from "../models/user.model.js";

const expo = new Expo();

const preferenceKeyForType = (type) => {
  switch (type) {
    case "chat_message":
      return "messages";
    case "follow":
      return "follows";
    case "like":
      return "postReactions";
    case "comment":
      return "postReactions"; // Treat comments under post-related notifications
    default:
      return "system";
  }
};

export async function sendToClerkIds({
  clerkIds,
  title,
  body,
  data = {},
  type,
}) {
  if (!Array.isArray(clerkIds) || clerkIds.length === 0) return { sent: 0 };

  const prefKey = preferenceKeyForType(type);

  const users = await User.find({
    clerkId: { $in: clerkIds },
    pushNotificationsEnabled: true,
    pushToken: { $ne: null },
    [`notificationPreferences.${prefKey}`]: { $ne: false },
  });

  const messages = users
    .filter((u) => Expo.isExpoPushToken(u.pushToken))
    .map((u) => ({
      to: u.pushToken,
      sound: "default",
      title,
      body,
      data: { ...(data || {}), type },
      badge: 1,
    }));

  const chunks = expo.chunkPushNotifications(messages);
  let count = 0;
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
      count += chunk.length;
    } catch (e) {
      console.error("❌ Push send error:", e);
    }
  }
  return { sent: count };
}

