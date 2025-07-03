import { StreamChat } from "stream-chat"
import { ENV } from "../config/env.js"

const serverClient = StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    console.log("🔑 Generating Stream token for user:", userId)

    const token = serverClient.createToken(userId)

    res.json({ token })
  } catch (error) {
    console.error("❌ Error generating Stream token:", error)
    res.status(500).json({ error: "Failed to generate token" })
  }
}

export const createChannel = async (req, res) => {
  try {
    const { userId } = req.auth
    const { type = "messaging", members, name } = req.body

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "Members array is required" })
    }

    // Ensure the current user is included in members
    const allMembers = [...new Set([userId, ...members])]

    // Create a consistent channel ID
    const sortedMembers = allMembers.sort()
    const channelId = `channel_${sortedMembers.join("_")}`

    console.log("🔄 Creating channel:", { channelId, type, members: allMembers })

    const channel = serverClient.channel(type, channelId, {
      name: name || `Chat with ${allMembers.length} members`,
      members: allMembers,
      created_by_id: userId,
    })

    await channel.create(userId)

    console.log("✅ Channel created successfully:", channelId)

    res.json({
      channel: {
        id: channelId,
        type,
        members: allMembers,
        name: channel.data.name,
      },
    })
  } catch (error) {
    console.error("❌ Error creating channel:", error)

    if (error.message?.includes("already exists")) {
      return res.status(409).json({ error: "Channel already exists" })
    }

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
      return res.status(401).json({ error: "Unauthorized" })
    }

    console.log("📋 Fetching channels for user:", userId)

    const filter = { members: { $in: [userId] } }
    const sort = { last_message_at: -1 }

    const channels = await serverClient.queryChannels(filter, sort, {
      watch: false,
      state: true,
    })

    console.log("✅ Found channels:", channels.length)

    res.json({ channels })
  } catch (error) {
    console.error("❌ Error fetching channels:", error)
    res.status(500).json({ error: "Failed to fetch channels" })
  }
}
