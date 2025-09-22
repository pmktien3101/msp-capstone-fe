"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { MonitorUp, MonitorX } from "lucide-react";

export const ScreenShareButton = () => {
  const call = useCall();
  const { useScreenShareState } = useCallStateHooks();
  const { status } = useScreenShareState();
  const [loading, setLoading] = useState(false);

  const toggleScreenShare = async () => {
    if (!call) return;
    try {
      setLoading(true);
      await call.screenShare.toggle();
    } catch (error) {
      console.error("Screen share error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSharing = status === "enabled";

  return (
    <Button
      onClick={toggleScreenShare}
      disabled={loading}
      className={`rounded-full p-4 cursor-pointer ${
        isSharing
          ? "bg-red-600 hover:bg-red-700"
          : "bg-gray-800 hover:bg-gray-700"
      }`}
    >
      {isSharing ? <MonitorX size={20} /> : <MonitorUp size={20} />}
    </Button>
  );
};
