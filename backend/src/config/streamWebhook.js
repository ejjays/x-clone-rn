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

    await streamClient.updateAppSettings({
      webhook_url: webhookUrl,
      webhook_events: ["message.new"],
    });

    console.log("✅ Stream webhook configured successfully!");
    return true;
  } catch (error) {
    console.log("❌ Webhook setup error:", error.message);
    console.log("❌ Make sure STREAM_API_KEY and STREAM_SECRET_KEY are set correctly");
    return false;
  }
};