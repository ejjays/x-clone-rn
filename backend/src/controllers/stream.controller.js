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
    // Create or update user in Stream
    await serverClient.upsertUser({
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      image:
        user.profilePicture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`,
      username: user.username,
      email: user.email,
    })

    // Generate token for the user
    const token = serverClient.createToken(user._id.toString())

    res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        image: user.profilePicture,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("Stream Chat error:", error)
    res.status(500).json({ error: "Failed to generate Stream token" })
  }
})

export const createChannel = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req)
  const { type = "messaging", members, name } = req.body

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const user = await User.findOne({ clerkId: userId })
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  try {
    // Create channel
    const channel = serverClient.channel(type, {
      members: [user._id.toString(), ...members],
      created_by_id: user._id.toString(),
      name: name || `${user.firstName}'s conversation`,
    })

    await channel.create()

    res.status(201).json({
      channel: {
        id: channel.id,
        type: channel.type,
        members: channel.state.members,
      },
    })
  } catch (error) {
    console.error("Create channel error:", error)
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
    const filter = { members: { $in: [user._id.toString()] } }
    const sort = { last_message_at: -1 }
    const channels = await serverClient.queryChannels(filter, sort, {
      watch: false,
      state: true,
    })

    res.status(200).json({ channels })
  } catch (error) {
    console.error("Get channels error:", error)
    res.status(500).json({ error: "Failed to get channels" })
  }
})
