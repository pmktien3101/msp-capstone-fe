"use client";
import React from "react";
import { useCallIndicators } from "@/hooks/useCallIndicators";

export const CallIndicators = () => {
  const { isRecording, isTranscribing } = useCallIndicators();

  if (!isRecording && !isTranscribing) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
        {isRecording || isTranscribing
          ? "Đang ghi hình và transcription..."
          : ""}
      </div>
    </div>
  );
};
