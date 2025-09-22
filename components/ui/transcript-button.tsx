"use client";

import {
  useCall,
  useCallStateHooks,
  TranscriptionSettingsRequestModeEnum,
} from "@stream-io/video-react-sdk";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const TranscriptButton = () => {
  const call = useCall();
  const {
    useCallSettings,
    useIsCallTranscribingInProgress,
    useLocalParticipant,
  } = useCallStateHooks();
  const { transcription } = useCallSettings() || {};
  const isTranscribing = useIsCallTranscribingInProgress();
  const localParticipant = useLocalParticipant();

  const [isLoading, setIsLoading] = useState(false);
  const [autoOnActivated, setAutoOnActivated] = useState(false);

  // Kiểm tra xem local participant có phải creator không
  const isMeetingOwner =
    localParticipant?.userId &&
    call?.state?.createdBy?.id === localParticipant.userId;

  useEffect(() => {
    if (
      call &&
      transcription?.mode === TranscriptionSettingsRequestModeEnum.AUTO_ON &&
      !autoOnActivated &&
      isMeetingOwner // chỉ auto-on nếu là người tạo cuộc gọi
    ) {
      setIsLoading(true);
      call
        .startTranscription()
        .then(() => {
          toast.success("Transcription started automatically!");
        })
        .catch((err) => {
          console.error("Failed to start transcription", err);
          toast.error("Failed to start transcription");
        })
        .finally(() => setIsLoading(false));
      setAutoOnActivated(true);
    }
  }, [call, transcription, autoOnActivated, isMeetingOwner]);

  if (
    transcription?.mode === TranscriptionSettingsRequestModeEnum.DISABLED ||
    !isMeetingOwner // không hiển thị nếu không phải creator
  )
    return null;

  const handleToggleTranscription = async () => {
    if (!call || isLoading) return;
    setIsLoading(true);

    try {
      if (isTranscribing) {
        await call.stopTranscription();
        toast("Dừng transcription!");
      } else {
        await call.startTranscription();
        toast.success("Bắt đầu transcription!");
      }
    } catch (err) {
      console.error("Transcription toggle failed", err);
      toast.error("Transcription toggle failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleTranscription}
      disabled={isLoading}
      title={isTranscribing ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
      className={`px-4 py-2 rounded-full font-semibold text-white transition-colors duration-200
        ${
          isTranscribing
            ? "bg-red-600 hover:bg-red-700"
            : "bg-gray-800 hover:bg-gray-700"
        }
        ${isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {isTranscribing ? "Stop Transcription" : "Start Transcription"}
    </button>
  );
};

export default TranscriptButton;
