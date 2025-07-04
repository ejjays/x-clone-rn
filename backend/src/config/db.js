import mongoose from "mongoose"
import { ENV } from "./env.js"

export const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")

    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      // Remove deprecated options
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected to MongoDB")
    })

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("🔴 Mongoose disconnected from MongoDB")
    })

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log("🔴 MongoDB connection closed due to app termination")
      process.exit(0)
    })

    console.log("📡 Mongoose connected to MongoDB")
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    return conn
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    throw error
  }
}
