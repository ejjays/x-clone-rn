import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useApiClient, streamApi } from "../utils/api";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

// Ensure we have a single instance of the chat client
const chatClient = StreamChat.getInstance(STREAM_API_KEY);

export const useStreamChat = () => {
  const { user, isLoaded } = useUser();
  const api = useApiClient();
  const [isConnected, setIsConnected] = useState(false);

  // Fetch the Stream token from your backend
  const { data: streamToken } = useQuery({
    queryKey: ["streamToken"],
    queryFn: () => streamApi.getToken(api),
    // Only run this query if the Clerk user is loaded and exists
    enabled: isLoaded && !!user,
    // The token is valid for 1 hour, so we can cache it for 55 minutes
    staleTime: 1000 * 60 * 55,
  });

  useEffect(() => {
    // We need a user, a token, and to NOT be already connected.
    if (user && streamToken && !isConnected) {
      const connectUser = async () => {
        // Check if the client is already connected with a different user
        if (chatClient.userID && chatClient.userID !== user.id) {
            await chatClient.disconnectUser();
        }

        // Now, connect the new user
        if (!chatClient.userID) {
            console.log("🔄 Connecting to Stream Chat...");
            try {
              await chatClient.connectUser(
                {
                  id: user.id,
                  name: user.fullName ?? user.id,
                  image: user.imageUrl,
                },
                streamToken.data.token,
              );
              console.log("✅ Stream Chat connected successfully!");
              setIsConnected(true);
            } catch (error) {
              console.error("❌ Stream Chat connection failed:", error);
            }
        }
      };
      connectUser();
    }
  }, [user, streamToken, isConnected]);

  return {
    chatClient,
    isConnected,
  };
};