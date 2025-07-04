import { StreamChat } from "stream-chat"
import { ENV } from "../config/env.js"

// Initialize Stream Chat client
const serverClient = StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_SECRET_KEY)

// Generate Stream Chat token for user
export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    console.log("🎫 Generating Stream token for user:", userId)

    // Generate token for the user
    const token = serverClient.createToken(userId)

    console.log("✅ Stream token generated successfully")

    res.json({
      token,
      apiKey: ENV.STREAM_API_KEY,
      userId,
    })
  } catch (error) {
    console.error("❌ Error generating Stream token:", error)
    res.status(500).json({
      error: "Failed to generate Stream token",
      details: error.message,
    })
  }
}

// Create a new channel
export const createChannel = async (req, res) => {
  try {
    const { userId } = req.auth
    const { type = "messaging", id, name, members = [] } = req.body

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    if (!id) {
      return res.status(400).json({ error: "Channel ID is required" })
    }

    console.log("📺 Creating channel:", { type, id, name, members, userId })

    // Ensure the current user is included in members
    const allMembers = [...new Set([userId, ...members])]

    // Create channel
    const channel = serverClient.channel(type, id, {
      name: name || `Channel ${id}`,
      members: allMembers,
      created_by_id: userId,
    })

    // Create the channel on Stream's servers
    await channel.create(userId)

    console.log("✅ Channel created successfully:", id)

    res.json({
      channel: {
        id: channel.id,
        type: channel.type,
        name: channel.data.name,
        members: allMembers,
        created_by: userId,
      },
    })
  } catch (error) {
    console.error("❌ Error creating channel:", error)
    res.status(500).json({
      error: "Failed to create channel",
      details: error.message,
    })
  }
}

// Get user's channels
export const getChannels = async (req, res) => {
  try {
    const { userId } = req.auth

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    console.log("📋 Fetching channels for user:", userId)

    // Query channels where user is a member
    const filter = { members: { $in: [userId] } }
    const sort = { last_message_at: -1 }
    const options = { limit: 30 }

    const channels = await serverClient.queryChannels(filter, sort, options)

    console.log("✅ Channels fetched successfully:", channels.length)

    const channelData = channels.map((channel) => ({
      id: channel.id,
      type: channel.type,
      name: channel.data.name,
      members: channel.state.members,
      last_message_at: channel.state.last_message_at,
      member_count: channel.state.member_count,
    }))

    res.json({
      channels: channelData,
    })
  } catch (error) {
    console.error("❌ Error fetching channels:", error)
    res.status(500).json({
      error: "Failed to fetch channels",
      details: error.message,
    })
  }
}
