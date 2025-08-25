// utils/offline/persist.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient, persistQueryClientRestore } from "@tanstack/react-query-persist-client";
import type { QueryClient } from "@tanstack/react-query";
import { StorageKeys } from "@/utils/offline/storageKeys";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: StorageKeys.RQ_CACHE,
});

export async function restoreReactQueryPersistence(queryClient: QueryClient) {
  try {
    await persistQueryClientRestore({ queryClient, persister });
  } catch {
    // ignore corrupt cache
  }
}

export function setupReactQueryPersistence(queryClient: QueryClient) {
  persistQueryClient({
    queryClient,
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Don't persist very short-lived queries
        return query.state.status === "success";
      },
    },
  });
}

