// mobile/context/StreamVideoContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, streamApi } from "@/utils/api";
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";

interface StreamVideoContextValue {
  client: StreamVideoClient | null;
}

const StreamVideoContext = createContext<StreamVideoContextValue | undefined>(
  undefined,
);

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

export const StreamVideoProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const api = useApiClient();

  const { data: streamToken } = useQuery({
    queryKey: ["streamTokenVideo", user?.id],
    queryFn: () => streamApi.getToken(api),
    enabled: isLoaded && !!user,
    staleTime: 1000 * 60 * 55,
  });

  const client = useMemo(() => {
    if (!user || !streamToken) return null;
    const c = new StreamVideoClient({
      apiKey: STREAM_API_KEY,
      user: {
        id: user.id,
        name: user.fullName ?? user.id,
        image: user.imageUrl,
      },
      tokenProvider: async () => streamToken.data.token as string,
    });
    return c;
  }, [user, streamToken]);

  useEffect(() => {
    return () => {
      client?.disconnectUser().catch(() => {});
    };
  }, [client]);

  const value = { client };

  if (!client) return null;

  return (
    <StreamVideo client={client}>
      <StreamVideoContext.Provider value={value}> 
        {children}
      </StreamVideoContext.Provider>
    </StreamVideo>
  );
};

export const useStreamVideo = () => {
  const ctx = useContext(StreamVideoContext);
  if (!ctx) throw new Error("useStreamVideo must be used within StreamVideoProvider");
  return ctx;
};

