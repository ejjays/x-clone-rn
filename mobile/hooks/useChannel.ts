import { useEffect, useState, useMemo } from "react";
import { useStreamChat } from "@/context/StreamChatContext";
import { useCurrentUser } from "./useCurrentUser";
import { Channel } from "stream-chat";

export const useChannel = (channelId: string) => {
  const { client, isConnected } = useStreamChat();
  const { currentUser } = useCurrentUser();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId || !client || !isConnected || !currentUser) {
      setLoading(false);
      return;
    }

    const fetchChannel = async () => {
      setLoading(true);
      try {
        const newChannel = client.channel("messaging", channelId);
        await newChannel.watch();

        const members = Object.values(newChannel.state.members);
        const other = members.find((m) => m.user_id !== currentUser.clerkId);

        setChannel(newChannel);
        setOtherUser(other?.user || null);
      } catch (error) {
        console.error(`Failed to fetch and watch channel ${channelId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();

    return () => {
      channel?.stopWatching();
    };
  }, [channelId, client, isConnected, currentUser]);

  return { channel, otherUser, loading };
};
