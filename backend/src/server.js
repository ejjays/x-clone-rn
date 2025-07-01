import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";
import { clerkMiddleware, getAuth } from "@clerk/express"; // Correct Clerk import

import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import userRoutes from "./routes/user.route.js";
import notificationRoutes from "./routes/notification.route.js";

const app = express();
const port = process.env.PORT || 8080;

// --- Middlewares ---

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Attach Pusher to each request
app.use((req, res, next) => {
  req.pusher = pusher;
  next();
});

app.use(cors({ origin: "*" }));
app.use(express.json());

// Use the general clerkMiddleware for all routes.
// This will attach the auth object to the request if the user is authenticated.
app.use(clerkMiddleware());


// --- Routes ---

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Pusher authentication endpoint
app.post("/api/pusher/auth", (req, res) => {
  const auth = getAuth(req);
  // User MUST be authenticated for presence channels
  if (!auth.userId) {
    return res.status(403).send("Forbidden: User not authenticated");
  }

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  const presanceData = {
    user_id: auth.userId,
    user_info: { 
        // You could add username, etc. here later if you want
     },
  };

  try {
    const authResponse = pusher.authorizeChannel(socketId, channel, presanceData);
    res.send(authResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error authorizing Pusher channel");
  }
});


app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);


// --- Server Initialization ---

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