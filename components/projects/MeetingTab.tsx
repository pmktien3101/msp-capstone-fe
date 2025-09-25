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

type MeetingTabProps = {
  project: Project;
};

export const MeetingTab = ({ project }: MeetingTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const { upcomingCalls, endedCalls, isLoadingCall, refetchCalls } =
    useGetCall();
  const [viewType, setViewType] = useState<"all" | "upcoming" | "ended">("all");
  const { role } = useUser();
  const isMember = role === "Member";
  // Lọc meetings theo projectId
  const allMeetings = useMemo(() => {
    return [...upcomingCalls, ...endedCalls].filter(
      (meeting: any) => meeting.state?.custom?.projectId === project.id
    );
  }, [upcomingCalls, endedCalls, project.id]);

  const upcomingProjectMeetings = useMemo(() => {
    return upcomingCalls.filter(
      (meeting: any) => meeting.state?.custom?.projectId === project.id
    );
  }, [upcomingCalls, project.id]);

  const endedProjectMeetings = useMemo(() => {
    return endedCalls.filter(
      (meeting: any) => meeting.state?.custom?.projectId === project.id
    );
  }, [endedCalls, project.id]);

  // Meetings hiển thị theo tab
  const meetings = useMemo(() => {
    const now = new Date();

    const streamMeetings =
      viewType === "all"
        ? allMeetings
        : viewType === "upcoming"
        ? upcomingProjectMeetings
        : endedProjectMeetings;

    // Combine and sort all meetings
    const combinedMeetings = [...streamMeetings];

    // Type guard to check if meeting has 'state'
    const hasState = (meeting: any): meeting is Call => {
      return typeof meeting === "object" && "state" in meeting;
    };

    // Sort by start time in descending order
    return combinedMeetings.sort((a, b) => {
      const aTime =
        hasState(a) && a.state?.startsAt
          ? new Date(a.state.startsAt)
          : new Date();
      const bTime =
        hasState(b) && b.state?.startsAt
          ? new Date(b.state.startsAt)
          : new Date();
      return aTime.getTime() - bTime.getTime();
    });
  }, [
    viewType,
    allMeetings,
    upcomingProjectMeetings,
    endedProjectMeetings,
    project.id,
  ]);

  const getStatusInfo = (call: Call) => {
    const now = new Date();
    const startsAt = call.state?.startsAt
      ? new Date(call.state.startsAt)
      : null;
    const endedAt = call.state?.endedAt ? new Date(call.state.endedAt) : null;

    if (startsAt && startsAt > now) {
      return { label: "Đã lên lịch", color: "#47D69D" };
    }

    return { label: "Kết thúc", color: "#A41F39" };
  };

  const handleJoin = (call: Call) => {
    window.open(`/meeting/${call.id}`, "_blank");
  };

  const handleView = (call: Call) => {
    window.location.href = `/meeting-detail/${call.id}`;
  };

  const handleEdit = (call: Call) => {
    setSelectedCall(call as Call);
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

  // Update the stats calculations to include mock meetings
  const allMeetingsCount = useMemo(() => {
    return allMeetings.length;
  }, [allMeetings]);

  const upcomingMeetingsCount = useMemo(() => {
    return upcomingProjectMeetings.length;
  }, [upcomingProjectMeetings]);

  const endedMeetingsCount = useMemo(() => {
    return endedProjectMeetings.length;
  }, [endedProjectMeetings]);

  return (
    <div className="meeting-tab">
      <div className="meeting-header">
        <div className="meeting-title">
          <h3>Cuộc họp dự án</h3>
          <p>Quản lý các cuộc họp của dự án {project.name}</p>
        </div>
        {!isMember && (
          <Button
            onClick={() => {
              console.log("Create meeting button clicked");
              setShowCreateModal(true);
            }}
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
          onMouseEnter={(e) => {
            if (viewType !== "upcoming") {
              e.currentTarget.style.background = "#FF5E13";
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseLeave={(e) => {
            if (viewType !== "upcoming") {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#FF5E13";
            }
          }}
        >
          Sắp tới
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
          onMouseEnter={(e) => {
            if (viewType !== "ended") {
              e.currentTarget.style.background = "#FF5E13";
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseLeave={(e) => {
            if (viewType !== "ended") {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#FF5E13";
            }
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
              style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr" }} // Remove 1fr for type column
            >
              <div className="col-title">Tiêu đề</div>
              <div className="col-time">Thời gian</div>
              <div className="col-room">Phòng họp</div>
              <div className="col-status">Trạng thái</div>
              <div className="col-actions">Thao tác</div>
            </div>
            {meetings.map((meeting: Call, idx: number) => {
              const title = meeting.state?.custom?.title || "Cuộc họp";
              const description = meeting.state?.custom?.description?.substring(
                0,
                120
              );
              const startsAt = meeting.state?.startsAt
                ? new Date(meeting.state.startsAt)
                : null;
              const endsAt = meeting.state?.endedAt
                ? new Date(meeting.state.endedAt)
                : null;
              const statusInfo = getStatusInfo(meeting);

              return (
                <div
                  key={meeting.id || idx}
                  className="table-row"
                  style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr" }} // Remove 1fr for type column
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
                        (Đã kết thúc)
                      </span>
                    ) : (
                      <button
                        className="room-link cursor-pointer"
                        onClick={() => handleJoin(meeting)}
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
                  <div className="col-actions flex items-center gap-2">
                    <button
                      className=" cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                      title="Xem chi tiết"
                      onClick={() => handleView(meeting)}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {!(viewType === "ended") &&
                      !(statusInfo.label === "Kết thúc") &&
                      !isMember && (
                        <button
                          className="cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                          title="Cập nhật"
                          onClick={() => handleEdit(meeting)}
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                    {!isMember && (
                      <button
                        className="cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                        title="Xóa"
                        onClick={() => handleDelete(meeting)}
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

      {/* Modals */}
      {showCreateModal && (
        <CreateMeetingModal
          projectId={project.id}
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
