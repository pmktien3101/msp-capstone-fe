"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { Circle, Square } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const RecordButton = () => {
  const call = useCall();
  const {
    useIsCallRecordingInProgress,
    useLocalParticipant,
    useIsCallTranscribingInProgress,
  } = useCallStateHooks();

  const isRecording = useIsCallRecordingInProgress();
  const isTranscribing = useIsCallTranscribingInProgress();
  const localParticipant = useLocalParticipant();
  const [loading, setLoading] = useState(false);

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

  const toggleRecordAndTranscript = useCallback(async () => {
    if (!call) return;
    setLoading(true);
    try {
      if (isRecording) {
        // stop both
        await Promise.allSettled([
          call.stopRecording(),
          call.stopTranscription(),
        ]);
        toast.info("Đã dừng ghi hình và transcription!");
      } else {
        // start both
        await Promise.allSettled([
          call.startRecording(),
          call.startTranscription(),
        ]);
        toast.success("Bắt đầu ghi hình + transcription!");
      }
    } catch (err) {
      console.error("Record/Transcript error", err);
      toast.error("Lỗi khi bật/tắt ghi hình kèm transcription!");
    } finally {
      setLoading(false);
    }
  }, [call, isRecording]);

  if (!isMeetingOwner) return null;

  return (
    <Button
      onClick={toggleRecordAndTranscript}
      disabled={loading}
      title={
        isRecording
          ? "Dừng ghi và transcription"
          : "Bắt đầu ghi và transcription"
      }
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
