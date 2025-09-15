import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { useUser } from "./useUser";

export const useGetCall = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoadingCall, setIsLoadingCall] = useState<boolean>(false);
  const client = useStreamVideoClient();
  const [next, setNext] = useState<string | null>(null);
  const { userId } = useUser();

  useEffect(() => {
    const loadCalls = async () => {
      if (!client || !userId) return;
      setIsLoadingCall(true);
      try {
        const { calls } = await client.queryCalls({
          sort: [{ field: "starts_at", direction: 1 }],
          filter_conditions: {
            $or: [
              { created_by_user_id: userId },
              { "members.user_id": userId },
            ],
          },
        });
        console.log(
          "Fetched calls:",
          calls.map((c) => c.state)
        );
        setCalls(calls);
      } catch (error) {
        console.error("Error fetching calls:", error);
      } finally {
        setIsLoadingCall(false);
      }
    };
    loadCalls();
  }, [client, userId]);

  const now = new Date();

  const endedCalls = calls.filter(({ state: { startsAt, endedAt } }: Call) => {
    return (startsAt && new Date(startsAt) < now) || !!endedAt;
  });

  const upcomingCalls = calls.filter(({ state: { startsAt } }: Call) => {
    return startsAt && new Date(startsAt) > now;
  });

  return { callRecordings: calls, isLoadingCall, endedCalls, upcomingCalls };
};
