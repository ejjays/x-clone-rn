import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getStreamToken, createChannel, getChannels, streamWebhook } from "../controllers/stream.controller.js"

const router = express.Router()

// All routes are protected
router.get("/token", protectRoute, getStreamToken)
router.post("/channel", protectRoute, createChannel)
router.get("/channels", protectRoute, getChannels)
// Webhook endpoint (Stream requires public endpoint). Add request signature verification in production if desired.
router.post("/webhook", express.json({ type: "application/json" }), streamWebhook)

export default router
