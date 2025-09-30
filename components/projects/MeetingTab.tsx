"use client";

import { useMemo, useState } from "react";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { CreateMeetingModal } from "./modals/CreateMeetingModal";
import "@/app/styles/meeting-tab.scss";
import { useGetCall } from "@/hooks/useGetCallList";
import { Call } from "@stream-io/video-react-sdk";
import { tokenService } from "@/services/streamService";
import { UpdateMeetingModal } from "./modals/UpdateMeetingModal";
import { toast } from "react-toastify";
import { Eye, Pencil, Trash, Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";

interface MeetingTabProps {
  project: Project;
}

export const MeetingTab = ({ project }: MeetingTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const {
    upcomingCalls,
    endedCalls,
    inProgressCalls,
    isLoadingCall,
    refetchCalls,
  } = useGetCall();
  const [viewType, setViewType] = useState<
    "all" | "upcoming" | "ended" | "inProgress"
  >("all");
  const { role } = useUser();
  const isMember = role === "Member";
  const allMeetings = useMemo(() => {
    return [...upcomingCalls, ...inProgressCalls, ...endedCalls].filter(
      (meeting: any) => meeting.state?.custom?.projectId === project.id
    );
  }, [upcomingCalls, inProgressCalls, endedCalls, project.id]);

  const upcomingProjectMeetings = useMemo(() => {
    return upcomingCalls.filter(
      (meeting: any) => meeting.state?.custom?.projectId === project.id
    );
  }, [upcomingCalls, project.id]);

  const inProgressProjectMeetings = useMemo(() => {
    return inProgressCalls.filter(
      (meeting: any) => meeting.state?.custom?.projectId === project.id
    );
  }, [inProgressCalls, project.id]);

  const endedProjectMeetings = useMemo(() => {
    return endedCalls.filter(
      (meeting: any) => meeting.state?.custom?.projectId === project.id
    );
  }, [endedCalls, project.id]);

  const meetings = useMemo(() => {
    switch (viewType) {
      case "upcoming":
        return upcomingProjectMeetings;
      case "ended":
        return endedProjectMeetings;
      case "inProgress":
        return inProgressProjectMeetings;
      default:
        return allMeetings;
    }
  }, [
    viewType,
    allMeetings,
    upcomingProjectMeetings,
    inProgressProjectMeetings,
    endedProjectMeetings,
  ]);

  const getStatusInfo = (call: Call) => {
    const now = new Date();
    const startsAt = call.state?.startsAt
      ? new Date(call.state.startsAt)
      : null;
    const endedAt = call.state?.endedAt ? new Date(call.state.endedAt) : null;

    if (endedAt) return { label: "Kết thúc", color: "#A41F39" };
    if (startsAt && startsAt > now)
      return { label: "Đã lên lịch", color: "#47D69D" };
    return { label: "Đang diễn ra", color: "#FFA500" };
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

  const allMeetingsCount = allMeetings.length;
  const upcomingMeetingsCount = upcomingProjectMeetings.length;
  const inProgressMeetingsCount = inProgressProjectMeetings.length;
  const endedMeetingsCount = endedProjectMeetings.length;

  return (
    <div className="meeting-tab">
      <div className="meeting-header">
        <div className="meeting-title">
          <h3>Cuộc họp dự án</h3>
          <p>Quản lý các cuộc họp của dự án {project.name}</p>
        </div>
        {!isMember && (
          <Button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: "transparent",
              color: "#FF5E13",
              border: "1px solid #FF5E13",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FF5E13";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#FF5E13";
            }}
          >
            <Plus size={16} />
            Tạo cuộc họp
          </Button>
        )}
      </div>

      <div className="meeting-stats">
        <div className="stat-card">
          <div className="stat-number">{allMeetingsCount}</div>
          <div className="stat-label">Tổng cuộc họp</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{upcomingMeetingsCount}</div>
          <div className="stat-label">Đã lên lịch</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{inProgressMeetingsCount}</div>
          <div className="stat-label">Đang diễn ra</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{endedMeetingsCount}</div>
          <div className="stat-label">Hoàn thành</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button
          onClick={() => setViewType("all")}
          style={{
            background: viewType === "all" ? "#FF5E13" : "transparent",
            color: viewType === "all" ? "white" : "#FF5E13",
            border: "1px solid #FF5E13",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (viewType !== "all") {
              e.currentTarget.style.background = "#FF5E13";
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseLeave={(e) => {
            if (viewType !== "all") {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#FF5E13";
            }
          }}
        >
          Tất cả
        </Button>
        <Button
          onClick={() => setViewType("upcoming")}
          style={{
            background: viewType === "upcoming" ? "#FF5E13" : "transparent",
            color: viewType === "upcoming" ? "white" : "#FF5E13",
            border: "1px solid #FF5E13",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          Sắp tới
        </Button>
        <Button
          onClick={() => setViewType("inProgress")}
          style={{
            background: viewType === "inProgress" ? "#FF5E13" : "transparent",
            color: viewType === "inProgress" ? "white" : "#FF5E13",
            border: "1px solid #FF5E13",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          Đang diễn ra
        </Button>
        <Button
          onClick={() => setViewType("ended")}
          style={{
            background: viewType === "ended" ? "#FF5E13" : "transparent",
            color: viewType === "ended" ? "white" : "#FF5E13",
            border: "1px solid #FF5E13",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
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
              const isStreamMeeting = !!meeting.state;

              const title = isStreamMeeting
                ? meeting.state?.custom?.title || "Cuộc họp"
                : meeting.title;

              const description = isStreamMeeting
                ? meeting.state?.custom?.description?.substring(0, 120)
                : meeting.description;

              const startsAt = isStreamMeeting
                ? meeting.state?.startsAt
                  ? new Date(meeting.state.startsAt)
                  : null
                : meeting.startTime
                ? new Date(meeting.startTime)
                : null;

              const endsAt = isStreamMeeting
                ? meeting.state?.endedAt
                  ? new Date(meeting.state.endedAt)
                  : null
                : meeting.endTime
                ? new Date(meeting.endTime)
                : null;

              const statusInfo = isStreamMeeting
                ? getStatusInfo(meeting)
                : meeting.status === "Scheduled"
                ? { label: "Đã lên lịch", color: "#47D69D" }
                : meeting.status === "Finished"
                ? { label: "Kết thúc", color: "#A41F39" }
                : { label: "Đang diễn ra", color: "#FFA500" };

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
                    {statusInfo.label === "Kết thúc" ? (
                      <span className="text-xs text-gray-400 italic">
                        (Đã đóng)
                      </span>
                    ) : (
                      <button
                        className="room-link cursor-pointer"
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
                  <div className="col-actions flex items-center gap-2 cursor-pointer">
                    <button
                      className="cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                      title="Xem chi tiết"
                      onClick={() => handleView(call)}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {!(viewType === "ended") &&
                      !(statusInfo.label === "Kết thúc") &&
                      !isMember && (
                        <button
                          className="cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                          title="Cập nhật"
                          onClick={() => handleEdit(call)}
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                    {!isMember && (
                      <button
                        className="cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                        title="Xóa"
                        onClick={() => handleDelete(call)}
                      >
                        <Trash className="w-5 h-5 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateMeetingModal
          projectId={project.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => refetchCalls()}
        />
      )}
      {showUpdateModal && selectedCall && (
        <UpdateMeetingModal
          call={selectedCall}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedCall(null);
          }}
          onUpdated={async () => await refetchCalls()}
        />
      )}
    </div>
  );
};
