import express from "express"
import { getStreamToken, createChannel } from "../controllers/stream.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

// Get Stream token
router.get("/token", protectRoute, getStreamToken)

// Create channel
router.post("/channel", protectRoute, createChannel)

export default router
