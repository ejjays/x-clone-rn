import { StreamChat } from "stream-chat"

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY)

export const getStreamToken = async (req, res) => {
  try {
    console.log("🔄 Getting Stream token for user:", req.auth().userId)

    const userId = req.auth().userId

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    // Create or update user in Stream
    const user = {
      id: userId,
      name: `${req.user?.firstName || "User"} ${req.user?.lastName || ""}`.trim(),
      image: req.user?.profilePicture || `https://getstream.io/random_png/?name=${userId}`,
    }

    await serverClient.upsertUser(user)
    console.log("✅ Stream user created/updated:", userId)

    // Generate token
    const token = serverClient.createToken(userId)

    res.json({
      token,
      user: {
        id: userId,
        name: user.name,
        image: user.image,
      },
    })
  } catch (error) {
    console.error("Stream token error:", error)
    res.status(500).json({ error: "Failed to generate Stream token" })
  }
}

export const createChannel = async (req, res) => {
  try {
    const { members, name, type = "messaging" } = req.body
    const userId = req.auth().userId

    if (!members || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ error: "At least 2 members are required" })
    }

    // Create channel ID from sorted member IDs for consistency
    const sortedMembers = [...members].sort()
    const channelId = `${type}_${sortedMembers.join("_")}`

    const channel = serverClient.channel(type, channelId, {
      name: name || `Chat between ${members.length} users`,
      members,
      created_by_id: userId,
    })

    await channel.create()

    res.json({
      channelId,
      channel: {
        id: channelId,
        type,
        name: channel.data.name,
        members,
      },
    })
  } catch (error) {
    console.error("Create channel error:", error)
    res.status(500).json({ error: "Failed to create channel" })
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
    console.error("Get channels error:", error)
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
    console.error("Send message error:", error)
    res.status(500).json({ error: "Failed to send message" })
  }
}
