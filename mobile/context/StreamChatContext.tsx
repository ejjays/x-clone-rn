import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { StreamChat } from "stream-chat";
import { useApiClient, streamApi } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";
import * as Notifications from "expo-notifications";

// --- Types ---
interface StreamChatContextType {
  client: StreamChat | null;
  isConnected: boolean;
  isConnecting: boolean;
  channels: any[];
  refreshChannels: () => Promise<void>;
  createChannel: (memberId: string, name?: string) => Promise<any>;
}

// --- Context Creation ---
const StreamChatContext = createContext<StreamChatContextType | undefined>(undefined);

// --- Provider Component ---
const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;
const chatClient = StreamChat.getInstance(STREAM_API_KEY);

export const StreamChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const api = useApiClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);

  // Fetch the Stream token from your backend
  const { data: streamToken, error: tokenError, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken", user?.id],
    queryFn: () => streamApi.getToken(api),
    enabled: isLoaded && !!user,
    staleTime: 1000 * 60 * 55, // 55 minutes
  });

  // ADD THESE DEBUG LOGS:
  if (process.env.EXPO_PUBLIC_DEBUG_LOGS === "1") {
    console.log("🔍 DEBUG - StreamChat State:", {
      isLoaded,
      hasUser: !!user,
      tokenLoading,
      hasToken: !!streamToken,
      tokenError,
      isConnected,
      isConnecting,
      channelsCount: channels.length,
      STREAM_API_KEY: !!STREAM_API_KEY,
    });
  }

  // Ensure the chat client is connected as the current Clerk user
  const ensureConnectedAsCurrentUser = useCallback(async () => {
    if (!user || !streamToken) return;
    // If already connected as the correct user, do nothing
    if (chatClient.userID === user.id && isConnected) return;

    setIsConnecting(true);
    try {
      // If connected as a different user, disconnect first
      if (chatClient.userID && chatClient.userID !== user.id) {
        await chatClient.disconnectUser();
        setIsConnected(false);
      }

      // Connect as the current user if not already
      if (chatClient.userID !== user.id) {
        console.log("🔄 Connecting to Stream Chat as", user.id);
        await chatClient.connectUser(
          { id: user.id, name: user.fullName ?? user.id, image: user.imageUrl },
          streamToken.data.token,
        );
        console.log("✅ Stream Chat connected successfully!");
      }

      setIsConnected(true);
    } catch (error) {
      console.error("❌ Stream Chat connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [user, streamToken, isConnected]);

  // Connect or switch user when Clerk user or token changes
  useEffect(() => {
    ensureConnectedAsCurrentUser();
  }, [ensureConnectedAsCurrentUser]);

  // Disconnect when user signs out
  useEffect(() => {
    if (!user && chatClient.userID) {
      (async () => {
        try {
          await chatClient.disconnectUser();
        } catch (e) {
          // ignore
        } finally {
          setIsConnected(false);
        }
      })();
    }
  }, [user]);

  // Function to refresh channels
  const refreshChannels = useCallback(async () => {
    if (!chatClient || !user) return;
    try {
      const filter = { type: "messaging", members: { $in: [user.id] } };
      const sort: any = { last_message_at: -1 };
      const newChannels = await chatClient.queryChannels(filter, sort);
      setChannels(newChannels);
      // Persist a light snapshot for offline display
      const snapshot = newChannels.map((ch: any) => ({
        id: ch.id,
        state: {
          last_message_at: ch.state?.last_message_at,
          members: ch.state?.members,
          messages: (ch.state?.messages || []).slice(-30).map((m: any) => ({ id: m.id, text: m.text, user: m.user, attachments: m.attachments, created_at: m.created_at })),
        },
      }));
      await AsyncStorage.setItem(StorageKeys.CHAT_CHANNELS, JSON.stringify(snapshot));
    } catch (error) {
      console.error("❌ Failed to refresh channels:", error);
    }
  }, [chatClient, user]); // Corrected dependency

  // Push notification for new messages when app is backgrounded
  useEffect(() => {
    if (!chatClient || !user) return;
    const onMessageNew = async (event: any) => {
      try {
        const state = await Notifications.getPermissionsAsync();
        if (state.status !== "granted") return;
        const isForeground = true; // Expo handler will display when foreground; push used mainly from backend webhook
        // No-op here; backend webhook handles real push to recipients
      } catch {}
    };
    chatClient.on("message.new", onMessageNew);
    return () => {
      chatClient.off("message.new", onMessageNew);
    };
  }, [chatClient, user]);

  // Function to create a new channel
  const createChannel = async (memberId: string, name?: string) => {
    if (!chatClient || !user) throw new Error("Chat client not ready");
    const extraData: any = {
      members: [user.id, memberId],
    };
    if (name) extraData.name = name;
    const channel = chatClient.channel(
      "messaging",
      undefined,
      extraData
    );
    await channel.create();
    return channel;
  };

  // Hydrate channels from storage for offline
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(StorageKeys.CHAT_CHANNELS);
        if (raw) {
          const snapshot = JSON.parse(raw);
          setChannels(snapshot);
        }
      } catch {}
    })();
  }, []);

  // Refresh channels when connection is established
  useEffect(() => {
    if (isConnected) {
      refreshChannels();
    }
  }, [isConnected, refreshChannels]);

  const value = {
    client: chatClient,
    isConnected,
    isConnecting,
    channels,
    refreshChannels,
    createChannel,
  };

  return <StreamChatContext.Provider value={value}>{children}</StreamChatContext.Provider>;
};

// --- Custom Hook ---
export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (context === undefined) {
    throw new Error("useStreamChat must be used within a StreamChatProvider");
  }
  return context;
};