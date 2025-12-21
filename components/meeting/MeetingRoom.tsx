"use client";

import { cn } from "@/lib/utils";
import {
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
  ScreenShareButton,
} from "@stream-io/video-react-sdk";
import BackgroundFilterSettings from "../filters/background-filter-settings";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, LayoutList, User } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "../ui/end-call-button";
import MicButton from "../ui/mic-button";
import CameraButton from "../ui/camera-button";
import RecordButton from "../ui/record-button";
import { CallIndicators } from "../ui/CallIndicators";
import { meetingService } from "@/services/meetingService";
import { uploadFileToCloudinary } from "@/services/uploadFileService";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPersonalRoom = !!searchParams.get("personal");
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipantsBar, setShowParticipantsBar] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const call = useCall();
  const subscription = useSubscription();

  const wasJoinedRef = useRef(false);
  const joinTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (callingState === CallingState.JOINED && call) {
      wasJoinedRef.current = true;
      
      // Dùng session.started_at từ Stream - đây là thời gian user đầu tiên join
      // Stream tự động track điều này và đồng bộ giữa tất cả clients
      const sessionStartedAt = (call as any).state?.session?.started_at;
      
      if (sessionStartedAt) {
        // Có session started_at từ Stream
        joinTimeRef.current = new Date(sessionStartedAt).getTime();
        console.log("✅ Session started at (first join):", new Date(joinTimeRef.current).toISOString());
      } else {
        // Fallback: nếu chưa có session, dùng current time
        joinTimeRef.current = Date.now();
        console.log("⚠️ Using current time as fallback:", new Date(joinTimeRef.current).toISOString());
      }
    }
    if (
      wasJoinedRef.current &&
      callingState !== CallingState.JOINED &&
      callingState !== undefined
    ) {
      (async () => {
        try {
          await call?.camera?.disable();
          await call?.microphone?.disable();
        } catch (err) {
          console.warn("Disable devices error", err);
        } finally {
          router.push(`/meeting-detail/${call?.id}`);
        }
      })();
    }
  }, [callingState, router, call]);

  const timersRef = useRef<{ r15?: number; r5?: number; end?: number }>({});

  // minimal toast implementation (self-contained)
  const showToast = (message: string, durationMs = 6000) => {
    try {
      const containerId = "auto-toast-container";
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        // position bottom-right
        container.style.position = "fixed";
        container.style.right = "16px";
        container.style.bottom = "16px";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "8px";
        document.body.appendChild(container);
      }

      const toast = document.createElement("div");
      toast.textContent = message;
      toast.style.background = "rgba(0,0,0,0.85)";
      toast.style.color = "white";
      toast.style.padding = "10px 14px";
      toast.style.borderRadius = "8px";
      toast.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
      toast.style.fontSize = "14px";
      toast.style.maxWidth = "320px";
      toast.style.wordBreak = "break-word";
      toast.style.opacity = "0";
      toast.style.transition = "opacity 180ms ease";

      container.appendChild(toast);

      // fade in
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
      });

      const remove = () => {
        toast.style.opacity = "0";
        setTimeout(() => {
          try {
            toast.remove();
            // if empty container remove it
            if (container && container.childElementCount === 0) {
              container.remove();
            }
          } catch (e) {
            /* ignore */
          }
        }, 200);
      };

      const timeoutId = window.setTimeout(remove, durationMs);
      // allow click to dismiss
      toast.addEventListener("click", () => {
        clearTimeout(timeoutId);
        remove();
      });
    } catch (e) {
      // fallback to console
      // eslint-disable-next-line no-console
      console.log("Toast:", message);
    }
  };

  // helper: poll call.state for an endedAt timestamp (up to timeoutMs)
  const waitForEndedAt = async (timeoutMs = 5000, intervalMs = 300) => {
    const start = Date.now();
    // eslint-disable-next-line no-undef
    while (Date.now() - start < timeoutMs) {
      const endedAt = (call as any)?.state?.endedAt;
      if (endedAt) return endedAt;
      // small delay
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return null;
  };

  // Upload recording to Cloudinary (same logic as end-call-button)
  const uploadRecordingToCloud = async (callId: string) => {
    try {
      console.log("🔄 Fetching recording from Stream (auto-end)...", { callId });
      
      // Wait a bit for Stream to process the recording
      await new Promise((r) => setTimeout(r, 3000));
      
      // Query recordings from Stream
      const recordingsResponse = await call?.queryRecordings();
      const recordings = recordingsResponse?.recordings || [];
      
      if (recordings.length === 0) {
        console.warn("⚠️ No recordings found yet (auto-end)");
        return null;
      }

      const recording = recordings[0];
      if (!recording?.url) {
        console.warn("⚠️ Recording URL not available (auto-end)");
        return null;
      }

      console.log("📥 Downloading recording from Stream (auto-end)...", { url: recording.url });
      
      // Fetch recording from Stream
      const response = await fetch(recording.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch recording: ${response.status}`);
      }

      const blob = await response.blob();
      const contentType = blob.type || "video/mp4";
      const ext = contentType.includes("webm") ? "webm" : "mp4";
      
      // Create file from blob
      const filename = `meeting-${callId}-${Date.now()}.${ext}`;
      const file = new File([blob], filename, { type: contentType });

      console.log("☁️ Uploading to Cloudinary (auto-end)...", { 
        filename, 
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB` 
      });

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadFileToCloudinary(file);
      
      console.log("✅ Upload successful (auto-end)!", { cloudinaryUrl });
      return cloudinaryUrl;
    } catch (error) {
      console.error("❌ Error uploading recording (auto-end):", error);
      return null;
    }
  };

  const endCallDueToTimeout = async () => {
    if (!call) return;
    
    // Store callId before ending call
    const callId = call.id;
    
    try {
      // 1. Upload recording to Cloudinary BEFORE ending call (same as end-call-button)
      let recordUrl: string | null = null;
      try {
        console.log("📤 Starting recording upload to Cloudinary (auto-end, before ending call)...");
        recordUrl = await uploadRecordingToCloud(callId);
        if (recordUrl) {
          console.log("✅ Recording uploaded successfully (auto-end):", recordUrl);
        } else {
          console.warn("⚠️ Recording upload returned null (auto-end, may not be ready yet)");
        }
      } catch (uploadError) {
        console.error("❌ Error uploading recording (auto-end):", uploadError);
        // Don't block the flow if upload fails
      }

      // 2. Now disable devices and end call
      await call.camera?.disable();
      await call.microphone?.disable();
      const meetingDurationLimit = getMeetingDurationLimit();
      showToast(
        `Meeting has reached ${meetingDurationLimit} minutes. Ending call...`,
        4000
      );
      await call.endCall();

      // 3. Wait for endedAt timestamp
      const endedAtRaw = await waitForEndedAt();
      const endTime = endedAtRaw
        ? endedAtRaw instanceof Date
          ? endedAtRaw
          : new Date(endedAtRaw)
        : new Date();

      // 4. Send end time and recording URL to backend
      try {
        const res = await meetingService.finishMeeting(callId, endTime, recordUrl);
        if (res.success) {
          console.log("finishMeeting success (auto end):", res.message);
        } else {
          console.warn("finishMeeting failed (auto end):", res.error || res.message);
        }
      } catch (e) {
        console.error("Error calling meetingService.finishMeeting (auto end)", e);
      }
    } catch (err) {
      console.warn("Error auto-ending call", err);
    } finally {
      // navigate to projects page
      router.push(`/meeting-detail/${call.id}`);
    }
  };

  const getMeetingDurationLimit = (): number => {
    if (subscription?.package?.limitations) {
      const meetingDurationLim = subscription.package.limitations.find(
        (lim: any) => lim.limitationType === "MeetingDuration"
      );
      if (meetingDurationLim && !meetingDurationLim.isUnlimited) {
        console.log("Meeting duration limit:", meetingDurationLim.limitValue);
        return meetingDurationLim.limitValue || 30;
      }
    }
    return 30; // fallback to 30 minutes
  };

  // Schedule meeting reminder (5 minutes before end) and auto-end
  useEffect(() => {
    if (!call) return;

    // Use the actual join time
    if (!joinTimeRef.current) {
      console.warn("⚠️ Join time not yet recorded, skipping reminder scheduling");
      return;
    }

    const startTime = joinTimeRef.current; // This is a timestamp (number)
    const meetingDurationMinutes = getMeetingDurationLimit();
    const now = Date.now();
    const msUntil5 = startTime + (meetingDurationMinutes - 5) * 60 * 1000 - now; // 5 min before end
    const msUntilEnd = startTime + meetingDurationMinutes * 60 * 1000 - now; // at end time

    // Clear existing timers
    if (timersRef.current.r5) {
      clearTimeout(timersRef.current.r5);
      timersRef.current.r5 = undefined;
    }
    if (timersRef.current.end) {
      clearTimeout(timersRef.current.end);
      timersRef.current.end = undefined;
    }

    // Schedule 5-min reminder (5 min before end)
    // Only schedule if the reminder time hasn't passed yet
    if (msUntil5 > 0) {
      timersRef.current.r5 = window.setTimeout(() => {
        showToast("5 minutes remaining until the meeting ends.");
      }, msUntil5);
    }

    // Schedule auto end at meeting duration limit
    if (msUntilEnd > 0) {
      timersRef.current.end = window.setTimeout(() => {
        void endCallDueToTimeout();
      }, msUntilEnd);
    } else {
      // If end time already passed, end immediately
      void endCallDueToTimeout();
    }

    return () => {
      if (timersRef.current.r5) {
        clearTimeout(timersRef.current.r5);
        timersRef.current.r5 = undefined;
      }
      if (timersRef.current.end) {
        clearTimeout(timersRef.current.end);
        timersRef.current.end = undefined;
      }
    };
  }, [call, joinTimeRef.current, subscription?.package?.limitations]);

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-left":
        return <SpeakerLayout participantsBarPosition="right" />;
      default:
        return <SpeakerLayout participantsBarPosition="left" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full justify-center items-center">
        <div className="flex size-full h-full max-w-[1220px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn(
            "h-[calc(100vh-86px)] w-1/4 ml-2 bg-white text-orange-800 p-4",
            {
              hidden: !showParticipantsBar,
              block: showParticipantsBar,
            }
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipantsBar(false)} />
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-2 flex w-full justify-center items-center gap-5 flex-wrap">
        <MicButton />
        <CameraButton />
        <RecordButton />
        <ScreenShareButton />

        {/* Layout Switch */}
        <DropdownMenu>
          <div className="flex items-center gap-2 bg-gray-800 rounded-3xl hover:bg-gray-700 transition-colors">
            <DropdownMenuTrigger className="cursor-pointer px-4 py-2">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-orange-600 bg-white text-black">
            {["Grid", "Speaker Left", "Speaker Right"].map((item, index) => (
              <Fragment key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(
                      item.toLowerCase().replace(" ", "-") as CallLayoutType
                    )
                  }
                  className="cursor-pointer hover:bg-black hover:text-orange-600 transition-colors"
                >
                  {item}
                </DropdownMenuItem>
                {index < 2 && <DropdownMenuSeparator />}
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        {/* Participants */}
        <Button
          onClick={() => setShowParticipantsBar((prev) => !prev)}
          className=" cursor-pointer flex items-center bg-gray-800 hover:bg-gray-700  rounded-3xl"
        >
          <User size={20} />
        </Button>

        {/* Background Filters */}
        <Button
          onClick={() => setShowFiltersPanel((prev) => !prev)}
          className="cursor-pointer bg-gray-800 hover:bg-gray-700 rounded-3xl px-4 py-2"
        >
          <Filter size={20} className="text-white" />
        </Button>
        <EndCallButton />
      </div>
      <CallIndicators />
      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="fixed right-4 bottom-28 w-72 max-h-[60vh] overflow-y-auto rounded-lg border border-orange-600/40 bg-black/70 p-4 text-white backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-orange-400">
              Background
            </h3>
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="text-xs text-orange-300 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
          <BackgroundFilterSettings />
        </div>
      )}
    </section>
  );
};

export default MeetingRoom;
