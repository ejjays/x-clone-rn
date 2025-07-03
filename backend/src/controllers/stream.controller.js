import asyncHandler from "express-async-handler"
import { getAuth } from "@clerk/express"
import { StreamChat } from "stream-chat"
import User from "../models/user.model.js"
import { ENV } from "../config/env.js"

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_SECRET_KEY)

export const getStreamToken = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const user = await User.findOne({ clerkId: userId })
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  try {
    const streamUserId = user._id.toString()
    const streamUser = {
      id: streamUserId,
      name: `${user.firstName} ${user.lastName}`,
      image:
        user.profilePicture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`,
      username: user.username,
      email: user.email,
    }

    // Create or update user in Stream Chat
    await serverClient.upsertUser(streamUser)
    console.log(`✅ Stream user created/updated: ${streamUserId}`)

    // Generate token for the user
    const token = serverClient.createToken(streamUserId)

    res.status(200).json({
      token,
      user: streamUser,
    })
  } catch (error) {
    console.error("❌ Stream Chat error:", error)
    res.status(500).json({ error: "Failed to generate Stream token" })
  }
})

export const createChannel = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req)
  const { otherUserId, channelName } = req.body

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const user = await User.findOne({ clerkId: userId })
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  const otherUser = await User.findById(otherUserId)
  if (!otherUser) {
    return res.status(404).json({ error: "Other user not found" })
  }

  try {
    const currentUserId = user._id.toString()
    const targetUserId = otherUser._id.toString()

    // Ensure both users exist in Stream Chat
    await serverClient.upsertUser({
      id: currentUserId,
      name: `${user.firstName} ${user.lastName}`,
      image:
        user.profilePicture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`,
      username: user.username,
    })

    await serverClient.upsertUser({
      id: targetUserId,
      name: `${otherUser.firstName} ${otherUser.lastName}`,
      image:
        otherUser.profilePicture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.firstName + " " + otherUser.lastName)}&background=1877F2&color=fff&size=120`,
      username: otherUser.username,
    })

    console.log(`✅ Both users upserted: ${currentUserId}, ${targetUserId}`)

    // Create a unique channel ID based on user IDs
    const channelId = [currentUserId, targetUserId].sort().join("-")

    // Create channel
    const channel = serverClient.channel("messaging", channelId, {
      members: [currentUserId, targetUserId],
      created_by_id: currentUserId,
      name: channelName || `${user.firstName} & ${otherUser.firstName}`,
    })

    await channel.create()
    console.log(`✅ Channel created: ${channelId}`)

    res.status(201).json({
      channelId,
      channel: {
        id: channel.id,
        type: channel.type,
        members: [currentUserId, targetUserId],
      },
    })
  } catch (error) {
    console.error("❌ Create channel error:", error)
    res.status(500).json({ error: "Failed to create channel" })
  }
})

export const getChannels = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const user = await User.findOne({ clerkId: userId })
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  try {
    const streamUserId = user._id.toString()
    const filter = { members: { $in: [streamUserId] } }
    const sort = { last_message_at: -1 }
    const channels = await serverClient.queryChannels(filter, sort, {
      watch: false,
      state: true,
    })

    res.status(200).json({ channels })
  } catch (error) {
    console.error("❌ Get channels error:", error)
    res.status(500).json({ error: "Failed to get channels" })
  }
})
