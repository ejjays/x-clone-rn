const express = require("express")
const { getStreamToken, createChannel } = require("../controllers/stream.controller")
const { authenticateToken } = require("../middleware/auth.middleware")

const router = express.Router()

// Get Stream token
router.get("/token", authenticateToken, getStreamToken)

// Create channel
router.post("/channel", authenticateToken, createChannel)

module.exports = router
