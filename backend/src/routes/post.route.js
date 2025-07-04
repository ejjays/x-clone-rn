import express from "express"
import { createPost, deletePost, getPost, getPosts, getUserPosts, likePost } from "../controllers/post.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"
import upload from "../middleware/upload.middleware.js"

const router = express.Router()

// Public routes
router.get("/", getPosts)
router.get("/:postId", getPost)
router.get("/user/:username", getUserPosts)

// Protected routes
router.post("/", protectRoute, upload.single("image"), createPost)
router.post("/:postId/like", protectRoute, likePost)
router.delete("/:postId", protectRoute, deletePost)

export default router
