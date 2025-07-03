import "dotenv/config"
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { clerkMiddleware } from "@clerk/express"

import postRoutes from "./routes/post.route.js"
import commentRoutes from "./routes/comment.route.js"
import userRoutes from "./routes/user.route.js"
import notificationRoutes from "./routes/notification.route.js"
import streamRoutes from "./routes/stream.route.js" // 🔥 NEW

const app = express()
const port = process.env.PORT || 8080

// --- Middlewares ---
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(clerkMiddleware())

// --- Routes ---
app.get("/", (req, res) => {
  res.send("Server is running!")
})

// Your API routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/stream", streamRoutes) // 🔥 NEW

// --- Server Initialization ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server is running on port: ${port}`)
    })
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err)
    process.exit(1)
  })

export default app
