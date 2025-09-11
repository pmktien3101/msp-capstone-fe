'use client';
import React from 'react'
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useState } from 'react';
import { useGetCallById } from '@/hooks/useGetCallById';
import { LoaderCircle } from 'lucide-react';
import MeetingRoom from '@/components/meeting/MeetingRoom';
import { MeetingSetup } from '@/components/meeting/MeetingSetup';

const Meeting = ({ params }: { params: { id: string } }) => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { call, isCallLoading } = useGetCallById(params.id);
  if (isCallLoading) return <LoaderCircle />;
  if (!call) return <LoaderCircle />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup/>
          ) : (
            <MeetingRoom/>
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  )
}

export default Meeting