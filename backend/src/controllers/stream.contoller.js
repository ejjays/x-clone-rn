import { StreamChat } from "stream-chat"

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.auth().userId

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    console.log("🔄 Getting Stream token for user:", userId)

    // Create or update user in Stream
    await serverClient.upsertUser({
      id: userId,
      name: req.auth().sessionClaims?.firstName || "User",
    })

    console.log("✅ Stream user created/updated:", userId)

    // Generate token
    const token = serverClient.createToken(userId)

    res.json({ token })
  } catch (error) {
    console.error("❌ Stream token error:", error)
    res.status(500).json({ message: "Failed to generate Stream token" })
  }
}

export const createChannel = async (req, res) => {
  try {
    const userId = req.auth().userId
    const { otherUserId, otherUserName } = req.body

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" })
    }

    console.log("🔄 Creating channel between:", userId, "and", otherUserId)

    // Create channel ID
    const channelId = `messaging__${userId}`

    // Create channel
    const channel = serverClient.channel("messaging", channelId, {
      name: `${req.auth().sessionClaims?.firstName || "User"} & ${otherUserName}`,
      members: [userId, otherUserId],
      created_by_id: userId,
    })

    await channel.create()

    console.log("✅ Channel created:", channelId)

    res.json({ channelId })
  } catch (error) {
    console.error("❌ Create channel error:", error)
    res.status(500).json({ message: "Failed to create channel" })
  }
}
