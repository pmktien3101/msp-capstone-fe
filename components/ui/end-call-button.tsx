"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { meetingService } from "../../services/meetingService";

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

  // helper: poll call.state for an endedAt timestamp (up to timeoutMs)
  const waitForEndedAt = async (timeoutMs = 5000, intervalMs = 300) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const endedAt = (call as any)?.state?.endedAt;
      if (endedAt) return endedAt;
      // small delay
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return null;
  };

  const handleEndForAll = async () => {
    if (!call || isProcessing) return;
    setIsProcessing(true);
    try {
      await call.camera?.disable();
      await call.microphone?.disable();
      console.log("Calling endCall()", {
        callId: call.id,
        beforeState: call.state,
      });
      await call.endCall();

      // wait a short while for the call stream/state to update with an end timestamp
      const endedAtRaw = await waitForEndedAt();
      let endTime: Date;
      if (endedAtRaw) {
        endTime =
          endedAtRaw instanceof Date ? endedAtRaw : new Date(endedAtRaw);
        console.log("Call endedAt updated on stream:", {
          callId: call.id,
          endedAt: endTime,
        });
      } else {
        endTime = new Date();
        console.warn("endedAt not found after endCall, using now:", {
          callId: call.id,
          state: call.state,
          endTime,
        });
      }

      // send end time to backend
      try {
        const res = await meetingService.finishMeeting(call.id, endTime);
        if (res.success) {
          console.log("finishMeeting success:", res.message);
        } else {
          console.warn("finishMeeting failed:", res.error || res.message);
        }
      } catch (e) {
        console.error("Error calling meetingService.finishMeeting", e);
      }
    } catch (err) {
      console.warn("Error ending call", err);
    } finally {
      setIsProcessing(false);
      router.push(`/meeting-detail/${call.id}`);
    }
  };

  const handleLeave = async () => {
    if (!call || isProcessing) return;
    setIsProcessing(true);
    try {
      await call.camera?.disable();
      await call.microphone?.disable();
      await call.leave();
    } catch (err) {
      console.warn("Error leaving call", err);
    } finally {
      setIsProcessing(false);
      router.push(`/meeting-detail/${call.id}`);
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
        ? "Kết thúc cuộc gọi"
        : "Rời cuộc gọi"}
    </Button>
  );
};

export default EndCallButton;
