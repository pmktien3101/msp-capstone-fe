"use client";

import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { tokenService } from "@/services/streamService";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";

export const StreamVideoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { userId, email, image } = useUser();
  useEffect(() => {
    if (!apiKey) throw new Error("No API key provided");
    if (!userId || !email) return;

    const client = new StreamVideoClient({
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

    return () => {
      client.disconnectUser();
      setVideoClient(undefined);
    };
  }, [userId, email, image]);

  if (!userId || !email || !videoClient) {
    return <Loader />;
  }
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};
