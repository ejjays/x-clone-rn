import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getStreamToken, createChannel, getChannels, sendMessage } from "../controllers/stream.controller.js"

const router = express.Router()

// Get Stream token for authenticated user
router.get("/token", protectRoute, getStreamToken)

// Create a new channel
router.post("/channels", protectRoute, createChannel)

// Get user's channels
router.get("/channels", protectRoute, getChannels)

// Send a message
router.post("/channels/:channelId/messages", protectRoute, sendMessage)

export default router
