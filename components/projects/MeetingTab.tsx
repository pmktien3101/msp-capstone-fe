"use client";

import { useMemo, useState } from "react";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { CreateMeetingModal } from "./modals/CreateMeetingModal";
import "@/app/styles/meeting-tab.scss";
import { meetingService } from "@/services/meetingService";
import { MeetingItem } from "@/types/meeting";
import { UpdateMeetingModal } from "./modals/UpdateMeetingModal";
import { toast } from "react-toastify";
import { Eye, Pencil, Trash, Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";

interface MeetingTabProps {
  project: Project;
}

function useProjectMeetings(projectId: string) {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMeetings = async () => {
    setIsLoading(true);
    const res = await meetingService.getMeetingsByProjectId(projectId);
    setMeetings(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line
  }, [projectId]);

  return { meetings, isLoading, refetch: fetchMeetings };
}

export const MeetingTab = ({ project }: MeetingTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(
    null
  );

  const {
    meetings: backendMeetings,
    isLoading: isLoadingCall,
    refetch: refetchCalls,
  } = useProjectMeetings(project.id);

  // Sửa lại viewType cho đúng với status từ API
  const [viewType, setViewType] = useState<
    "all" | "Scheduled" | "Ongoing" | "Finished" | "Cancel"
  >("all");
  const { role } = useUser();
  const isMember = role === "Member";

  // Phân loại cuộc họp theo status
  const scheduledMeetings = backendMeetings.filter(
    (m) => m.status === "Scheduled"
  );
  const ongoingMeetings = backendMeetings.filter((m) => m.status === "Ongoing");
  const finishedMeetings = backendMeetings.filter(
    (m) => m.status === "Finished"
  );
  const cancelMeetings = backendMeetings.filter((m) => m.status === "Cancel");
  const allMeetings = backendMeetings;

  const meetings = useMemo(() => {
    switch (viewType) {
      case "Scheduled":
        return scheduledMeetings;
      case "Ongoing":
        return ongoingMeetings;
      case "Finished":
        return finishedMeetings;
      case "Cancel":
        return cancelMeetings;
      default:
        return allMeetings;
    }
  }, [
    viewType,
    allMeetings,
    scheduledMeetings,
    ongoingMeetings,
    finishedMeetings,
    cancelMeetings,
  ]);

  // Sửa lại getStatusInfo cho đúng nhãn
  const getStatusInfo = (meeting: MeetingItem) => {
    switch (meeting.status) {
      case "Finished":
        return { label: "Kết thúc", color: "#A41F39" };
      case "Scheduled":
        return { label: "Đã lên lịch", color: "#47D69D" };
      case "Ongoing":
        return { label: "Đang diễn ra", color: "#FFA500" };
      case "Cancel":
        return { label: "Tạm dừng", color: "#888" };
      default:
        return { label: meeting.status, color: "#ccc" };
    }
  };

  const handleJoin = (meeting: MeetingItem) => {
    window.open(`/meeting/${meeting.id}`, "_blank");
  };
  console.log("meetings", meetings);
  const handleView = (meeting: MeetingItem) => {
    window.location.href = `/meeting-detail/${meeting.id}`;
  };

  const handleEdit = (meeting: MeetingItem) => {
    setSelectedMeeting(meeting);
    setShowUpdateModal(true);
  };

  const handleDelete = async (meeting: MeetingItem) => {
    if (!confirm("Bạn chắc chắn muốn xóa cuộc họp này?")) return;
    try {
      const res = await meetingService.deleteMeeting(meeting.id);
      if (res.success) {
        await refetchCalls();
        toast.success("Đã xóa cuộc họp");
      } else {
        toast.error(res.error || "Xóa thất bại");
      }
    } catch (e: any) {
      console.error("Delete meeting failed", e);
      toast.error(e?.message || "Xóa thất bại");
    }
  };

  const allMeetingsCount = allMeetings.length;
  const scheduledMeetingsCount = scheduledMeetings.length;
  const ongoingMeetingsCount = ongoingMeetings.length;
  const finishedMeetingsCount = finishedMeetings.length;
  const cancelMeetingsCount = cancelMeetings.length;

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
          <div className="stat-number">{scheduledMeetingsCount}</div>
          <div className="stat-label">Đã lên lịch</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{ongoingMeetingsCount}</div>
          <div className="stat-label">Đang diễn ra</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{finishedMeetingsCount}</div>
          <div className="stat-label">Kết thúc</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{cancelMeetingsCount}</div>
          <div className="stat-label">Tạm dừng</div>
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
        >
          Tất cả
        </Button>
        <Button
          onClick={() => setViewType("Scheduled")}
          style={{
            background: viewType === "Scheduled" ? "#FF5E13" : "transparent",
            color: viewType === "Scheduled" ? "white" : "#FF5E13",
            border: "1px solid #FF5E13",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          Đã lên lịch
        </Button>
        <Button
          onClick={() => setViewType("Ongoing")}
          style={{
            background: viewType === "Ongoing" ? "#FF5E13" : "transparent",
            color: viewType === "Ongoing" ? "white" : "#FF5E13",
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
          onClick={() => setViewType("Finished")}
          style={{
            background: viewType === "Finished" ? "#FF5E13" : "transparent",
            color: viewType === "Finished" ? "white" : "#FF5E13",
            border: "1px solid #FF5E13",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          Kết thúc
        </Button>
        <Button
          onClick={() => setViewType("Cancel")}
          style={{
            background: viewType === "Cancel" ? "#FF5E13" : "transparent",
            color: viewType === "Cancel" ? "white" : "#FF5E13",
            border: "1px solid #FF5E13",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          Tạm dừng
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
            {meetings.map((meeting: MeetingItem, idx: number) => {
              const title = meeting.title;
              const description = meeting.description?.substring(0, 120);
              const startsAt = meeting.startTime
                ? new Date(meeting.startTime)
                : null;
              const endsAt = meeting.endTime ? new Date(meeting.endTime) : null;
              const statusInfo = getStatusInfo(meeting);

              return (
                <div
                  key={meeting.id || idx}
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
                  <div className="col-actions flex items-center gap-2 cursor-pointer">
                    <button
                      className="cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                      title="Xem chi tiết"
                      onClick={() => handleView(meeting)}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {!(viewType === "Finished") &&
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

      {showCreateModal && (
        <CreateMeetingModal
          projectId={project.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => refetchCalls()}
        />
      )}
      {showUpdateModal && selectedMeeting && (
        <UpdateMeetingModal
          meeting={selectedMeeting}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedMeeting(null);
          }}
          onUpdated={async () => await refetchCalls()}
        />
      )}
    </div>
  );
};
