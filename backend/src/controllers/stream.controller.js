import { StreamChat } from "stream-chat"
import User from "../models/user.model.js"

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    console.log("🔄 Getting Stream token for user:", req.auth().userId)

    const userId = req.auth().userId

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    // Get user from database
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create or update user in Stream
    const streamUser = {
      id: userId,
      name: `${user.firstName || "User"} ${user.lastName || ""}`.trim(),
      image: user.profilePicture || `https://getstream.io/random_png/?name=${userId}`,
    }

    await serverClient.upsertUser(streamUser)
    console.log("✅ Stream user created/updated:", userId)

    // Generate token
    const token = serverClient.createToken(userId)

    res.json({
      token,
      user: streamUser,
    })
  } catch (error) {
    console.error("❌ Stream token error:", error)
    res.status(500).json({ error: "Failed to generate Stream token" })
  }
}

export const createChannel = async (req, res) => {
  try {
    const { members, name, type = "messaging" } = req.body
    const userId = req.auth().userId

    console.log("🔄 Creating channel request:", { members, name, type, userId })

    if (!members || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ error: "At least 2 members are required" })
    }

    // Validate that all member IDs exist in our database
    for (const memberId of members) {
      if (!memberId) {
        return res.status(400).json({ error: "Invalid member ID" })
      }

      // Check if user exists in our database
      const user = await User.findOne({ clerkId: memberId })
      if (!user) {
        console.error(`❌ User not found in database: ${memberId}`)
        return res.status(404).json({ error: `User ${memberId} not found` })
      }
    }

    // Create channel ID from sorted member IDs for consistency
    const sortedMembers = [...members].sort()
    const channelId = `${type}_${sortedMembers.join("_")}`

    console.log("🔄 Creating Stream channel:", channelId)

    const channel = serverClient.channel(type, channelId, {
      name: name || `Chat between ${members.length} users`,
      members,
      created_by_id: userId,
    })

    const channelResponse = await channel.create()
    console.log("✅ Stream channel created successfully:", channelId)

    res.json({
      channelId,
      channel: {
        id: channelId,
        type,
        name: channel.data.name,
        members,
        created_by: userId,
      },
    })
  } catch (error) {
    console.error("❌ Create channel error:", error)
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    })
    res.status(500).json({
      error: "Failed to create channel",
      details: error.message,
    })
  }
}

export const getChannels = async (req, res) => {
  try {
    const userId = req.auth().userId

    const filter = { members: { $in: [userId] } }
    const sort = { last_message_at: -1 }

    const channels = await serverClient.queryChannels(filter, sort, {
      state: true,
      watch: false,
      presence: false,
    })

    const channelData = channels.map((channel) => ({
      id: channel.id,
      type: channel.type,
      name: channel.data.name,
      members: channel.state.members,
      lastMessage: channel.state.messages.length > 0 ? channel.state.messages[channel.state.messages.length - 1] : null,
      unreadCount: channel.countUnread(userId),
    }))

    res.json({ channels: channelData })
  } catch (error) {
    console.error("❌ Get channels error:", error)
    res.status(500).json({ error: "Failed to get channels" })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params
    const { text, type = "messaging" } = req.body
    const userId = req.auth().userId

    if (!text) {
      return res.status(400).json({ error: "Message text is required" })
    }

    const channel = serverClient.channel(type, channelId)

    const message = await channel.sendMessage({
      text,
      user_id: userId,
    })

    res.json({ message })
  } catch (error) {
    console.error("❌ Send message error:", error)
    res.status(500).json({ error: "Failed to send message" })
  }
}
