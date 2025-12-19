import { useState, useEffect } from "react";
import { meetingService } from "@/services/meetingService";

export function useMeetingData(meetingId: string) {
    const [meetingInfo, setMeetingInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMeeting() {
            if (!meetingId) return;

            setIsLoading(true);
            setError(null);

            try {
                const res = await meetingService.getMeetingById(meetingId);
                if (res.success && res.data) {
                    setMeetingInfo(res.data);
                } else {
                    setError("Failed to load meeting");
                }
            } catch (err) {
                setError("Error loading meeting");
            } finally {
                setIsLoading(false);
            }
        }

        fetchMeeting();
    }, [meetingId]);

    return { meetingInfo, setMeetingInfo, isLoading, error };
}
