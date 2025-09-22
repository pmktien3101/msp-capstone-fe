"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { Circle, Square } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const RecordButton = () => {
  const call = useCall();
  const { useIsCallRecordingInProgress, useLocalParticipant } =
    useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();
  const localParticipant = useLocalParticipant();
  const [loading, setLoading] = useState(false);

  // Chỉ hiển thị nếu local participant là người tạo cuộc gọi
  const isMeetingOwner =
    localParticipant?.userId &&
    call?.state?.createdBy?.id === localParticipant.userId;

  useEffect(() => {
    if (!call) return;
    const subs = [
      call.on("call.recording_started", () => setLoading(false)),
      call.on("call.recording_stopped", () => setLoading(false)),
    ];
    return () => subs.forEach((off) => off());
  }, [call]);

  const toggleRecording = useCallback(async () => {
    if (!call) return;
    setLoading(true);
    try {
      if (isRecording) {
        await call.stopRecording();
      } else {
        await call.startRecording();
      }
    } catch (err) {
      console.error("Record error", err);
      setLoading(false);
    }
  }, [call, isRecording]);

  if (!isMeetingOwner) return null;

  return (
    <Button
      onClick={toggleRecording}
      disabled={loading}
      title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
      className={`rounded-full p-4 cursor-pointer ${
        isRecording
          ? "bg-red-600 hover:bg-red-700"
          : "bg-gray-800 hover:bg-gray-700"
      }`}
    >
      {isRecording ? <Square size={20} /> : <Circle size={20} />}
    </Button>
  );
};

export default RecordButton;
