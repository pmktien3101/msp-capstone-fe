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
import TranscriptButton from "../ui/transcript-button";
import { CallIndicators } from "../ui/CallIndicators";

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

        {/* Transcription Toggle */}
        <TranscriptButton />
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
              Đóng
            </button>
          </div>
          <BackgroundFilterSettings />
        </div>
      )}
    </section>
  );
};

export default MeetingRoom;
