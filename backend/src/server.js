import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";
import { ClerkExpressWithAuth } from "@clerk/express";

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

// Use Clerk middleware
app.use(ClerkExpressWithAuth());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// New endpoint for Pusher presence channel authentication
app.post("/api/pusher/auth", (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  
  // For presence channels, you must be authenticated
  if (!req.auth.userId) {
    return res.status(403).send("Forbidden");
  }

  const presanceData = {
    user_id: req.auth.userId, // Use the actual user ID from Clerk
    user_info: {
      // You can add any other user info you want here
    },
  };

  const authResponse = pusher.authorizeChannel(socketId, channel, presanceData);
  res.send(authResponse);
});

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