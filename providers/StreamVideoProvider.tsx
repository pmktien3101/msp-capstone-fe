"use client";

import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { tokenService } from "@/services/streamService";

// const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";
const apiKey = "9tkscc7pwskt"
export const StreamVideoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [error, setError] = useState<string | null>(null);
  const { userId, email, image } = useUser();
  
  useEffect(() => {
    if (!apiKey) {
      console.warn("Stream API key not provided. Video features will be disabled.");
      setError("Stream API key not configured");
      return;
    }
    if (!userId || !email) return;

    let client: StreamVideoClient | undefined;
    
    try {
      client = new StreamVideoClient({
        apiKey,
        user: {
          id: userId,
          name: email,
          image: image,
        },
        tokenProvider: async () => {
          return await tokenService.getStreamToken({
            id: userId,
            name: email,
            image: image,
          });
        },
      });
      console.log("Stream Video Client initialized:", client);
      setVideoClient(client);
    } catch (err) {
      console.error("Failed to initialize Stream Video Client:", err);
      setError("Failed to initialize video client");
    }

    return () => {
      if (client) {
        client.disconnectUser();
      }
      setVideoClient(undefined);
    };
  }, [userId, email, image]);

  // If there's an error (like missing API key), render children without StreamVideo wrapper
  if (error) {
    console.warn("StreamVideoProvider error:", error);
    return <>{children}</>;
  }

  if (!userId || !email || !videoClient) {
    return <Loader />;
  }
  
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};
