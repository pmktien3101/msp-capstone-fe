import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';

export const useGetCallById = (id: string | string[]) => {
  const client = useStreamVideoClient();
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [call, setCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!client) return;

    const loadCall = async () => {
      try {
        const { calls } = await client.queryCalls({
          filter_conditions: {
            id
          }
        });

        if (calls.length > 0) {
          setCall(calls[0]);
          setIsCallLoading(false);
        }
      } catch (error) {
        console.error('Error loading call:', error);
        setIsCallLoading(false);
      }
    };

    setIsCallLoading(true);
    loadCall();
  }, [client, id]);

  return {
    call,
    isCallLoading
  };
};
