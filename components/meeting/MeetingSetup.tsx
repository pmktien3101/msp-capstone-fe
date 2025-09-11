'use client';
import { VideoPreview, useCall } from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react';
import { th } from 'zod/v4/locales';

export const MeetingSetup = () => {
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);
  const call = useCall();

  if(!call) throw new Error("Call object is not available") ;

  useEffect(() => {
    if (!isMicCamToggledOn) {
      call?.camera?.disable();
      call?.microphone?.disable();
    } else {
      call?.camera?.enable();
      call?.microphone?.enable();
    }
  }, [isMicCamToggledOn, call?.camera, call?.microphone]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-2xl font-bold">Setup</h1>
      <div className="flex flex-col items-center gap-4">
        <VideoPreview />
        <div className="flex gap-2">
          <button
            onClick={() => call?.camera?.toggle()}
            className="rounded-full bg-blue-500 p-2 hover:bg-blue-600"
          >
            Toggle Camera
          </button>
          <button
            onClick={() => call?.microphone?.toggle()}
            className="rounded-full bg-blue-500 p-2 hover:bg-blue-600"
          >
            Toggle Mic
          </button>
        </div>
        <button
          onClick={() => {}}
          className="rounded-lg bg-green-500 px-4 py-2 font-semibold hover:bg-green-600"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
};