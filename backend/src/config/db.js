import mongoose from "mongoose"
import { ENV } from "./env.js"

export const connectDB = async () => {
  try {
    if (!ENV.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables")
    }

    console.log("🔄 Connecting to MongoDB...")

    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    throw error
  }
}
