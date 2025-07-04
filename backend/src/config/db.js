import mongoose from "mongoose"
import { ENV } from "./env.js"

export const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")

    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      // Remove deprecated options that cause warnings
      // useNewUrlParser and useUnifiedTopology are no longer needed in newer versions
    })

    console.log("📡 Mongoose connected to MongoDB")
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    return conn
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    throw error
  }
}

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected from MongoDB")
})

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close()
    console.log("🔒 MongoDB connection closed through app termination")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error)
    process.exit(1)
  }
})
