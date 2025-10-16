"use client";
import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import BackgroundFilterSettings from "../filters/background-filter-settings";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Filter, Mic, MicOff, Video, VideoOff, X } from "lucide-react";
import { Call } from "@stream-io/video-react-sdk";
import { toast } from "react-toastify";
import { useUser } from "@/hooks/useUser";

interface MeetingSetupProps {
  setIsSetupComplete: (value: boolean) => void;
  call?: Call;
}

const MeetingSetup = ({
  setIsSetupComplete,
  call: callProp,
}: MeetingSetupProps) => {
  const [isMicToggledOn, setIsMicToggledOn] = useState(true);
  const [isCamToggledOn, setIsCamToggledOn] = useState(true);
  const hookCall = useCall();
  const call = callProp ?? hookCall;
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const { userId } = useUser();
  const [canJoin, setCanJoin] = useState(false);

  // Add this useEffect to check permissions
  useEffect(() => {
    const attendees = call?.state?.custom?.attendeeIds || [];
    setCanJoin(attendees.includes(userId));
  }, [call?.state?.custom?.attendeeIds, userId]);

  if (!call) throw new Error("Call not found in MeetingSetup");

  useEffect(() => {
    if (isCamToggledOn) {
      call?.camera?.enable();
    } else {
      call?.camera?.disable();
    }
  }, [isCamToggledOn, call?.camera]);

  useEffect(() => {
    if (isMicToggledOn) {
      call?.microphone?.enable();
    } else {
      call?.microphone?.disable();
    }
  }, [isMicToggledOn, call?.microphone]);
  useEffect(() => {
    console.log("Meeting state changed:", {
      createdAt: call.state?.startsAt,
      endedAt: call.state?.endedAt,
    });
  }, [call.state?.startsAt, call.state?.endedAt]);

  // Hàm xử lý join với check giờ và participants
  const handleJoin = async () => {
    const now = new Date();
    const startsAt = call.state?.startsAt
      ? new Date(call.state.startsAt)
      : null;
    const endedAt = call.state?.endedAt ? new Date(call.state?.endedAt) : null;

    // Check if user is in attendees list
    const attendees = call.state?.custom?.attendeeIds || [];
    if (!attendees.includes(userId)) {
      toast.error("Bạn không được phép tham gia cuộc họp này", {
        autoClose: 5000,
      });
      return;
    }

    if (endedAt) {
      toast.error("Cuộc họp đã kết thúc", { autoClose: 5000 });
      return;
    }

    if (!startsAt) {
      toast.error("Cuộc họp chưa bắt đầu", { autoClose: 5000 });
      return;
    }

    const earlyJoinTime = new Date(startsAt.getTime() - 30 * 60 * 1000);

    if (now < earlyJoinTime) {
      toast.error("Bạn chỉ có thể vào trước giờ họp 30 phút", {
        autoClose: 5000,
      });
      return;
    }

    try {
      await call.join();
      setIsSetupComplete(true);
    } catch (err) {
      toast.error("🚨 Không thể tham gia cuộc họp");
      console.error(err);
    }
  };

  return (
    <main className="flex h-screen w-full items-center justify-center bg-gradient-to-br bg-white text-white to-orange-100 p-4">
      <div className="w-full max-w-5xl h-[600px] rounded-2xl shadow-2xl bg-white p-8 flex gap-8 border border-orange-200">
        {/* Video Preview - Left Side */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-medium text-orange-800 mb-4">
            Bản xem trước
          </h2>
          <div className="flex-1 rounded-xl overflow-hidden bg-gray-900 border-2 border-orange-300 flex items-center justify-center shadow-lg">
            <VideoPreview className="w-full h-full object-cover" />
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <Button
              onClick={() => setIsMicToggledOn(!isMicToggledOn)}
              className={`cursor-pointer rounded-full h-12 w-12 p-0 flex items-center justify-center transition-all ${
                isMicToggledOn
                  ? "bg-gray-500 hover:bg-gray-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isMicToggledOn ? <Mic size={20} /> : <MicOff size={20} />}
            </Button>
            <Button
              onClick={() => setIsCamToggledOn(!isCamToggledOn)}
              className={`cursor-pointer rounded-full h-12 w-12 p-0 flex items-center justify-center transition-all ${
                isCamToggledOn
                  ? "bg-gray-500 hover:bg-gray-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isCamToggledOn ? <Video size={20} /> : <VideoOff size={20} />}
            </Button>
          </div>
        </div>

        {/* Settings Panel - Right Side */}
        <div className="w-80 flex flex-col">
          <h1 className="text-2xl font-bold text-orange-800 mb-2">
            Sẵn sàng tham gia?
          </h1>
          <p className="text-orange-600 text-sm mb-6">
            Kiểm tra thiết bị, chọn hiệu ứng nền trước khi tham gia
          </p>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
              <span className="text-sm text-orange-800">Cài đặt thiết bị</span>
              <DeviceSettings />
            </div>
            <Button
              onClick={() => setShowFiltersPanel(true)}
              className="w-full bg-orange-100 hover:bg-orange-200 justify-start px-3 py-2 h-auto text-orange-800 border border-orange-200 transition-all"
            >
              <Filter size={18} className="mr-2 text-orange-600" />
              <span>Hiệu ứng nền</span>
            </Button>
          </div>
          <Button
            onClick={handleJoin}
            disabled={!canJoin}
            className={`rounded-full py-3 cursor-pointer text-white font-medium mt-auto shadow-md transition-all transform
              ${
                canJoin
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-105"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {canJoin ? "Tham gia ngay" : "Không có quyền tham gia"}
          </Button>
        </div>
      </div>

      {/* Bộ lọc nền */}
      {showFiltersPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[500px] max-h-[80vh] overflow-y-auto rounded-2xl border border-orange-300 bg-white p-6 text-orange-900 shadow-xl relative">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-orange-200">
              <h3 className="text-lg font-semibold text-orange-800">
                Hiệu ứng nền
              </h3>
              <button
                onClick={() => setShowFiltersPanel(false)}
                className="text-orange-500 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 transition-colors"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>
            <BackgroundFilterSettings />
          </div>
        </div>
      )}
    </main>
  );
};

export default MeetingSetup;
