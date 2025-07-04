import { StreamChat } from "stream-chat"
import { ENV } from "../config/env.js"

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    console.log("🔑 Generating Stream token for user:", userId)

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
      details: error.message,
    })
  }
}

export const createChannel = async (req, res) => {
  try {
    const { userId } = req.auth
    const { type = "messaging", id, name, members = [] } = req.body

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    console.log("📺 Creating channel:", { type, id, name, members })

    // Ensure the creator is in the members list
    const allMembers = [...new Set([userId, ...members])]

    // Create or get channel
    const channel = serverClient.channel(type, id, {
      name: name || `Channel ${id}`,
      members: allMembers,
      created_by_id: userId,
    })

    // Create the channel
    await channel.create(userId)

    res.json({
      success: true,
      channel: {
        id: channel.id,
        type: channel.type,
        name: channel.data.name,
        members: allMembers,
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

export const getChannels = async (req, res) => {
  try {
    const { userId } = req.auth

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    console.log("📋 Getting channels for user:", userId)

    // Query channels where the user is a member
    const filter = { members: { $in: [userId] } }
    const sort = { last_message_at: -1 }
    const options = { limit: 30 }

    const channels = await serverClient.queryChannels(filter, sort, options)

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
      total: channelData.length,
    })
  } catch (error) {
    console.error("❌ Error getting channels:", error)
    res.status(500).json({
      error: "Failed to get channels",
      details: error.message,
    })
  }
}
