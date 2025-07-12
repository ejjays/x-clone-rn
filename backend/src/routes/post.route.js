// backend/src/routes/post.route.js
import express from "express";
import { createPost, deletePost, getPost, getPosts, getUserPosts, reactToPost } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:postId", getPost);
router.get("/user/:username", getUserPosts);

// Protected routes
router.post("/", protectRoute, upload.single("media"), createPost);
router.post("/:postId/react", protectRoute, reactToPost);
router.delete("/:postId", protectRoute, deletePost);

export default router;