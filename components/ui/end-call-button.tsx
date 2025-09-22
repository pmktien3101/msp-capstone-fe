"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EndCallButton = () => {
  const call = useCall();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!localParticipant) return null;

  const isMeetingOwner =
    localParticipant?.userId &&
    call?.state?.createdBy?.id === localParticipant.userId;

  const handleEndForAll = async () => {
    if (!call || isProcessing) return;
    setIsProcessing(true);
    try {
      await call.camera?.disable();
      await call.microphone?.disable();
      await call.endCall(); // end cho tất cả
    } catch (err) {
      console.warn("Error ending call", err);
    } finally {
      router.push("/projects");
    }
  };

  const handleLeave = async () => {
    if (!call || isProcessing) return;
    setIsProcessing(true);
    try {
      await call.camera?.disable();
      await call.microphone?.disable();
      await call.leave(); // rời call cho participant này
    } catch (err) {
      console.warn("Error leaving call", err);
    } finally {
      router.push("/projects");
    }
  };

  return (
    <Button
      onClick={isMeetingOwner ? handleEndForAll : handleLeave}
      disabled={isProcessing}
      title={isMeetingOwner ? "Kết thúc cuộc gọi cho tất cả" : "Rời cuộc gọi"}
      className={`cursor-pointer flex items-center disabled:opacity-60 disabled:cursor-not-allowed
        bg-red-600 hover:bg-red-700 rounded-full p-4`}
    >
      {isProcessing
        ? isMeetingOwner
          ? "Ending..."
          : "Leaving..."
        : isMeetingOwner
        ? "End Call for All"
        : "Leave Call"}
    </Button>
  );
};

export default EndCallButton;
