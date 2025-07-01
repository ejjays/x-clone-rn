import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher"; // Import Pusher

import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

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

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// New endpoint for Pusher presence channel authentication
app.post("/pusher/auth", (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  // This is a basic example, in a real app you'd check if the user is logged in
  const presanceData = {
    user_id: new mongoose.Types.ObjectId().toString(), // Use a real user ID here
    user_info: {
      // Add any user info you want other clients to see
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
    console.log(err);
    process.exit(1);
  });