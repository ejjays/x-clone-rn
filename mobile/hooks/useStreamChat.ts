import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { type Channel, StreamChat } from "stream-chat"; // Import the 'Channel' type
import { useApiClient, streamApi } from "@/utils/api";
import { useCurrentUser } from "./useCurrentUser";

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || "YOUR_STREAM_API_KEY";

export const useStreamChat = () => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const { isSignedIn, userId } = useAuth();
  const { currentUser } = useCurrentUser();
  const api = useApiClient();

  // ✨ Add state for channels and connection status
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setIsConnecting(false);
      return;
    }

    const chatClient = StreamChat.getInstance(API_KEY);

    const connectAndLoadChannels = async () => {
      // Prevent reconnecting if the client is already connected for the same user
      if (chatClient.userID === userId) {
        console.log("✅ Stream Chat already connected for user:", userId);
        setIsConnecting(false);
        return;
      }

      console.log("🔄 Initializing Stream Chat for user:", userId);
      setIsConnecting(true);

      try {
        const response = await streamApi.getToken(api);
        const { token, user } = response.data;

        if (chatClient.userID) {
          await chatClient.disconnectUser();
        }

        await chatClient.connectUser(user, token);
        setClient(chatClient);
        console.log("✅ Stream Chat connected successfully!");

        // --- ✨ NEW: Fetch user's channels ---
        console.log("🔄 Fetching user channels...");
        const channelFilter = {
          type: "messaging",
          members: { $in: [userId] },
          // Only fetch channels that have at least one message
          last_message_at: { $ne: null },
        };
        const sort = [{ last_message_at: -1 }];
        const userChannels = await chatClient.queryChannels(channelFilter, sort, {
          watch: true, // Watch for real-time changes
          state: true, // Get full channel state with messages
        });
        setChannels(userChannels);
        console.log(`✅ Fetched ${userChannels.length} active channels.`);
        // --- End of new logic ---

      } catch (error) {
        console.error("❌ Stream Chat connection or channel fetch failed:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    connectAndLoadChannels();

    // Listen for events that should trigger a channel list refresh
    const handleEvent = (event: any) => {
      console.log(`Received event: ${event.type}, refetching channels.`);
      // A simple way to refresh is to re-query
      connectAndLoadChannels();
    };

    chatClient.on(["message.new", "notification.message_new", "channel.updated"], handleEvent);

    return () => {
      // Clean up listeners when the hook is no longer in use
      chatClient.off(handleEvent);
    };
  }, [isSignedIn, userId]); // Dependencies are stable and prevent unnecessary re-runs

  // The createChannel function from our previous fix
  const createChannel = async (otherUserId: string, otherUserName: string) => {
    if (!client || !currentUser || !userId) {
      console.error("❌ Client, current user, or user ID not available.");
      return null;
    }
    try {
      const response = await streamApi.createChannel(api, {
        members: [userId, otherUserId],
        name: `${currentUser.firstName} & ${otherUserName}`,
      });
      const { channelId } = response.data;
      const channel = client.channel("messaging", channelId);
      await channel.watch();
      return channel;
    } catch (error) {
      console.error("❌ Failed to create channel:", error);
      throw error;
    }
  };

  return {
    client,
    isConnecting,
    isConnected: !!client?.user,
    channels, // ✨ Expose the channels state
    createChannel,
  };
};