import { setupStreamWebhook } from './config/streamWebhook.js';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

// Import routes
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";
import streamRoutes from "./routes/stream.route.js";
import uploadRoutes from "./routes/upload.route.js";
import pushRoutes from "./routes/push.route.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = ENV.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://x-clone-rn-one.vercel.app", "https://x-clone-qelkhtfz5-ejjays-projects.vercel.app"]
        : ["http://localhost:3000", "http://localhost:8081"],
    credentials: true,
  }),
);

// FIX: Increased payload size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(clerkMiddleware());

// Quick DB readiness check middleware with on-demand reconnect (skip health)
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api') || req.path === '/api/health') {
    return next();
  }
  // Bypass DB readiness for webhook config/setup endpoints to allow diagnostics
  const url = req.originalUrl || req.path;
  if (
    url.startsWith('/api/push/stream-webhook') ||
    url.startsWith('/api/push/debug-webhook-setup') ||
    url.startsWith('/api/push/debug-webhook-config') ||
    // Allow upload auth endpoints to work even if DB is not ready
    url.startsWith('/api/upload/imagekit/auth') ||
    url.startsWith('/api/upload/signature')
  ) {
    return next();
  }
  if (mongoose.connection?.readyState === 1) {
    return next();
  }
  try {
    await connectDB();
  } catch {}
  if (mongoose.connection?.readyState !== 1) {
    return res.status(503).json({ error: 'Service Unavailable', message: 'Database not connected yet, please retry.' });
  }
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "X Clone API is running!",
    timestamp: new Date().toISOString(),
    status: "healthy",
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!ENV.MONGODB_URI,
      hasClerkKeys: !!(ENV.CLERK_PUBLISHABLE_KEY && ENV.CLERK_SECRET_KEY),
      hasCloudinary: !!(ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY),
      hasStream: !!(ENV.STREAM_API_KEY && ENV.STREAM_SECRET_KEY),
    },
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "API is healthy!",
    timestamp: new Date().toISOString(),
    status: "ok",
  });
});

// Initialize webhook setup function (works in both dev and production)
const initializeWebhook = async () => {
  try {
    console.log('🔧 Initializing Stream webhook configuration...');
    const webhookSetup = await setupStreamWebhook();
    
    if (webhookSetup) {
      console.log('🚀 Push notifications are now active!');
      console.log('✅ Stream webhook configured successfully');
    } else {
      console.log('⚠️ Webhook setup failed - check your Stream credentials');
      console.log('❌ Make sure STREAM_API_KEY and STREAM_SECRET_KEY are set');
    }
  } catch (error) {
    console.error('❌ Webhook initialization error:', error.message);
    console.error('🔍 Check your Stream credentials and network connectivity');
  }
};

// Connect to database
const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

// Setup routes
const setupRoutes = () => {
  try {
    // Simple request logger to aid production debugging
    app.use((req, _res, next) => {
      console.log(`➡️ ${req.method} ${req.originalUrl}`);
      next();
    });

    app.use("/api/users", userRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/comments", commentRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/stream", streamRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/push", pushRoutes);

    console.log("✅ All routes registered successfully");
  } catch (error) {
    console.error("❌ Error registering routes:", error);
  }
};

// Register routes synchronously so they are available immediately (even during cold start)
setupRoutes();

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Global error handler:", err);
  console.error("❌ Error stack:", err.stack);
  console.error("❌ Request details:", {
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
  });

  res.status(err.status || 500).json({
    error: "Something went wrong!",
    message: err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.originalUrl);
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "GET /",
      "GET /api/health",
      "GET /api/users/*",
      "GET /api/posts/*",
      "GET /api/comments/*",
      "GET /api/notifications/*",
      "GET /api/stream/*",
      "POST /api/push/*",
    ],
  });
});

// Main initialization function (runs in both development and production)
const initializeApp = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Initialize webhook configuration (CRITICAL FIX - runs in production too!)
    await initializeWebhook();
    
    console.log('🎉 Application initialization complete!');
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
  }
};

// Start server (development only - Vercel handles this in production)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/`);
    console.log(`📍 API health: http://localhost:${PORT}/api/health`);
    console.log('🔧 Development mode - initializing application...');
    
    // Initialize everything in development
    await initializeApp();
  });
} else {
  // Production mode (Vercel) - initialize without starting server
  console.log('🚀 Production mode - initializing application...');
  initializeApp().catch(console.error);
}

export default app;