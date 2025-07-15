import express from \"express\";
import {
  followUnfollowUser,
  getCurrentUser,
  getUserById,
  syncUser,
  updateUserProfile,
  getAllUsers,
} from \"../controllers/user.controller.js\";
import { protectRoute } from \"../middleware/auth.middleware.js\";

const router = express.Router();

// Public routes
router.get(\"/profile/:username\", getUserById);

// Protected routes
router.post(\"/sync\", protectRoute, syncUser);
router.get(\"/me\", protectRoute, getCurrentUser);
router.get(\"/all\", protectRoute, getAllUsers);
router.put(\"/profile\", protectRoute, updateUserProfile);
router.post(\"/follow/:userId\", protectRoute, followUnfollowUser);

export default router;