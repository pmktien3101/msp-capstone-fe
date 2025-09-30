import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";

export const useGetCall = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoadingCall, setIsLoadingCall] = useState<boolean>(false);
  const client = useStreamVideoClient();
  const { userId } = useUser();

  const loadCalls = useCallback(async () => {
    if (!client || !userId) return;
    setIsLoadingCall(true);
    try {
      const { calls } = await client.queryCalls({
        sort: [{ field: "starts_at", direction: 1 }],
        filter_conditions: {
          $or: [{ created_by_user_id: userId }, { members: { $in: [userId] } }],
        },
      });
      setCalls(calls);
    } catch (error) {
      console.error("Error fetching calls:", error);
    } finally {
      setIsLoadingCall(false);
    }
  }, [client, userId]);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const now = new Date();

  const endedCalls = calls.filter(
    ({ state: { endedAt } }: Call) => endedAt && new Date(endedAt) <= now
  );

  const upcomingCalls = calls.filter(
    ({ state: { startsAt, endedAt } }: Call) =>
      startsAt && new Date(startsAt) > now && !endedAt
  );

  const inProgressCalls = calls.filter(
    ({ state: { startsAt, endedAt } }: Call) =>
      startsAt && new Date(startsAt) <= now && !endedAt
  );

  const refetchCalls = loadCalls;

  return {
    callRecordings: calls,
    isLoadingCall,
    endedCalls,
    upcomingCalls,
    refetchCalls,
    inProgressCalls,
  };
};
