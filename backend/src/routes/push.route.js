import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { registerPushToken, toggleNotifications, sendNotification, streamWebhook } from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/register-token", protectRoute, registerPushToken);
router.post("/toggle-notifications", protectRoute, toggleNotifications);
router.post("/send-notification", protectRoute, sendNotification);
router.post("/stream-webhook", express.json({ type: "application/json" }), streamWebhook);

// Add this route for testing
router.post('/debug-webhook-setup', async (req, res) => {
  try {
    const { setupStreamWebhook } = await import('../config/streamWebhook.js');
    const result = await setupStreamWebhook();
   
    res.json({
      success: result,
      message: result ? 'Webhook configured successfully!' : 'Webhook setup failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
