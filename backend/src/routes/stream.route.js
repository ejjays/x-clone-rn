import express from "express"
import { getStreamToken, createChannel, getChannels, sendMessage } from "../controllers/stream.controller.js"
import { authenticateToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get Stream Chat token
router.get("/token", getStreamToken)

// Create a new channel (note: /channel not /channels for creation)
router.post("/channel", createChannel)

// Get user's channels
router.get("/channels", getChannels)

// Send message to channel
router.post("/channel/:channelId/message", sendMessage)

export default router
