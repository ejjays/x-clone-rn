import { streamClient } from "./stream.js";

export const setupStreamWebhook = async () => {
  try {
    const hasKeys = Boolean(process.env.STREAM_API_KEY && process.env.STREAM_SECRET_KEY);
    if (!hasKeys) {
      console.log("❌ STREAM_API_KEY/STREAM_SECRET_KEY are missing");
      return false;
    }

    const vercelBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://x-clone-rn-one.vercel.app";
    const webhookUrl = `${vercelBase}/api/push/stream-webhook`;

    // Use Stream Chat v2 event hooks API
    await streamClient.updateAppSettings({
      event_hooks: [
        {
          url: webhookUrl,
          events: ["message.new"],
          description: "Expo push relay for chat messages",
        },
      ],
    });

    console.log("✅ Stream webhook configured successfully (event_hooks)!");
    console.log("🔗 Stream webhook URL:", webhookUrl);
    return true;
  } catch (error) {
    console.log("❌ Webhook setup error (event_hooks):", error.message);
    // No fallback to deprecated fields to avoid v2 rejection; just instruct via logs
    console.log("❌ Make sure STREAM_API_KEY and STREAM_SECRET_KEY are set correctly");
    return false;
  }
};