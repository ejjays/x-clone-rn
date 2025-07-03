import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import { ENV } from "./config/env.js"
import { clerkMiddleware } from "@clerk/express"
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js"

// Import routes
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import commentRoutes from "./routes/comment.route.js"
import notificationRoutes from "./routes/notification.route.js"
import streamRoutes from "./routes/stream.route.js"

dotenv.config()

const app = express()
const PORT = ENV.PORT || 8080

// Connect to database
connectDB()

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Clerk middleware
app.use(clerkMiddleware())

// Arcjet middleware
app.use(arcjetMiddleware)

// Routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/stream", streamRoutes)

// Health check
app.get("/", (req, res) => {
  res.json({ message: "X Clone API is running!" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
