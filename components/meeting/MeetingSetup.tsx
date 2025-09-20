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

import { Call } from "@stream-io/video-react-sdk";

interface MeetingSetupProps {
  setIsSetupComplete: (value: boolean) => void;
  call?: Call;
}

const MeetingSetup = ({
  setIsSetupComplete,
  call: callProp,
}: MeetingSetupProps) => {
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);
  const hookCall = useCall();
  const call = callProp ?? hookCall;
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
    <main className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 text-white p-4">
      <div className="w-full max-w-xl rounded-2xl shadow-2xl bg-white/90 p-8 flex flex-col items-center gap-6 border border-orange-200">
        <h1 className="text-3xl font-bold text-orange-700 mb-2">
          Thiết lập cuộc họp
        </h1>
        <p className="text-gray-600 text-center mb-2">
          Kiểm tra thiết bị, chọn hiệu ứng nền và sẵn sàng tham gia cuộc họp!
        </p>
        <div className="w-full flex justify-center">
          <div className="w-[340px] h-[200px] rounded-xl overflow-hidden shadow-lg border border-orange-100 bg-black flex items-center justify-center">
            <VideoPreview className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <Label className="flex items-center gap-2 text-orange-700 whitespace-nowrap bg-orange-50 px-3 py-2 rounded-lg border border-orange-200 shadow-sm">
            <Input
              type="checkbox"
              checked={isMicCamToggledOn}
              onChange={() => setIsMicCamToggledOn(!isMicCamToggledOn)}
            />
            <span className="text-sm">Tắt Mic & Camera</span>
          </Label>
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="bg-orange-50 rounded-full border border-orange-300 shadow flex items-center justify-center p-3 transition-all duration-150 hover:shadow-lg">
              <DeviceSettings />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button
              onClick={() => setShowFiltersPanel((prev) => !prev)}
              className="cursor-pointer bg-orange-100 hover:bg-orange-200 rounded-full px-4 py-2 flex items-center justify-center border border-orange-300 shadow"
              title="Hiệu ứng nền"
            >
              <Filter size={20} className="text-orange-600" />
              <span className="ml-2 text-orange-700 text-sm font-medium">
                Nền
              </span>
            </Button>
          </div>
        </div>
        {showFiltersPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[340px] max-h-[70vh] overflow-y-auto rounded-2xl border border-orange-400 bg-white p-6 text-gray-800 shadow-xl relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-500">
                  Hiệu ứng nền
                </h3>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="text-sm text-orange-400 hover:text-orange-700 font-bold px-2 py-1 rounded cursor-pointer"
                  aria-label="Đóng"
                >
                  Đóng
                </button>
              </div>
              <BackgroundFilterSettings />
            </div>
          </div>
        )}
        <Button
          onClick={() => {
            call?.join();
            setIsSetupComplete(true);
          }}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-white text-lg font-semibold shadow-lg hover:scale-105 hover:bg-orange-700 transition-all duration-150 mt-4"
        >
          Tham gia cuộc họp
        </Button>
      </div>
    </main>
  );
};

export default MeetingSetup;
