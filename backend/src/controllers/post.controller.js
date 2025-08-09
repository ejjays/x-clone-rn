import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";

// --- HELPER TO POPULATE POSTS ---
const populatePost = (query) =>
  query
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    })
    .populate({
      path: "reactions.user",
      select: "username firstName lastName profilePicture",
    });

// --- CONTROLLERS ---
export const getPosts = asyncHandler(async (req, res) => {
  const posts = await populatePost(Post.find().sort({ createdAt: -1 }));
  res.status(200).json({ posts });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await populatePost(Post.findById(postId));
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.status(200).json({ post });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const posts = await populatePost(Post.find({ user: user._id }).sort({ createdAt: -1 }));
  res.status(200).json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  // FIX: We now receive mediaUrl and mediaType from the body, not a file.
  const { content, mediaUrl, mediaType } = req.body;

  if (!content && !mediaUrl) {
    return res.status(400).json({ error: "Post must contain either text or media" });
  }

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newPostData = {
    user: user._id,
    content: content || "",
  };

  // FIX: No more Cloudinary logic. Just save the URL provided by the client.
  if (mediaUrl && mediaType) {
    if (mediaType === 'image') {
      newPostData.image = mediaUrl;
    } else if (mediaType === 'video') {
      newPostData.video = mediaUrl;
    }
  }

  const newPost = await Post.create(newPostData);

  const populatedPost = await populatePost(Post.findById(newPost._id));
  res.status(201).json({ post: populatedPost });
});

export const reactToPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { reactionType } = req.body;

  const allowedReactions = ["like", "love", "haha", "wow", "sad", "angry", "celebrate"];
  if (!reactionType || !allowedReactions.includes(reactionType)) {
    return res.status(400).json({ error: "Invalid reaction type" });
  }

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "User or post not found" });
  }

  const existingReactionIndex = post.reactions.findIndex((reaction) => reaction.user.toString() === user._id.toString());

  if (existingReactionIndex > -1) {
    if (post.reactions[existingReactionIndex].type === reactionType) {
      post.reactions.splice(existingReactionIndex, 1);
    } else {
      post.reactions[existingReactionIndex].type = reactionType;
    }
  } else {
    post.reactions.push({ user: user._id, type: reactionType });
    if (post.user.toString() !== user._id.toString()) {
      await Notification.create({
        from: user._id,
        to: post.user,
        type: "like",
        post: postId,
      });
    }
  } 

  await post.save();
  const updatedPost = await populatePost(Post.findById(postId));
  res.status(200).json({ post: updatedPost, message: "Reaction updated successfully" });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "User or post not found" });
  }

  // Allow deletion if user is admin OR owns the post
  const isOwner = post.user.toString() === user._id.toString();
  const isAdmin = user.isAdmin === true;

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "You can only delete your own posts" });
  }

  await Comment.deleteMany({ post: postId });
  await Post.findByIdAndDelete(postId);

  const message = isAdmin && !isOwner ? 
    "Post deleted by admin" : 
    "Post deleted successfully";
  
  res.status(200).json({ message });
});