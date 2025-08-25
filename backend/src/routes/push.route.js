import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { registerPushToken, toggleNotifications, sendNotification, streamWebhook } from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/register-token", protectRoute, registerPushToken);
router.post("/toggle-notifications", protectRoute, toggleNotifications);
router.post("/send-notification", protectRoute, sendNotification);
router.post("/stream-webhook", express.json({ type: "application/json" }), streamWebhook);

export default router;

