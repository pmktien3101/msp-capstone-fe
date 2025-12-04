"use client";

import { useCallStateHooks } from "@stream-io/video-react-sdk";

export const useCallIndicators = () => {
  const { useIsCallRecordingInProgress, useIsCallTranscribingInProgress } =
    useCallStateHooks();

  const isRecording = useIsCallRecordingInProgress();
  const isTranscribing = useIsCallTranscribingInProgress();

  return { isRecording, isTranscribing };
};
