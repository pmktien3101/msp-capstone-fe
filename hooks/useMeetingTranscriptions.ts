import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://localhost:7129/api/v1";

export function useMeetingTranscriptions(callId: string | undefined, activeTab: string) {
    const [transcriptions, setTranscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTranscriptions() {
            if (!callId || activeTab !== "recording") return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_BASE}/stream/call/default/${callId}/transcriptions`
                );
                console.log('Test: ', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTranscriptions(data || []);
            } catch (e: any) {
                // Silently fail - transcriptions might not be available yet
            } finally {
                setIsLoading(false);
            }
        }

        loadTranscriptions();
    }, [activeTab, callId]);

    return { transcriptions, isLoading, error };
}
