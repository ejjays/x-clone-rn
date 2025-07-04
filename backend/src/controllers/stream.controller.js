import { StreamChat } from "stream-chat";
import { ENV } from "../config/env.js";
import User from "../models/user.model.js"; // Make sure to import the User model

// Initialize Stream Chat client
const serverClient = StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_SECRET_KEY);

// Generate Stream Chat token for user
export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // --- FIX STARTS HERE ---
    // Find the user in your database to get their details
    const user = await User.findOne({ clerkId: userId }).select("firstName lastName profilePicture");

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    console.log("🎫 Generating Stream token for user:", userId);

    // Generate token for the user
    const token = serverClient.createToken(userId);

    // Create the user object that the Stream client expects
    const streamUser = {
      id: userId,
      name: `${user.firstName} ${user.lastName}`,
      image: user.profilePicture,
    };
    
    console.log("✅ Stream token generated successfully");

    // Return the full user object along with the token
    res.json({
      token,
      user: streamUser,
    });
    // --- FIX ENDS HERE ---

  } catch (error) {
    console.error("❌ Error generating Stream token:", error);
    res.status(500).json({
      error: "Failed to generate Stream token",
      details: error.message,
    });
  }
};

// Create a new channel (No changes needed here, but kept for context)
export const createChannel = async (req, res) => {
  try {
    const { userId } = req.auth
    const { type = "messaging", members = [] } = req.body

    const otherMember = members.find((member) => member !== userId)
    const clerkUser = await clerkClient.users.getUser(otherMember)

    const channelName =
      `Conversation with ${clerkUser.firstName} ${clerkUser.lastName}` || `Channel with ${otherMember}`

    if (!userId || !otherMember) {
      return res.status(400).json({ error: "User ID and other member ID are required" })
    }

    const channel = serverClient.channel(type, {
      name: channelName,
      members: [userId, otherMember],
      created_by_id: userId,
    })

    await channel.create()

    res.status(201).json({ channelId: channel.id })
  } catch (error) {
    console.error("❌ Error creating channel:", error)
    res.status(500).json({ error: "Failed to create channel" })
  }
}

// Get user's channels (No changes needed here)
export const getChannels = async (req, res) => {
  try {
    const { userId } = req.auth

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    const filter = { members: { $in: [userId] } }
    const sort = { last_message_at: -1 }

    const channels = await serverClient.queryChannels(filter, sort, {
      watch: true,
      state: true,
    })

    res.status(200).json({ channels })
  } catch (error) {
    console.error("❌ Error fetching channels:", error)
    res.status(500).json({ error: "Failed to fetch channels" })
  }
}