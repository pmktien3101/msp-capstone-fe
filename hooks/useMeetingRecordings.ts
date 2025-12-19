import { useState, useEffect } from "react";
import { Call, CallRecording } from "@stream-io/video-react-sdk";

export function useMeetingRecordings(
    call: Call | undefined,
    meetingInfo: any,
    activeTab: string
) {
    const [recordings, setRecordings] = useState<CallRecording[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadRecordings() {
            if (!call || activeTab !== "recording") return;
            if (meetingInfo?.recordUrl) {
                setRecordings([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const res = await call.queryRecordings();
                setRecordings(res.recordings || []);
            } catch (e: any) {
                setError("Failed to load recordings");
            } finally {
                setIsLoading(false);
            }
        }

        loadRecordings();
    }, [activeTab, call, meetingInfo?.recordUrl]);

    return { recordings, isLoading, error };
}
