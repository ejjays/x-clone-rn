import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getStreamToken, createChannel } from "../controllers/stream.controller.js"

const router = express.Router()

// Get Stream Chat token
router.get("/token", protectRoute, getStreamToken)

// Create a new channel
router.post("/channel", protectRoute, createChannel)

export default router
