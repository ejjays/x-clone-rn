import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { clerkMiddleware } from "@clerk/express"
import { connectDB } from "./config/db.js"
import { ENV } from "./config/env.js"

// Import routes
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import commentRoutes from "./routes/comment.route.js"
import notificationRoutes from "./routes/notification.route.js"
import streamRoutes from "./routes/stream.route.js"

dotenv.config()

const app = express()
const PORT = ENV.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(clerkMiddleware())

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "X Clone API is running!",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!ENV.MONGODB_URI,
      hasClerkKeys: !!(ENV.CLERK_PUBLISHABLE_KEY && ENV.CLERK_SECRET_KEY),
      hasCloudinary: !!(ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY),
      hasStream: !!(ENV.STREAM_API_KEY && ENV.STREAM_SECRET_KEY),
    },
  })
})

// API health check
app.get("/api", (req, res) => {
  res.json({
    message: "API is healthy!",
    timestamp: new Date().toISOString(),
    status: "ok",
  })
})

// Connect to database with better error handling
try {
  await connectDB()
  console.log("✅ Database connected successfully")
} catch (error) {
  console.error("❌ Database connection failed:", error)
  // Don't exit in production, let the app run without DB for debugging
  if (process.env.NODE_ENV !== "production") {
    process.exit(1)
  }
}

// Routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/stream", streamRoutes)

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Global error handler:", err)
  console.error("❌ Error stack:", err.stack)

  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  })
})

// Start server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

export default app
