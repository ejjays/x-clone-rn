import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

import { streamApi, useApiClient } from "../utils/api";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;
const chatClient = StreamChat.getInstance(STREAM_API_KEY);

export const useStreamChat = () => {
  const { user } = useUser();
  const api = useApiClient();
  const [isConnected, setIsConnected] = useState(false);

  const { data: streamToken } = useQuery({
    queryKey: ["streamToken"],
    queryFn: () => streamApi.getToken(api),
    enabled: !!user,
  });

  useEffect(() => {
    // Only run if we have a user, a token, and are not already connected
    if (user && streamToken && !isConnected) {
      const connectUser = async () => {
        if (chatClient.userID === user.id) {
          console.log("✅ Using existing Stream Chat connection");
          setIsConnected(true);
          return;
        }

        console.log("🔄 Connecting to Stream Chat...");
        await chatClient.connectUser(
          {
            id: user.id,
            name: user.fullName ?? user.id,
            image: user.imageUrl,
          },
          streamToken.data.token,
        );
        setIsConnected(true);
        console.log("✅ Stream Chat connected successfully!");
      };

      connectUser();
    }
  }, [user, streamToken, isConnected]); // Add isConnected to dependency array

  return {
    chatClient,
    isConnected,
  };
};