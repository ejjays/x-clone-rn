import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { type Channel, StreamChat } from "stream-chat";
import { useApiClient, streamApi } from "@/utils/api";
import { useCurrentUser } from "./useCurrentUser";

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || "YOUR_STREAM_API_KEY";

export const useStreamChat = () => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const { isSignedIn, userId } = useAuth();
  const { currentUser } = useCurrentUser();
  const api = useApiClient();

  useEffect(() => {
    // We only run this effect when the user's ID changes.
    if (!isSignedIn || !userId) {
      setIsConnecting(false);
      return;
    }

    const chatClient = StreamChat.getInstance(API_KEY);

    const connectAndLoadChannels = async () => {
      // Prevent re-connecting if the client is already set up for this user
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

        // --- ✨ FIX STARTS HERE ✨ ---
        console.log("🔄 Fetching user channels...");
        const channelFilter = {
          type: "messaging",
          members: { $in: [userId] },
          // ❌ The problematic line is removed from here.
        };
        const sort = [{ last_message_at: -1 }];

        const userChannels = await chatClient.queryChannels(channelFilter, sort, {
          watch: true,
          state: true,
        });

        // ✅ Add a client-side filter as a safeguard to ensure no empty channels are shown.
        const channelsWithMessages = userChannels.filter(
          (channel) => channel.state.messages.length > 0
        );

        setChannels(channelsWithMessages);
        console.log(`✅ Found ${channelsWithMessages.length} channels with messages.`);
        // --- ✨ FIX ENDS HERE ✨ ---

      } catch (error) {
        console.error("❌ Stream Chat connection or channel fetch failed:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    connectAndLoadChannels();

    // Set up listeners for real-time updates
    const handleEvent = (event: any) => {
      console.log(`Received event: ${event.type}, refreshing channels.`);
      // Re-running the connection and load logic handles updates gracefully
      connectAndLoadChannels();
    };

    chatClient.on(["message.new", "notification.message_new", "channel.updated"], handleEvent);

    return () => {
      // Clean up listeners when the component unmounts
      chatClient.off(handleEvent);
    };
    
  }, [isSignedIn, userId]); // Dependencies are stable to prevent loops

  const createChannel = async (otherUserId: string, otherUserName: string) => {
    // This function remains the same as our previous fix
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
    channels,
    createChannel,
  };
};