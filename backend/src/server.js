import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";
import { ClerkExpressRequireAuth } from "@clerk/express"; // Corrected import name

import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import userRoutes from "./routes/user.route.js";
import notificationRoutes from "./routes/notification.route.js";

const app = express();
const port = process.env.PORT || 8080;

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Middleware to attach pusher to each request
app.use((req, res, next) => {
  req.pusher = pusher;
  next();
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// New endpoint for Pusher presence channel authentication
// This must come BEFORE Clerk authentication
app.post("/api/pusher/auth", ClerkExpressRequireAuth(), (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  const presanceData = {
    user_id: req.auth.userId, // Use the actual user ID from Clerk
    user_info: {
      // You can add other user info here
    },
  };

  const authResponse = pusher.authorizeChannel(socketId, channel, presanceData);
  res.send(authResponse);
});


// All routes below this will be protected by Clerk
app.use("/api/users", ClerkExpressRequireAuth(), userRoutes);
app.use("/api/posts", ClerkExpressRequireAuth(), postRoutes);
app.use("/api/comments", ClerkExpressRequireAuth(), commentRoutes);
app.use("/api/notifications", ClerkExpressRequireAuth(), notificationRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
    process.exit(1);
  });

export default app;