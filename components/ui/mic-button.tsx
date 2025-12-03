"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { Mic, MicOff } from "lucide-react";
import { useState } from "react";

const MicButton = () => {
  const call = useCall();
  const { useMicrophoneState } = useCallStateHooks();
  const { isEnabled } = useMicrophoneState();
  const [loading, setLoading] = useState(false);

  const toggleMic = async () => {
    if (!call) return;
    setLoading(true);
    try {
      if (isEnabled) {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleMic}
      disabled={loading}
      title={isEnabled ? "Mute" : "Unmute"}
      className={`rounded-full p-3 cursor-pointer ${
        isEnabled ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600"
      }`}
    >
      {isEnabled ? <Mic size={20} /> : <MicOff size={20} />}
    </Button>
  );
};

export default MicButton;
