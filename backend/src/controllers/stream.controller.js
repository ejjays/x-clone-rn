const StreamChat = require("stream-chat").StreamChat
const User = require("../models/user.model")

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY)

// Get Stream token for user
const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.user

    // Get user from database
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    console.log("🔄 Creating Stream user for:", user._id)

    // Create or update user in Stream
    const streamUser = {
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      image: user.profilePicture || "",
      username: user.username,
    }

    // Upsert user in Stream
    await serverClient.upsertUser(streamUser)
    console.log("✅ Stream user created/updated:", streamUser.id)

    // Generate token
    const token = serverClient.createToken(user._id.toString())

    res.status(200).json({
      token,
      user: streamUser,
    })
  } catch (error) {
    console.error("❌ Stream token error:", error)
    res.status(500).json({ error: "Failed to generate Stream token" })
  }
}

// Create channel between two users
const createChannel = async (req, res) => {
  try {
    const { userId } = req.user
    const { otherUserId, channelName } = req.body

    console.log("🔄 Creating channel between:", userId, "and", otherUserId)

    // Get both users from database
    const [currentUser, otherUser] = await Promise.all([User.findOne({ clerkId: userId }), User.findById(otherUserId)])

    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: "One or both users not found" })
    }

    // Create Stream users for both
    const streamUsers = [
      {
        id: currentUser._id.toString(),
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        image: currentUser.profilePicture || "",
        username: currentUser.username,
      },
      {
        id: otherUser._id.toString(),
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        image: otherUser.profilePicture || "",
        username: otherUser.username,
      },
    ]

    // Upsert both users in Stream
    await serverClient.upsertUsers(streamUsers)
    console.log("✅ Both Stream users created/updated")

    // Create channel ID
    const channelId = `${currentUser._id}-${otherUser._id}`

    // Create channel
    const channel = serverClient.channel("messaging", channelId, {
      name: channelName,
      members: [currentUser._id.toString(), otherUser._id.toString()],
      created_by_id: currentUser._id.toString(),
    })

    await channel.create()
    console.log("✅ Channel created:", channelId)

    res.status(201).json({
      channelId,
      channel: {
        id: channelId,
        name: channelName,
        members: streamUsers,
      },
    })
  } catch (error) {
    console.error("❌ Channel creation error:", error)
    res.status(500).json({ error: "Failed to create channel" })
  }
}

module.exports = {
  getStreamToken,
  createChannel,
}
