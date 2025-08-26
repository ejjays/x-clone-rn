import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export const registerPushToken = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ message: "Token required" });

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { pushToken: token, pushNotificationsEnabled: true } },
      { new: true },
    );

    console.log("✅ Registered push token for user:", {
      clerkId: userId,
      hasToken: Boolean(user?.pushToken),
      tokenSuffix: token ? token.slice(-6) : undefined,
    });

    return res.status(200).json({ ok: true, pushToken: user.pushToken });
  } catch (e) {
    console.error("❌ Failed to register push token:", e?.message);
    return res.status(500).json({ message: "Failed to register token" });
  }
};

export const toggleNotifications = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { enabled } = req.body || {};
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { pushNotificationsEnabled: !!enabled } },
      { new: true },
    );
    console.log("🔔 Toggled notifications:", { clerkId: userId, enabled: user?.pushNotificationsEnabled });
    return res.status(200).json({ ok: true, enabled: user.pushNotificationsEnabled });
  } catch (e) {
    console.error("❌ Failed to toggle notifications:", e?.message);
    return res.status(500).json({ message: "Failed to toggle notifications" });
  }
};

export const sendPushToTokens = async ({ messages }) => {
  const chunks = [];
  const size = 99;
  for (let i = 0; i < messages.length; i += size) {
    chunks.push(messages.slice(i, i + size));
  }
  for (const chunk of chunks) {
    try {
      console.log("📤 Sending Expo push chunk:", chunk.map(m => ({ toSuffix: m.to?.slice(-6), title: m.title })));
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      });
      const text = await response.text();
      let json;
      try { json = JSON.parse(text); } catch { json = text; }
      console.log("📥 Expo push response:", { status: response.status, body: json });
    } catch (e) {
      console.error("❌ Expo push request failed:", e?.message);
    }
  }
};

export const sendNotification = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { toSelf, toClerkId, title, body, data } = req.body || {};
    let target;
    if (toSelf) target = await User.findOne({ clerkId: userId, pushNotificationsEnabled: true, pushToken: { $ne: "" } });
    else if (toClerkId) target = await User.findOne({ clerkId: toClerkId, pushNotificationsEnabled: true, pushToken: { $ne: "" } });
    if (!target) return res.status(404).json({ message: "No target with push token" });

    console.log("🔔 Sending notification:", {
      from: userId,
      to: target.clerkId,
      toSuffix: target.pushToken?.slice(-6),
      title: title || "Notification",
    });

    await sendPushToTokens({
      messages: [
        {
          to: target.pushToken,
          title: title || "Notification",
          body: body || "",
          sound: "default",
          data: data || {},
        },
      ],
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("❌ Failed to send notification:", e?.message);
    return res.status(500).json({ message: "Failed to send notification" });
  }
};

export const streamWebhook = async (req, res) => {
  try {
    const event = req.body;
    if (event.type !== "message.new") return res.status(200).json({ ok: true });
    const channelId = event.channel_id;
    const senderId = event.user?.id;
    const members = Object.keys(event.members || {});
    const recipients = members.filter((m) => m !== senderId);
    const users = await User.find({ clerkId: { $in: recipients }, pushNotificationsEnabled: true, pushToken: { $ne: "" } });
    const messages = users.map((u) => ({
      to: u.pushToken,
      title: `New message`,
      body: event.message?.text || "",
      sound: "default",
      data: { type: "chat_message", channelId, senderId, messageId: event.message?.id },
    }));
    console.log("📨 Webhook fanout:", { recipients: users.map(u => ({ clerkId: u.clerkId, toSuffix: u.pushToken?.slice(-6) })) });
    if (messages.length > 0) await sendPushToTokens({ messages });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("❌ Webhook error:", e?.message);
    return res.status(500).json({ message: "Webhook error" });
  }
};

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
