"use client";

import {
  useCall,
  useCallStateHooks,
  TranscriptionSettingsRequestModeEnum,
} from "@stream-io/video-react-sdk";
import React, { useState, useEffect } from "react";

const TranscriptButton = () => {
  const call = useCall();
  const { useCallSettings, useIsCallTranscribingInProgress } =
    useCallStateHooks();
  const { transcription } = useCallSettings() || {};
  const isTranscribing = useIsCallTranscribingInProgress();

  const [isLoading, setIsLoading] = useState(false);
  const [autoOnActivated, setAutoOnActivated] = useState(false);

  // Nếu transcription bị DISABLED thì không render
  if (transcription?.mode === TranscriptionSettingsRequestModeEnum.DISABLED)
    return null;

  // Auto-on: nếu chế độ auto-on và chưa activate thì bật transcription
  useEffect(() => {
    if (
      call &&
      transcription?.mode === TranscriptionSettingsRequestModeEnum.AUTO_ON &&
      !autoOnActivated
    ) {
      setIsLoading(true);
      call
        .startTranscription()
        .catch((err) => console.error("Failed to start transcription", err))
        .finally(() => setIsLoading(false));
      setAutoOnActivated(true);
    }
  }, [call, transcription, autoOnActivated]);

  const handleToggleTranscription = async () => {
    if (!call || isLoading) return;
    setIsLoading(true);

    try {
      if (isTranscribing) {
        await call.stopTranscription();
      } else {
        await call.startTranscription();
      }
    } catch (err) {
      console.error("Transcription toggle failed", err);
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
