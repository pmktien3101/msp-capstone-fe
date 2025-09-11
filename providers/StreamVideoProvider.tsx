'use client';
import { useUser } from "@/hooks/useUser";
import { streamService } from "@/services/streamService";

import {
    StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { LoaderIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";
const StreamVideoProvider = ({children}:{children: React.ReactNode}) => {
    const [videoClient, setVideoClient] = useState<StreamVideoClient>();
    const { userId, email } = useUser();

    const tokenProvider = useCallback(async () => {
        if (!userId) throw new Error("User ID is required");
        return streamService.getToken({
            id: userId,
            role: "user",
            name: email || userId,
            image: null
        });
    }, [userId, email]);

    useEffect(() => {
        if (!userId) return;
        if(!apiKey) throw new Error("Stream API key missing");

        const client = new StreamVideoClient({
            apiKey,
            user: {
                id: userId,
                name: email || userId,
                image: undefined,
            },
            tokenProvider,
        });

        setVideoClient(client);
    }, [userId]);

    if (!videoClient) {
        return <LoaderIcon/>
    }

    return (
        <StreamVideo client={videoClient}>
            {children}
        </StreamVideo>
    );
};

export default StreamVideoProvider;