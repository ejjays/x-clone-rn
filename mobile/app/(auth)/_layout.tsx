import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { readPersistedAuthState, getIsOnline } from "@/utils/offline/network";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const [allowOfflineTabs, setAllowOfflineTabs] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const online = await getIsOnline();
        if (!online) {
          const persisted = await readPersistedAuthState();
          if (persisted?.isSignedIn && !cancelled) setAllowOfflineTabs(true);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isSignedIn || allowOfflineTabs) {
    return <Redirect href={"/(tabs)"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}