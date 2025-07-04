import { clerkClient } from "@clerk/express"; // <-- ADD THIS LINE
import { StreamChat } from "stream-chat";
import { ENV } from "../config/env.js";
import User from "../models/user.model.js";

// (The getStreamToken function is unchanged)
export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findOne({ clerkId: userId }).select(
      "firstName lastName profilePicture",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    console.log("🎫 Generating Stream token for user:", userId);

    const token = serverClient.createToken(userId);

    const streamUser = {
      id: userId,
      name: `${user.firstName} ${user.lastName}`,
      image: user.profilePicture,
    };

    console.log("✅ Stream token generated successfully");

    res.json({
      token,
      user: streamUser,
    });
  } catch (error) {
    console.error("❌ Error generating Stream token:", error);
    res.status(500).json({
      error: "Failed to generate Stream token",
      details: error.message,
    });
  }
};

// Create a new channel
export const createChannel = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { type = "messaging", members = [] } = req.body;

    const otherMemberId = members.find((member) => member !== userId);

    if (!userId || !otherMemberId) {
      return res
        .status(400)
        .json({ error: "Both user IDs are required to create a channel." });
    }

    const clerkUser = await clerkClient.users.getUser(otherMemberId);

    const channelName =
      `Conversation with ${clerkUser.firstName} ${clerkUser.lastName}` ||
      `Channel with ${otherMemberId}`;

    const channel = serverClient.channel(type, {
      name: channelName,
      members: [userId, otherMemberId],
      created_by_id: userId,
    });

    await channel.create();

    res.status(201).json({ channelId: channel.id });
  } catch (error) {
    console.error("❌ Error creating channel:", error);
    res.status(500).json({
      error: "Failed to create channel",
      details: error.message,
    });
  }
};

// (The getChannels function is unchanged)
export const getChannels = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log("📋 Fetching channels for user:", userId);

    const filter = { members: { $in: [userId] } };
    const sort = { last_message_at: -1 };
    const options = { limit: 30 };

    const channels = await serverClient.queryChannels(filter, sort, options);

    console.log("✅ Channels fetched successfully:", channels.length);

    const channelData = channels.map((channel) => ({
      id: channel.id,
      type: channel.type,
      name: channel.data.name,
      members: channel.state.members,
      last_message_at: channel.state.last_message_at,
      member_count: channel.state.member_count,
    }));

    res.json({
      channels: channelData,
    });
  } catch (error) {
    console.error("❌ Error fetching channels:", error);
    res.status(500).json({
      error: "Failed to fetch channels",
      details: error.message,
    });
  }
};