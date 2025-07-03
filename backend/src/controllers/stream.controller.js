import { StreamChat } from "stream-chat"
import User from "../models/user.model.js"

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create or update user in Stream
    const streamUser = {
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.profilePicture || undefined,
    }

    await serverClient.upsertUser(streamUser)

    // Generate token
    const token = serverClient.createToken(user._id.toString())

    res.json({
      token,
      user: streamUser,
    })
  } catch (error) {
    console.error("Stream token error:", error)
    res.status(500).json({ error: "Failed to generate Stream token" })
  }
}

export const createChannel = async (req, res) => {
  try {
    const { otherUserId, channelName } = req.body
    const currentUserId = req.user.userId

    // Get both users
    const [currentUser, otherUser] = await Promise.all([User.findById(currentUserId), User.findById(otherUserId)])

    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create or update both users in Stream
    const streamUsers = [
      {
        id: currentUser._id.toString(),
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        image: currentUser.profilePicture || undefined,
      },
      {
        id: otherUser._id.toString(),
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        image: otherUser.profilePicture || undefined,
      },
    ]

    await serverClient.upsertUsers(streamUsers)

    // Create channel ID (consistent ordering)
    const channelId = [currentUserId, otherUserId].sort().join("-")

    // Create channel with proper metadata
    const channel = serverClient.channel("messaging", channelId, {
      members: [currentUserId, otherUserId],
      created_by_id: currentUserId,
      // Store user info for easy access
      user1: {
        id: currentUser._id.toString(),
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        image: currentUser.profilePicture || undefined,
      },
      user2: {
        id: otherUser._id.toString(),
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        image: otherUser.profilePicture || undefined,
      },
    })

    await channel.create()

    res.json({
      channelId,
      channel: channel.data,
    })
  } catch (error) {
    console.error("Create channel error:", error)
    res.status(500).json({ error: "Failed to create channel" })
  }
}
