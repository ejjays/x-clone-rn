import express from "express"
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  syncUser,
  updateProfile,
  getAllUsers,
} from "../controllers/user.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

// Public routes
router.get("/profile/:username", getUserProfile)

// Protected routes
router.post("/sync", protectRoute, syncUser)
router.get("/me", protectRoute, getCurrentUser)
router.get("/all", protectRoute, getAllUsers)
router.put("/profile", protectRoute, updateProfile)
router.post("/follow/:targetUserId", protectRoute, followUser)

export default router
