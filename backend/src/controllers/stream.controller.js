import { StreamChat } from "stream-chat"
import { ENV } from "../config/env.js"

// Initialize Stream Chat client
const serverClient = StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_SECRET_KEY)

// Get Stream Chat token for authenticated user
export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" })
    }

    console.log("🎫 Generating Stream token for user:", userId)

    // Generate token for the user
    const token = serverClient.createToken(userId)

    res.json({
      token,
      apiKey: ENV.STREAM_API_KEY,
      userId,
    })
  } catch (error) {
    console.error("❌ Error generating Stream token:", error)
    res.status(500).json({
      error: "Failed to generate Stream token",
      message: error.message,
    })
  }
}

// Create a new channel
export const createChannel = async (req, res) => {
  try {
    const { userId } = req.auth
    const { type = "messaging", members, name, image } = req.body

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" })
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "Members array is required" })
    }

    // Ensure the current user is included in members
    const allMembers = [...new Set([userId, ...members])]

    console.log("📝 Creating channel with members:", allMembers)

    // Generate a unique channel ID
    const channelId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create the channel
    const channel = serverClient.channel(type, channelId, {
      name: name || `Chat ${channelId}`,
      image: image || null,
      created_by_id: userId,
      members: allMembers,
    })

    // Create the channel on Stream's servers
    await channel.create(userId)

    console.log("✅ Channel created successfully:", channelId)

    res.json({
      channelId,
      type,
      members: allMembers,
      name: name || `Chat ${channelId}`,
      image,
    })
  } catch (error) {
    console.error("❌ Error creating channel:", error)
    res.status(500).json({
      error: "Failed to create channel",
      message: error.message,
    })
  }
}

// Get user's channels
export const getChannels = async (req, res) => {
  try {
    const { userId } = req.auth

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" })
    }

    console.log("📋 Fetching channels for user:", userId)

    // Query channels where the user is a member
    const filter = {
      type: "messaging",
      members: { $in: [userId] },
    }

    const sort = { last_message_at: -1 }
    const options = { limit: 30 }

    const channels = await serverClient.queryChannels(filter, sort, options)

    console.log(`✅ Found ${channels.length} channels for user:`, userId)

    // Format the response
    const formattedChannels = channels.map((channel) => ({
      id: channel.id,
      type: channel.type,
      name: channel.data.name,
      image: channel.data.image,
      members: channel.state.members,
      lastMessage: channel.state.messages[channel.state.messages.length - 1] || null,
      createdAt: channel.data.created_at,
      updatedAt: channel.data.updated_at,
    }))

    res.json({
      channels: formattedChannels,
      total: channels.length,
    })
  } catch (error) {
    console.error("❌ Error fetching channels:", error)
    res.status(500).json({
      error: "Failed to fetch channels",
      message: error.message,
    })
  }
}
