import { StreamChat } from "stream-chat"
import User from "../models/user.model.js"

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    // Get user ID from Clerk auth
    const { userId } = req.auth()

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no user ID" })
    }

    console.log("🔄 Getting Stream token for user:", userId)

    // Get user from database using Clerk ID
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return res.status(404).json({ error: "User not found in database" })
    }

    // Create Stream user object
    const streamUser = {
      id: userId, // Use Clerk ID as Stream user ID
      name: `${user.firstName} ${user.lastName}`.trim(),
      image: user.profilePicture || `https://getstream.io/random_png/?name=${user.firstName}`,
      firstName: user.firstName,
      lastName: user.lastName,
    }

    // Create or update user in Stream
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
    const { userId } = req.auth()
    const { otherUserId } = req.body

    if (!userId || !otherUserId) {
      return res.status(400).json({ error: "Missing user IDs" })
    }

    console.log("🔄 Creating channel between:", userId, "and", otherUserId)

    // Get both users from database
    const [currentUser, otherUser] = await Promise.all([
      User.findOne({ clerkId: userId }),
      User.findOne({ clerkId: otherUserId }),
    ])

    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: "One or both users not found" })
    }

    // Create Stream user objects
    const streamUsers = [
      {
        id: userId,
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        image: currentUser.profilePicture || `https://getstream.io/random_png/?name=${currentUser.firstName}`,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      },
      {
        id: otherUserId,
        name: `${otherUser.firstName} ${otherUser.lastName}`.trim(),
        image: otherUser.profilePicture || `https://getstream.io/random_png/?name=${otherUser.firstName}`,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
      },
    ]

    // Create or update users in Stream
    await serverClient.upsertUsers(streamUsers)
    console.log("✅ Both users upserted in Stream")

    // Create channel ID (consistent ordering)
    const channelId = [userId, otherUserId].sort().join("-")

    // Create channel with metadata
    const channel = serverClient.channel("messaging", channelId, {
      members: [userId, otherUserId],
      created_by_id: userId,
      // Store user info for easy access
      user1: streamUsers[0],
      user2: streamUsers[1],
    })

    await channel.create()
    console.log("✅ Channel created:", channelId)

    res.json({
      channelId,
      channel: {
        id: channelId,
        type: "messaging",
        members: [userId, otherUserId],
      },
    })
  } catch (error) {
    console.error("❌ Create channel error:", error)
    res.status(500).json({ error: "Failed to create channel" })
  }
}
