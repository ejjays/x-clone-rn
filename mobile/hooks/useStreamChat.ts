import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useAuth } from "@clerk/clerk-expo";
import { useCurrentUser } from "./useCurrentUser";
import { useApiClient, streamApi } from "@/utils/api";

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || "YOUR_STREAM_API_KEY";

export const useStreamChat = () => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { isSignedIn, userId } = useAuth();
  const { currentUser } = useCurrentUser();
  const api = useApiClient();

  useEffect(() => {
    if (!isSignedIn || !currentUser || !userId) return;

    if (client || isConnecting) {
      console.log("🔄 Stream Chat already initializing or connected, skipping...");
      return;
    }

    const initializeStreamChat = async () => {
      setIsConnecting(true);

      try {
        console.log("🔄 Initializing Stream Chat for user:", userId);

        const response = await streamApi.getToken(api);
        const { token, user } = response.data;

        console.log("✅ Stream token received for user:", user.id);

        const chatClient = StreamChat.getInstance(API_KEY);

        if (chatClient.user) {
          console.log("⚠️ Stream Chat already connected, disconnecting first...");
          await chatClient.disconnectUser();
        }

        await chatClient.connectUser(user, token);

        setClient(chatClient);
        setIsConnected(true);
        console.log("✅ Stream Chat connected successfully!");
      } catch (error) {
        console.error("❌ Stream Chat connection failed:", error);
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeStreamChat();

    return () => {
      if (client) {
        console.log("🔄 Disconnecting Stream Chat...");
        client.disconnectUser();
        setClient(null);
        setIsConnected(false);
      }
    };
  }, [isSignedIn, currentUser, userId]);

  const createChannel = async (otherUserId: string, otherUserName: string) => {
    // ✨ --- Start of Change --- ✨
    if (!client) {
      console.error("❌ Stream client is not available.");
      return null;
    }
    if (!currentUser || !userId) {
      console.error("❌ Current user information is not available.");
      return null;
    }
    // ✨ --- End of Change --- ✨

    try {
      console.log("🔄 Creating channel with user:", otherUserId);

      const response = await streamApi.createChannel(api, {
        members: [userId, otherUserId],
        name: `${currentUser.firstName} & ${otherUserName}`,
      });

      const { channelId } = response.data;
      console.log("✅ Channel created via backend:", channelId);

      const channel = client.channel("messaging", channelId);
      await channel.watch();

      return channel;
    } catch (error) {
      console.error("❌ Failed to create channel:", error);
      throw error;
    }
  };

  return {
    client: isConnected ? client : null,
    isConnecting,
    isConnected,
    createChannel,
  };
};