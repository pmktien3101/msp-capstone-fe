"use client";
import React, { use, useState } from "react";
import {
  StreamCall,
  StreamTheme,
  BackgroundFiltersProvider,
} from "@stream-io/video-react-sdk";
import { useGetCallById } from "@/hooks/useGetCallById";
import { Loader } from "lucide-react";
import MeetingRoom from "@/components/meeting/MeetingRoom";
import MeetingSetup from "@/components/meeting/MeetingSetup";

// Standalone meeting page outside of (root) layout grouping
// Uses only global app layout providers.
const MeetingPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { call, isLoadingCall } = useGetCallById(id);

  if (isLoadingCall) return <Loader />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <BackgroundFiltersProvider
          backgroundFilter="blur"
          backgroundImages={[
            "/avatar-1.png",
            "/avatar-2.png",
            "/avatar-3.png",
            "/avatar-4.png",
          ]}
        >
          <StreamTheme>
            {!isSetupComplete ? (
              <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
            ) : (
              <MeetingRoom />
            )}
          </StreamTheme>
        </BackgroundFiltersProvider>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
