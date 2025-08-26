import mongoose from "mongoose"
import { ENV } from "./env.js"

// Cache the connection across lambda invocations in serverless environments
let cached = globalThis.__mongooseConnCache
if (!cached) {
  cached = globalThis.__mongooseConnCache = { conn: null, promise: null }
}

export const connectDB = async () => {
  try {
    if (cached.conn) {
      return cached.conn
    }

    if (!cached.promise) {
      if (!ENV.MONGODB_URI) {
        throw new Error("MONGODB_URI is not set")
      }

      console.log("🔄 Connecting to MongoDB...")

      // Conservative serverless-friendly options
      const options = {
        serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
        socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 5,
        minPoolSize: 0,
        // Disable command buffering so we fail fast when disconnected
        // You can also set mongoose.set('bufferCommands', false) globally if preferred
        // bufferCommands: false,
      }

      cached.promise = mongoose.connect(ENV.MONGODB_URI, options).then((mongooseInstance) => {
        // Connection event listeners (set once per process)
        if (!mongoose.connection._hasAppListeners) {
          mongoose.connection.on("connected", () => {
            console.log("🟢 Mongoose connected to MongoDB")
          })
          mongoose.connection.on("error", (err) => {
            console.error("❌ Mongoose connection error:", err)
          })
          mongoose.connection.on("disconnected", () => {
            console.log("🔴 Mongoose disconnected from MongoDB")
          })
          // Mark to avoid duplicate listeners on future cold starts
          mongoose.connection._hasAppListeners = true
        }

        console.log("📡 Mongoose connected to MongoDB")
        console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`)
        return mongooseInstance
      })
    }

    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    // Reset cached.promise on failure so subsequent requests can retry
    cached.promise = null
    throw error
  }
}
