"use client";

import { useEffect, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";

export const useCallIndicators = () => {
  const call = useCall();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    if (!call) return;

    // Recording events
    const handleRecordingStarted = () => setIsRecording(true);
    const handleRecordingStopped = () => setIsRecording(false);

    call.on("call.recording_started", handleRecordingStarted);
    call.on("call.recording_stopped", handleRecordingStopped);

    // Transcription events
    const handleTranscriptionStarted = () => setIsTranscribing(true);
    const handleTranscriptionStopped = () => setIsTranscribing(false);

    call.on("call.transcription_started", handleTranscriptionStarted);
    call.on("call.transcription_stopped", handleTranscriptionStopped);

    return () => {
      call.off("call.recording_started", handleRecordingStarted);
      call.off("call.recording_stopped", handleRecordingStopped);

      call.off("call.transcription_started", handleTranscriptionStarted);
      call.off("call.transcription_stopped", handleTranscriptionStopped);
    };
  }, [call]);

  return { isRecording, isTranscribing };
};
