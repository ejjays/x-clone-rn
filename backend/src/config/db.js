import mongoose from "mongoose"
import { ENV } from "./env.js"

export const connectDB = async () => {
  try {
    // Check if MONGODB_URI exists
    if (!ENV.MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable is not set")
      process.exit(1)
    }

    console.log("🔄 Attempting to connect to MongoDB...")

    await mongoose.connect(ENV.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    })

    console.log("✅ Connected to MongoDB successfully!")
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message)
    console.error("Full error:", error)
    process.exit(1)
  }
}
