import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getStreamToken, createChannel, getChannels } from "../controllers/stream.controller.js"

const router = express.Router()

// All routes are protected
router.get("/token", protectRoute, getStreamToken)
router.post("/channel", protectRoute, createChannel)
router.get("/channels", protectRoute, getChannels)

export default router
