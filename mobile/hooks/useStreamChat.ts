import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { type Channel, StreamChat } from "stream-chat";
import { useApiClient, streamApi } from "@/utils/api";
import { useCurrentUser } from "./useCurrentUser";

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || "YOUR_STREAM_API_KEY";

export const useStreamChat = () => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  // ✨ A single, reliable flag for loading state
  const [isConnecting, setIsConnecting] = useState(true);
  const { isSignedIn, userId } = useAuth();
  const { currentUser } = useCurrentUser();
  const api = useApiClient();

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setIsConnecting(false);
      return;
    }

    const chatClient = StreamChat.getInstance(API_KEY);

    const connectUser = async () => {
      // If the user is already connected, don't do anything
      if (chatClient.userID === userId) {
        console.log("✅ User already connected.");
        setIsConnecting(false); // Make sure loading is finished
        return;
      }

      setIsConnecting(true); // Start loading
      try {
        const response = await streamApi.getToken(api);
        const { token, user } = response.data;
        
        // Disconnect any previous user before connecting the new one
        if (chatClient.userID) {
            await chatClient.disconnectUser();
        }
        await chatClient.connectUser(user, token);
        setClient(chatClient);
        console.log("✅ Stream Chat connected successfully!");

        // Fetch channels right after connecting
        const userChannels = await chatClient.queryChannels(
          { type: "messaging", members: { $in: [userId] } },
          [{ last_message_at: -1 }],
          { watch: true, state: true }
        );

        const channelsWithMessages = userChannels.filter(c => c.state.messages.length > 0);
        setChannels(channelsWithMessages);
        console.log(`✅ Found ${channelsWithMessages.length} channels.`);

      } catch (error) {
        console.error("❌ Failed to connect or fetch channels:", error);
      } finally {
        setIsConnecting(false); // Always stop loading
      }
    };

    connectUser();

  }, [isSignedIn, userId]); // Re-run only when the user changes

  const createChannel = async (otherUserId: string, otherUserName: string) => {
    if (!client || !currentUser || !userId) {
      console.error("❌ Cannot create channel: client or user is not ready.");
      return null;
    }
    try {
      const response = await streamApi.createChannel(api, {
        members: [userId, otherUserId],
        name: `${currentUser.firstName} & ${otherUserName}`,
      });
      const channelData = response.data;
      const channel = client.channel("messaging", channelData.channelId);
      await channel.watch();
      return channel;
    } catch (error) {
      console.error("❌ Failed to create channel:", error);
      return null;
    }
  };

  return {
    client,
    channels,
    isConnecting,
    // ✨ A clear, boolean `isConnected` state
    isConnected: !!client && !isConnecting,
    createChannel,
  };
};