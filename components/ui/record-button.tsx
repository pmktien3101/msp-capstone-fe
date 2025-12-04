"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { Circle, Square } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

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
  const [hasRecorded, setHasRecorded] = useState(false);
  const [hasExistingRecordings, setHasExistingRecordings] = useState(false);
  const [showStopConfirmDialog, setShowStopConfirmDialog] = useState(false);

  const isMeetingOwner =
    localParticipant?.userId &&
    call?.state?.createdBy?.id === localParticipant.userId;

  useEffect(() => {
    if (!call) return;
    const subs = [
      call.on("call.recording_started", () => {
        setLoading(false);
        setHasRecorded(true);
      }),
      call.on("call.recording_stopped", () => setLoading(false)),
    ];
    return () => subs.forEach((off) => off());
  }, [call]);

  useEffect(() => {
    const checkExistingRecordings = async () => {
      if (!call) return;
      try {
        const res = await call.queryRecordings();
        if (res.recordings && res.recordings.length > 0) {
          setHasExistingRecordings(true);
        }
      } catch (err) {
        console.error("Error checking recordings:", err);
      }
    };

    checkExistingRecordings();
  }, [call]);

  const toggleRecordAndTranscript = useCallback(async () => {
    if (!call) return;

    if (hasExistingRecordings && !isRecording) {
      toast.warning("This call has already been recorded!");
      return;
    }

    if (isRecording) {
      setShowStopConfirmDialog(true);
      return;
    }

    setLoading(true);
    try {
      // Check again before starting recording
      const res = await call.queryRecordings();
      if (res.recordings && res.recordings.length > 0) {
        toast.warning("This call has already been recorded!");
        setHasExistingRecordings(true);
        setLoading(false);
        return;
      }
      // start both
      await Promise.allSettled([
        call.startRecording(),
        call.startTranscription(),
      ]);
      toast.success("Recording started!");
    } catch (err) {
      console.error("Record/Transcript error", err);
      toast.error("Error starting/stopping recording!");
    } finally {
      setLoading(false);
    }
  }, [call, isRecording, hasExistingRecordings]);

  const handleConfirmStopRecording = useCallback(async () => {
    if (!call) return;

    setShowStopConfirmDialog(false);
    setLoading(true);
    try {
      await Promise.allSettled([
        call.stopRecording(),
        call.stopTranscription(),
      ]);
      setHasExistingRecordings(true);
      toast.info("Recording stopped!");
    } catch (err) {
      console.error("Record/Transcript error", err);
      toast.error("Error stopping recording!");
    } finally {
      setLoading(false);
    }
  }, [call]);

  if (!isMeetingOwner) return null;

  return (
    <>
      <Button
        onClick={toggleRecordAndTranscript}
        disabled={loading || (hasExistingRecordings && !isRecording)}
        title={
          isRecording
            ? "Stop recording"
            : hasExistingRecordings
            ? "Cannot record again"
            : "Start recording"
        }
        className={`rounded-full p-4 cursor-pointer ${
          isRecording
            ? "bg-red-600 hover:bg-red-700"
            : hasExistingRecordings && !isRecording
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        {isRecording ? <Square size={20} /> : <Circle size={20} />}
      </Button>

      <Dialog
        open={showStopConfirmDialog}
        onOpenChange={setShowStopConfirmDialog}
      >
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Stop Recording?</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to stop recording? You cannot record again
              after stopping!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowStopConfirmDialog(false)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmStopRecording}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Stop Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecordButton;
