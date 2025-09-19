import asyncHandler from "express-async-handler"
import { getAuth } from "@clerk/express"
import Comment from "../models/comment.model.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture isVerified")

  res.status(200).json({ comments })
})

export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req)
  const { postId } = req.params
  const { content } = req.body

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content is required" })
  }

  const user = await User.findOne({ clerkId: userId })
  const post = await Post.findById(postId)

  if (!user || !post) return res.status(404).json({ error: "User or post not found" })

  const comment = await Comment.create({
    user: user._id,
    post: postId,
    content,
  })

  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  })

  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      post: postId,
      comment: comment._id,
    })
  }

  const populatedComment = await Comment.findById(comment._id).populate(
    "user",
    "username firstName lastName profilePicture isVerified",
  )

  res.status(201).json({ comment: populatedComment })
})

export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req)
  const { commentId } = req.params

  const user = await User.findOne({ clerkId: userId })
  const comment = await Comment.findById(commentId)

  if (!user || !comment) {
    return res.status(404).json({ error: "User or comment not found" })
  }

  if (comment.user.toString() !== user._id.toString()) {
    return res.status(403).json({ error: "You can only delete your own comments" })
  }

  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  })

  await Comment.findByIdAndDelete(commentId)

  res.status(200).json({ message: "Comment deleted successfully" })
})

// NEW FUNCTIONALITY TO LIKE A COMMENT
export const likeComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req)
  const { commentId } = req.params

  const user = await User.findOne({ clerkId: userId })
  const comment = await Comment.findById(commentId)

  if (!user || !comment) {
    return res.status(404).json({ error: "User or comment not found" })
  }

  const isLiked = comment.likes.some((id) => id.toString() === user._id.toString())

  if (isLiked) {
    // Unlike
    await Comment.findByIdAndUpdate(commentId, { $pull: { likes: user._id } })
  } else {
    // Like (avoid duplicates)
    await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: user._id } })
  }

  const updatedComment = await Comment.findById(commentId).populate(
    "user",
    "username firstName lastName profilePicture isVerified",
  )

  res.status(200).json({
    message: isLiked ? "Comment unliked" : "Comment liked",
    comment: updatedComment,
  })
})