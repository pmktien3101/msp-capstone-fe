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

  const wasJoinedRef = useRef(false);

  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      wasJoinedRef.current = true;
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
          router.push("/projects");
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

  const endCallDueToTimeout = async () => {
    if (!call) return;
    try {
      await call.camera?.disable();
      await call.microphone?.disable();
      showToast("Meeting has reached 30 minutes. Ending call...", 4000);
      await call.endCall();

      const endedAtRaw = await waitForEndedAt();
      const endTime = endedAtRaw
        ? endedAtRaw instanceof Date
          ? endedAtRaw
          : new Date(endedAtRaw)
        : new Date();

      try {
        await meetingService.finishMeeting(call.id, endTime);
        console.log("finishMeeting success (auto end)", call.id);
      } catch (e) {
        console.error(
          "Error calling meetingService.finishMeeting (auto end)",
          e
        );
      }
    } catch (err) {
      console.warn("Error auto-ending call", err);
    } finally {
      // navigate to meeting detail page
      router.push(`/projects`);
    }
  };

  useEffect(() => {
    if (!call) return;

    // determine start time (try common fields)
    const startRaw =
      (call as any)?.state?.createdAt ||
      (call as any)?.state?.startedAt ||
      (call as any)?.createdAt ||
      (call as any)?.created_at;
    if (!startRaw) return;

    const startTime = new Date(startRaw);
    if (Number.isNaN(startTime.getTime())) return;

    const now = Date.now();
    const msUntil15 = startTime.getTime() + 15 * 60 * 1000 - now; // 15 min after start (15 left)
    const msUntil25 = startTime.getTime() + 25 * 60 * 1000 - now; // 25 min after start (5 left)
    const msUntilEnd = startTime.getTime() + 30 * 60 * 1000 - now; // 30 min after start

    // clear existing timers
    if (timersRef.current.r15) {
      clearTimeout(timersRef.current.r15);
      timersRef.current.r15 = undefined;
    }
    if (timersRef.current.r5) {
      clearTimeout(timersRef.current.r5);
      timersRef.current.r5 = undefined;
    }
    if (timersRef.current.end) {
      clearTimeout(timersRef.current.end);
      timersRef.current.end = undefined;
    }

    // schedule 15-min reminder (15 min after start, 15 min remaining)
    // Only schedule if the reminder time hasn't passed yet
    if (msUntil15 > 0) {
      timersRef.current.r15 = window.setTimeout(() => {
        showToast("15 minutes remaining until the meeting ends.");
      }, msUntil15);
    }

    // schedule 5-min reminder (25 min after start, 5 min remaining)
    // Only schedule if the reminder time hasn't passed yet
    if (msUntil25 > 0) {
      timersRef.current.r5 = window.setTimeout(() => {
        showToast("5 minutes remaining until the meeting ends.");
      }, msUntil25);
    }

    // schedule auto end at 30 minutes
    if (msUntilEnd > 0) {
      timersRef.current.end = window.setTimeout(() => {
        void endCallDueToTimeout();
      }, msUntilEnd);
    } else {
      // if end time already passed, end immediately
      void endCallDueToTimeout();
    }

    return () => {
      if (timersRef.current.r15) {
        clearTimeout(timersRef.current.r15);
        timersRef.current.r15 = undefined;
      }
      if (timersRef.current.r5) {
        clearTimeout(timersRef.current.r5);
        timersRef.current.r5 = undefined;
      }
      if (timersRef.current.end) {
        clearTimeout(timersRef.current.end);
        timersRef.current.end = undefined;
      }
    };
    // only re-run when call identity/state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    call?.id,
    (call as any)?.state?.createdAt,
    (call as any)?.state?.startedAt,
  ]);

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
