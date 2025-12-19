import { useState, useEffect } from "react";
import { todoService } from "@/services/todoService";

export function useMeetingTodos(meetingId: string) {
    const [todos, setTodos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchTodos() {
            if (!meetingId) return;

            setIsLoading(true);
            try {
                const res = await todoService.getTodosByMeetingId(meetingId);
                if (res.success && res.data) {
                    setTodos(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch todos:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTodos();
    }, [meetingId]);

    return { todos, setTodos, isLoading };
}
