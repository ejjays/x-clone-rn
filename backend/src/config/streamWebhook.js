import { streamClient } from "./stream.js";

export const setupStreamWebhook = async () => {
  try {
    const hasKeys = Boolean(process.env.STREAM_API_KEY && process.env.STREAM_SECRET_KEY);
    if (!hasKeys) {
      console.log("❌ STREAM_API_KEY/STREAM_SECRET_KEY are missing");
      return false;
    }

    const base = process.env.EXTERNAL_BASE_URL || "https://x-clone-rn-one.vercel.app";
    const webhookUrl = `${base}/api/push/stream-webhook`;
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      console.log("❌ Invalid webhook URL computed:", webhookUrl);
      return false;
    }

    // Fetch existing settings and event hooks
    const settings = await streamClient.getAppSettings();
    const existingHooks = settings?.event_hooks || settings?.app?.event_hooks || [];

    // Update existing webhook hooks to canonical URL; ensure event_types and enabled
    let updated = false;
    const nextHooks = existingHooks.map((hook) => {
      if (hook.hook_type === "webhook") {
        updated = true;
        return {
          ...hook,
          enabled: true,
          webhook_url: webhookUrl,
          event_types: ["message.new"],
        };
      }
      return hook;
    });

    // If no webhook hook existed, append ours
    if (!updated) {
      nextHooks.push({
        name: "expo_push_webhook",
        enabled: true,
        hook_type: "webhook",
        webhook_url: webhookUrl,
        event_types: ["message.new"],
        description: "Expo push relay for chat messages",
      });
    }

    // Apply updated hooks
    await streamClient.updateAppSettings({ event_hooks: nextHooks });

    console.log("✅ Stream webhook configured successfully (event_hooks)!");
    console.log("🔗 Stream webhook URL:", webhookUrl);
    return true;
  } catch (error) {
    console.log("❌ Webhook setup error (event_hooks):", error.message);
    console.log("❌ Make sure STREAM_API_KEY and STREAM_SECRET_KEY are set correctly");
    return false;
  }
};