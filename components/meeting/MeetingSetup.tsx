"use client";
import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import BackgroundFilterSettings from "../filters/background-filter-settings";
import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Filter } from "lucide-react";

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);
  const call = useCall();
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  if (!call) throw new Error("Call not found in MeetingSetup");
  useEffect(() => {
    if (isMicCamToggledOn) {
      call?.camera?.disable();
      call?.microphone?.disable();
    } else {
      call?.camera?.enable();
      call?.microphone?.enable();
    }
  }, [isMicCamToggledOn, call?.camera, call?.microphone]);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-2xl font-bold text-orange-800">Setup</h1>
      <div className="flex w-[500px] h-[280px] rounded-xl overflow-hidden shadow-lg justify-center items-center bg-black">
        <VideoPreview className="w-full h-full object-cover flex justify-center items-center text-orange-800" />
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-2 w-full md:w-auto">
        <Label className="flex items-center gap-2 text-orange-800 whitespace-nowrap bg-black/30 px-3 py-2 rounded-md border border-orange-700/40">
          <Input
            type="checkbox"
            checked={isMicCamToggledOn}
            onChange={() => setIsMicCamToggledOn(!isMicCamToggledOn)}
          />
          <span className="text-sm">Join with Mic & Camera Off</span>
        </Label>
        <div className="bg-black/30 rounded-md border border-orange-700/40 p-2 flex items-center">
          <DeviceSettings />
        </div>
        <div className="flex items-center">
          <Button
            onClick={() => setShowFiltersPanel((prev) => !prev)}
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 rounded-3xl px-4 py-2 flex items-center justify-center"
            title="Background Filters"
          >
            <Filter size={20} className="text-white" />
          </Button>
        </div>
        {showFiltersPanel && (
          <div className="fixed right-4 bottom-28 w-72 max-h-[60vh] overflow-y-auto rounded-lg border border-orange-600/40 bg-black/70 p-4 text-white backdrop-blur z-50">
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
      </div>
      <Button
        onClick={() => {
          call?.join();
          setIsSetupComplete(true);
        }}
        className="rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 cursor-pointer"
      >
        Join Meeting
      </Button>
    </main>
  );
};

export default MeetingSetup;
