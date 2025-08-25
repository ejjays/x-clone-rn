import { StreamChat } from 'stream-chat';

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_SECRET
);

export const setupStreamWebhook = async () => {
  try {
    // CORRECT METHOD: updateAppSettings with event_hooks
    await serverClient.updateAppSettings({
      event_hooks: [
        {
          hook_type: "webhook",
          webhook_url: "https://x-clone-rn-one.vercel.app/api/push/stream-webhook",
          event_types: ["message.new"] // This triggers push notifications!
        }
      ]
    });
   
    console.log('✅ Stream webhook configured successfully!');
    return true;
  } catch (error) {
    console.log('❌ Webhook setup error:', error.message);
    console.log('❌ Make sure STREAM_API_KEY and STREAM_SECRET are set correctly');
    return false;
  }
};