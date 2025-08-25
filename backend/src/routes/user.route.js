import express from "express";
import {
  followUnfollowUser,
  getCurrentUser,
  getUserById,
  syncUser,
  updateUserProfile,
  getAllUsers,
  savePushToken,
  setPushPreferences,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/profile/:username", getUserById);

// Protected routes
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.get("/all", protectRoute, getAllUsers);
router.put("/profile", protectRoute, updateUserProfile);
router.post("/follow/:userId", protectRoute, followUnfollowUser);
router.post("/push/token", protectRoute, savePushToken);
router.post("/push/preferences", protectRoute, setPushPreferences);

export default router;