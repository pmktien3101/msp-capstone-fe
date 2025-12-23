"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { meetingService } from "../../services/meetingService";
import { uploadFileToCloudinary } from "../../services/uploadFileService";

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

  // Upload recording to Cloudinary after meeting ends
  const uploadRecordingToCloud = async (callId: string) => {
    // helper: poll Stream recordings until ready (max ~60s)
    const pollRecordings = async (maxWaitMs = 60000, intervalMs = 3000) => {
      const start = Date.now();

      while (Date.now() - start < maxWaitMs) {
        const recordingsResponse = await call?.queryRecordings();
        const recordings = recordingsResponse?.recordings || [];

        console.log("🎥 Polling recordings...", {
          count: recordings.length,
          hasUrl: recordings[0]?.url ? true : false,
        });

        if (recordings.length > 0 && recordings[0]?.url) {
          return recordings[0];
        }

        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, intervalMs));
      }

      return null;
    };

    try {
      console.log("🔄 Fetching recording from Stream...", { callId });

      const recording = await pollRecordings();
      if (!recording) {
        console.warn(
          "⚠️ Recording not available yet after waiting, skip Cloudinary upload"
        );
        return null;
      }

      console.log("📥 Downloading recording from Stream...", {
        url: recording.url,
      });

      const response = await fetch(recording.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch recording: ${response.status}`);
      }

      const blob = await response.blob();
      const contentType = blob.type || "video/mp4";
      const ext = contentType.includes("webm") ? "webm" : "mp4";

      const filename = `meeting-${callId}-${Date.now()}.${ext}`;
      const file = new File([blob], filename, { type: contentType });

      console.log("☁️ Uploading to Cloudinary...", {
        filename,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      });

      const cloudinaryUrl = await uploadFileToCloudinary(file);

      console.log("✅ Upload successful!", { cloudinaryUrl });
      return cloudinaryUrl;
    } catch (error) {
      console.error("❌ Error uploading recording:", error);
      return null;
    }
  };

  const handleEndForAll = async () => {
    if (!call || isProcessing) return;
    setIsProcessing(true);

    // Store callId before ending call (as call object may be invalidated)
    const callId = call.id;

    try {
      // 1. Upload recording to Cloudinary BEFORE ending call
      let recordUrl: string | null = null;
      try {
        console.log("📤 Starting recording upload to Cloudinary (before ending call)...");
        recordUrl = await uploadRecordingToCloud(callId);
        if (recordUrl) {
          console.log("✅ Recording uploaded successfully:", recordUrl);
        } else {
          console.warn("⚠️ Recording upload returned null (may not be ready yet)");
        }
      } catch (uploadError) {
        console.error("❌ Error uploading recording:", uploadError);
        // Don't block the flow if upload fails
      }

      // 2. Now end the call
      await call.camera?.disable();
      await call.microphone?.disable();
      console.log("Calling endCall()", {
        callId: callId,
        beforeState: call.state,
      });
      await call.endCall();

      // 3. Wait for endedAt timestamp
      const endedAtRaw = await waitForEndedAt();
      let endTime: Date;
      if (endedAtRaw) {
        endTime =
          endedAtRaw instanceof Date ? endedAtRaw : new Date(endedAtRaw);
        console.log("Call endedAt updated on stream:", {
          callId: callId,
          endedAt: endTime,
        });
      } else {
        endTime = new Date();
        console.warn("endedAt not found after endCall, using now:", {
          callId: callId,
          state: call.state,
          endTime,
        });
      }

      // 4. Send end time and recording URL to backend
      try {
        endTime = new Date();
        const res = await meetingService.finishMeeting(callId, endTime, recordUrl);
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
      router.push(`/meeting-detail/${callId}`);
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
      title={isMeetingOwner ? "End Call" : "Leave Call"}
      className={`cursor-pointer flex items-center disabled:opacity-60 disabled:cursor-not-allowed
        bg-red-600 hover:bg-red-700 rounded-full p-4`}
    >
      {isProcessing
        ? isMeetingOwner
          ? "Ending..."
          : "Leaving..."
        : isMeetingOwner
          ? "End Call"
          : "Leave Call"}
    </Button>
  );
};

export default EndCallButton;
