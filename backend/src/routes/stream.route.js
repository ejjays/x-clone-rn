import express from "express"
import { getStreamToken, createChannel } from "../controllers/stream.controller.js"
import { authenticateToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/token", authenticateToken, getStreamToken)
router.post("/channel", authenticateToken, createChannel)

export default router
