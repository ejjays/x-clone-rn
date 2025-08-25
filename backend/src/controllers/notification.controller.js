import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const getNotifications = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const notifications = await Notification.find({ to: user._id })
    .sort({ createdAt: -1 })
    .populate("from", "username firstName lastName profilePicture")
    .populate("post", "content image")
    .populate("comment", "content");

  res.status(200).json({ notifications });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { notificationId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    to: user._id,
  });

  if (!notification) return res.status(404).json({ error: "Notification not found" });

  res.status(200).json({ message: "Notification deleted successfully" });
});

// --- Push Notifications ---
export const registerPushToken = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { token } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!token) return res.status(400).json({ error: "Token is required" });

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    { $set: { pushToken: token } },
    { new: true },
  );

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ message: "Push token registered", pushToken: user.pushToken });
});

export const togglePushNotifications = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { enabled, preferences } = req.body as { enabled?: boolean; preferences?: any };

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (typeof enabled === "boolean") user.pushNotificationsEnabled = enabled;
  if (preferences && typeof preferences === "object") {
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences,
    } as any;
  }
  await user.save();

  res.status(200).json({ message: "Notification preferences updated", enabled: user.pushNotificationsEnabled, preferences: user.notificationPreferences });
});

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
};

export const sendPushNotification = asyncHandler(async (req, res) => {
  const { toClerkId, title, body, data } = req.body;

  if (!toClerkId) return res.status(400).json({ error: "toClerkId is required" });

  // Allow self-send for testing; otherwise require admin
  const requester = await User.findOne({ clerkId: req.auth.userId });
  if (!requester) return res.status(401).json({ error: "Unauthorized" });
  if (toClerkId !== req.auth.userId && requester.isAdmin !== true) {
    return res.status(403).json({ error: "Admin privileges required to send to other users" });
  }

  const recipient = await User.findOne({ clerkId: toClerkId });
  if (!recipient || !recipient.pushToken) return res.status(404).json({ error: "Recipient not found or no push token" });
  if (!recipient.pushNotificationsEnabled) return res.status(200).json({ message: "Notifications disabled for user" });

  if (!Expo.isExpoPushToken(recipient.pushToken)) {
    return res.status(400).json({ error: "Invalid Expo push token" });
  }

  const messages = [
    {
      to: recipient.pushToken,
      sound: "default",
      title,
      body,
      data: data || {},
      badge: 1,
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("❌ Expo push send error:", error);
    }
  }

  res.status(200).json({ message: "Notification enqueued", tickets });
});

export const sendBulkNotifications = asyncHandler(async (req, res) => {
  const { toClerkIds = [], title, body, data } = req.body;
  const requester = await User.findOne({ clerkId: req.auth.userId });
  if (!requester || requester.isAdmin !== true) return res.status(403).json({ error: "Admin privileges required" });
  const recipients = await User.find({ clerkId: { $in: toClerkIds }, pushNotificationsEnabled: true, pushToken: { $ne: null } });

  const messages = recipients
    .filter((u) => Expo.isExpoPushToken(u.pushToken))
    .map((u) => ({ to: u.pushToken, sound: "default", title, body, data: data || {}, badge: 1 }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("❌ Bulk push send error:", error);
    }
  }

  res.status(200).json({ message: "Bulk notifications enqueued", count: messages.length, tickets });
});
