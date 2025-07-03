import { StreamChat } from "stream-chat"
import User from "../models/user.model.js"

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.auth().userId

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Get user from database
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create or update user in Stream
    await serverClient.upsertUser({
      id: userId,
      name: `${user.firstName} ${user.lastName}`.trim(),
      image: user.profilePicture || `https://getstream.io/random_png/?name=${user.firstName}`,
    })

    // Generate token
    const token = serverClient.createToken(userId)

    res.json({
      token,
      user: {
        id: userId,
        name: `${user.firstName} ${user.lastName}`.trim(),
        image: user.profilePicture || `https://getstream.io/random_png/?name=${user.firstName}`,
      },
    })
  } catch (error) {
    console.error("❌ Stream token error:", error)
    res.status(500).json({ error: "Failed to generate Stream token" })
  }
}

export const createChannel = async (req, res) => {
  try {
    const { otherUserId } = req.body
    const currentUserId = req.auth().userId

    if (!currentUserId || !otherUserId) {
      return res.status(400).json({ error: "Missing user IDs" })
    }

    // Get both users from database
    const [currentUser, otherUser] = await Promise.all([
      User.findOne({ clerkId: currentUserId }),
      User.findOne({ clerkId: otherUserId }),
    ])

    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create or update users in Stream
    await Promise.all([
      serverClient.upsertUser({
        id: currentUserId,
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        image: currentUser.profilePicture || `https://getstream.io/random_png/?name=${currentUser.firstName}`,
      }),
      serverClient.upsertUser({
        id: otherUserId,
        name: `${otherUser.firstName} ${otherUser.lastName}`.trim(),
        image: otherUser.profilePicture || `https://getstream.io/random_png/?name=${otherUser.firstName}`,
      }),
    ])

    // Create channel ID (consistent ordering)
    const channelId = [currentUserId, otherUserId].sort().join("-")

    // Create channel
    const channel = serverClient.channel("messaging", channelId, {
      members: [currentUserId, otherUserId],
      created_by_id: currentUserId,
      // Store user info for easy access
      user1: {
        id: currentUserId,
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        image: currentUser.profilePicture || `https://getstream.io/random_png/?name=${currentUser.firstName}`,
      },
      user2: {
        id: otherUserId,
        name: `${otherUser.firstName} ${otherUser.lastName}`.trim(),
        image: otherUser.profilePicture || `https://getstream.io/random_png/?name=${otherUser.firstName}`,
      },
    })

    await channel.create()

    res.json({
      channelId,
      channel: {
        id: channelId,
        type: "messaging",
        members: [currentUserId, otherUserId],
      },
    })
  } catch (error) {
    console.error("❌ Create channel error:", error)
    res.status(500).json({ error: "Failed to create channel" })
  }
}
