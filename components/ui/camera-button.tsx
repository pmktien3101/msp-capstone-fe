"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { Video, VideoOff } from "lucide-react";
import { useState } from "react";

const CameraButton = () => {
  const call = useCall();
  const { useCameraState } = useCallStateHooks();
  const { isEnabled } = useCameraState();
  const [loading, setLoading] = useState(false);

  const toggleCamera = async () => {
    if (!call) return;
    setLoading(true);
    try {
      if (isEnabled) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleCamera}
      disabled={loading}
      title={isEnabled ? "Turn off camera" : "Turn on camera"}
      className={`rounded-full p-3 cursor-pointer ${
        isEnabled ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600"
      }`}
    >
      {isEnabled ? <Video size={20} /> : <VideoOff size={20} />}
    </Button>
  );
};

export default CameraButton;
