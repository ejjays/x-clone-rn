import { StreamChat } from "stream-chat"
import User from "../models/user.model.js"

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user.userId
    console.log("🔄 Getting Stream token for user:", userId)

    // Get user from database
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create or update user in Stream
    const streamUser = {
      id: userId,
      name: `${user.firstName} ${user.lastName}`,
      image: user.profilePicture || "",
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
    res.status(500).json({ error: "Failed to get Stream token" })
  }
}

export const createChannel = async (req, res) => {
  try {
    const currentUserId = req.user.userId
    const { members, name } = req.body

    console.log("🔄 Creating channel with members:", members)

    if (!members || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ error: "Invalid members array" })
    }

    // Validate that all member IDs exist
    for (const memberId of members) {
      if (!memberId) {
        return res.status(400).json({ error: "Invalid member ID" })
      }
    }

    // Create channel ID
    const channelId = `messaging__${currentUserId}`

    // Create channel
    const channel = serverClient.channel("messaging", channelId, {
      name: name || "Direct Message",
      members: members,
      created_by_id: currentUserId,
    })

    await channel.create()
    console.log("✅ Channel created successfully:", channelId)

    res.json({ channelId })
  } catch (error) {
    console.error("❌ Create channel error:", error)
    res.status(500).json({ error: "Failed to create channel" })
  }
}

export const getChannels = async (req, res) => {
  try {
    const userId = req.user.userId

    // Get channels for user
    const filter = { members: { $in: [userId] } }
    const sort = { last_message_at: -1 }

    const channels = await serverClient.queryChannels(filter, sort, {
      watch: false,
      state: true,
    })

    res.json({ channels })
  } catch (error) {
    console.error("❌ Get channels error:", error)
    res.status(500).json({ error: "Failed to get channels" })
  }
}
