import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { registerPushToken, togglePushNotifications, sendPushNotification, sendBulkNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/register-token", protectRoute, registerPushToken);
router.post("/toggle-notifications", protectRoute, togglePushNotifications);
router.post("/send-notification", protectRoute, sendPushNotification);
router.post("/send-bulk", protectRoute, sendBulkNotifications);

export default router;

