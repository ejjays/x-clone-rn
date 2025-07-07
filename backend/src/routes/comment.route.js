import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { createComment, getComments, deleteComment, likeComment } from "../controllers/comment.controller.js"

const router = express.Router()

// Public routes
router.get("/post/:postId", getComments)

// Protected routes
router.post("/post/:postId", protectRoute, createComment)
router.delete("/:commentId", protectRoute, deleteComment)

// NEW ROUTE FOR LIKING A COMMENT
router.post("/:commentId/like", protectRoute, likeComment)

export default router