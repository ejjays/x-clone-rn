// hooks/useOfflineSync.ts
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { syncManager } from "@/utils/offline/SyncManager";
import { useApiClient } from "@/utils/api";
import { useStreamChat } from "@/context/StreamChatContext";
import { offlineQueue } from "@/utils/offline/OfflineQueue";

export const useOfflineSync = () => {
  const api = useApiClient();
  const { client } = useStreamChat();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queued, setQueued] = useState<number>(0);

  useEffect(() => {
    const unsubNet = NetInfo.addEventListener(async (state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      if (online) {
        // kick off a sync on reconnect
        syncManager.run(api, client || undefined).catch(() => {});
      }
    });
    const unsubQ = offlineQueue.on("change", async () => {
      const list = await offlineQueue.list();
      setQueued(list.length);
    });
    // initialize queued count
    offlineQueue.list().then((list) => setQueued(list.length));
    return () => {
      unsubNet();
      unsubQ();
    };
  }, [api, client]);

  return { isOnline, queued };
};

