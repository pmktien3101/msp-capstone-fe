"use client";

import { useEffect, useMemo, useState } from "react";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { CreateMeetingModal } from "./modals/CreateMeetingModal";
import "@/app/styles/meeting-tab.scss";
import { useGetCall } from "@/hooks/useGetCallList";
import { Call } from "@stream-io/video-react-sdk";
import { Loader, MoreHorizontal } from "lucide-react";
import { tokenService } from "@/services/streamService";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UpdateMeetingModal } from "./modals/UpdateMeetingModal";
import { toast } from "react-toastify";

interface MeetingTabProps {
  project: Project;
}

export const MeetingTab = ({ project }: MeetingTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const { upcomingCalls, endedCalls, isLoadingCall, refetchCalls } =
    useGetCall();
  const [viewType, setViewType] = useState<"upcoming" | "ended">("upcoming");

  const meetings = useMemo(() => {
    return viewType === "ended" ? endedCalls : upcomingCalls;
  }, [viewType, upcomingCalls, endedCalls]);

  const getStatusInfo = (call: Call) => {
    const now = new Date();
    const startsAt = call.state?.startsAt
      ? new Date(call.state.startsAt)
      : null;
    const endedAt = call.state?.endedAt ? new Date(call.state.endedAt) : null;

    if (startsAt && startsAt > now) {
      return { label: "Lên lịch", color: "#3b82f6" };
    }

    return { label: "Hoàn thành", color: "#10b981" };
  };

  const handleJoin = (call: Call) => {
    window.open(`/meeting/${call.id}`, "_blank");
  };

  const handleView = (call: Call) => {
    window.location.href = `/meeting-detail/${call.id}`;
  };

  const handleEdit = (call: Call) => {
    setSelectedCall(call);
    setShowUpdateModal(true);
  };

  const handleDelete = async (call: Call) => {
    if (!confirm("Bạn chắc chắn muốn xóa cuộc họp này?")) return;
    try {
      await tokenService.deleteCall(call.id, true);
      await refetchCalls();
      toast.success("Đã xóa cuộc họp");
    } catch (e: any) {
      console.error("Delete call failed", e);
      toast.error(e?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="meeting-tab">
      <div className="meeting-header">
        <div className="meeting-title">
          <h3>Cuộc họp dự án</h3>
          <p>Quản lý các cuộc họp của dự án {project.name}</p>
        </div>
        <Button
          onClick={() => {
            console.log("Create meeting button clicked");
            setShowCreateModal(true);
          }}
          className="create-meeting-btn"
        >
          ➕ Tạo cuộc họp
        </Button>
      </div>
      <div className="meeting-stats">
        <div className="stat-card">
          <div className="stat-number">
            {upcomingCalls.length + endedCalls.length}
          </div>
          <div className="stat-label">Tổng cuộc họp</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{upcomingCalls.length}</div>
          <div className="stat-label">Đã lên lịch</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{endedCalls.length}</div>
          <div className="stat-label">Hoàn thành</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button
          variant={viewType === "upcoming" ? "default" : "outline"}
          onClick={() => setViewType("upcoming")}
        >
          Sắp tới
        </Button>
        <Button
          variant={viewType === "ended" ? "default" : "outline"}
          onClick={() => setViewType("ended")}
        >
          Đã kết thúc
        </Button>
      </div>

      <div className="meeting-list">
        {isLoadingCall ? (
          <div className="meeting-tab-loading">
            <div className="loading-spinner" />
            <p>Đang tải cuộc họp...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h4>Chưa có cuộc họp nào</h4>
          </div>
        ) : (
          <div className="meeting-table">
            <div
              className="table-header"
              style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr" }}
            >
              <div className="col-title">Tiêu đề</div>
              <div className="col-time">Thời gian</div>
              <div className="col-room">Phòng họp</div>
              <div className="col-status">Trạng thái</div>
              <div className="col-actions">Thao tác</div>
            </div>
            {meetings.map((meeting: any, idx: number) => {
              const call = meeting as Call;
              const title = call.state?.custom?.title || "Cuộc họp";
              const description = call.state?.custom?.description?.substring(
                0,
                120
              );
              const startsAt = call.state?.startsAt
                ? new Date(call.state.startsAt)
                : null;
              const endsAt = call.state?.endedAt
                ? new Date(call.state.endedAt)
                : null;
              const statusInfo = getStatusInfo(call);
              return (
                <div
                  key={call.id || idx}
                  className="table-row"
                  style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr" }}
                >
                  <div className="col-title">
                    <div className="meeting-title-text">{title}</div>
                    {description && (
                      <div className="meeting-description">{description}</div>
                    )}
                  </div>
                  <div className="col-time">
                    <div className="time-info">
                      {startsAt && (
                        <div className="start-time">
                          {startsAt.toLocaleString("vi-VN")}
                        </div>
                      )}
                      {endsAt && (
                        <div className="end-time">
                          {endsAt.toLocaleString("vi-VN")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-room">
                    {viewType === "ended" ? (
                      <span className="text-xs text-gray-400 italic">
                        (Đã kết thúc)
                      </span>
                    ) : (
                      <button
                        className="room-link"
                        onClick={() => handleJoin(call)}
                      >
                        Tham gia
                      </button>
                    )}
                  </div>
                  <div className="col-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="col-actions flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleView(call)}>
                          Xem chi tiết
                        </DropdownMenuItem>
                        {!(viewType === "ended") && (
                          <DropdownMenuItem onClick={() => handleJoin(call)}>
                            Tham gia
                          </DropdownMenuItem>
                        )}
                        {!(viewType === "ended") && (
                          <DropdownMenuItem onClick={() => handleEdit(call)}>
                            Cập nhật
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(call)}
                          className="text-red-600 focus:text-red-700"
                          data-variant="destructive"
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            // Refetch list so the new meeting appears immediately
            refetchCalls();
          }}
        />
      )}
      {showUpdateModal && selectedCall && (
        <UpdateMeetingModal
          call={selectedCall}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedCall(null);
          }}
          onUpdated={async () => {
            await refetchCalls();
          }}
        />
      )}
    </div>
  );
};
