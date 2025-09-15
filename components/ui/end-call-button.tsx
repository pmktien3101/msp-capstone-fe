"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import React, { useState } from "react";
import { Button } from "./button";
import { useRouter } from "next/navigation";

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const [isEnding, setIsEnding] = useState(false);

  const isMeetingOwner =
    localParticipant?.userId &&
    call?.state?.createdBy?.id === localParticipant.userId;

  if (!isMeetingOwner) return null;

  const handleEnd = async () => {
    if (!call || isEnding) return;
    setIsEnding(true);

    try {
      await call.camera?.disable();
      await call.microphone?.disable();
      await call.endCall();
    } catch (err) {
      console.warn("Error ending call", err);
    } finally {
      router.push("/home");
    }
  };

  return (
    <Button
      onClick={handleEnd}
      disabled={isEnding}
      className="cursor-pointer bg-red-600 hover:bg-red-700 flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isEnding ? "Ending..." : "End Call for All"}
    </Button>
  );
};

export default EndCallButton;
