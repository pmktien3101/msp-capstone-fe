"use client";

import { useEffect, useMemo, useState } from "react";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { CreateMeetingModal } from "./modals/CreateMeetingModal";
import "@/app/styles/meeting-tab.scss";
import { useGetCall } from "@/hooks/useGetCallList";
import { Call } from "@stream-io/video-react-sdk";
import { Loader } from "lucide-react";
import { UpdateMeetingModal } from "./modals/UpdateMeetingModal";

interface MeetingTabProps {
  project: Project;
}

export const MeetingTab = ({ project }: MeetingTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const { upcomingCalls, endedCalls, isLoadingCall, callRecordings } =
    useGetCall();
  const [viewType, setViewType] = useState<"upcoming" | "ended" | "recordings">(
    "upcoming"
  );
  const [recordings, setRecordings] = useState<any[]>([]);

  // Fetch recordings when needed
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const callData = await Promise.all(
          callRecordings.map((meeting) => meeting.queryRecordings())
        );
        const recs = callData
          .filter((call) => call.recordings.length > 0)
          .flatMap((call) => call.recordings);
        setRecordings(recs);
      } catch (e) {
        console.error("Failed to fetch recordings", e);
      }
    };
    if (viewType === "recordings") fetchRecordings();
  }, [viewType, callRecordings]);

  const meetings = useMemo(() => {
    switch (viewType) {
      case "ended":
        return endedCalls;
      case "recordings":
        return recordings;
      case "upcoming":
      default:
        return upcomingCalls;
    }
  }, [viewType, upcomingCalls, endedCalls, recordings]);

  const getStatusInfo = (call: Call) => {
    const now = new Date();
    const startsAt = call.state?.startsAt
      ? new Date(call.state.startsAt)
      : null;
    const endedAt = call.state?.endedAt ? new Date(call.state.endedAt) : null;
    if (endedAt || (startsAt && startsAt < now && call.state?.endedAt)) {
      return { label: "Hoàn thành", color: "#10b981" };
    }
    if (startsAt && startsAt > now)
      return { label: "Đã lên lịch", color: "#3b82f6" };
    if (startsAt && startsAt <= now && !endedAt)
      return { label: "Đang diễn ra", color: "#f59e0b" };
    return { label: "Không xác định", color: "#6b7280" };
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
      await call.delete();
      // Local removal (optimistic): recordings state or relying on hook reload (hook doesn't refetch automatically)
      // We just filter from arrays (only affects current view) - simplest approach.
      if (viewType === "upcoming") {
        // no direct setter from hook; cannot mutate upstream; page refresh fallback
        window.location.reload();
      } else if (viewType === "ended") {
        window.location.reload();
      }
    } catch (e) {
      console.error("Delete call failed", e);
      alert("Xóa thất bại");
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
        <Button
          variant={viewType === "recordings" ? "default" : "outline"}
          onClick={() => setViewType("recordings")}
        >
          Ghi hình
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
            <p>Tạo cuộc họp đầu tiên cho dự án này</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Tạo cuộc họp
            </Button>
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
              const isRecording = viewType === "recordings";
              if (isRecording) {
                const title = meeting.filename?.substring(0, 50) || "Recording";
                const description =
                  meeting.filename?.substring(0, 80) ||
                  "Recorded meeting session";
                const date = new Date(
                  meeting.start_time || Date.now()
                ).toLocaleString("vi-VN");
                return (
                  <div
                    key={meeting.id || idx}
                    className="table-row"
                    style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr" }}
                  >
                    <div className="col-title">
                      <div className="meeting-title-text">{title}</div>
                      <div className="meeting-description">{description}</div>
                    </div>
                    <div className="col-time">
                      <div className="time-info">
                        <div className="start-time">{date}</div>
                      </div>
                    </div>
                    <div className="col-room">
                      <a
                        href={meeting.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="room-link"
                      >
                        Xem
                      </a>
                    </div>
                    <div className="col-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: "#10b981" }}
                      >
                        Ghi hình
                      </span>
                    </div>
                    <div className="col-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(meeting.url, "_blank")}
                      >
                        Play
                      </Button>
                    </div>
                  </div>
                );
              }
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
                    <button
                      className="room-link"
                      onClick={() => handleJoin(call)}
                    >
                      Tham gia
                    </button>
                  </div>
                  <div className="col-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div
                    className="col-actions"
                    style={{ display: "flex", gap: 8 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(call)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(call)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="delete-btn"
                      onClick={() => handleDelete(call)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateMeetingModal onClose={() => setShowCreateModal(false)} />
      )}
      {showUpdateModal && selectedCall && (
        <UpdateMeetingModal
          call={selectedCall}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedCall(null);
          }}
          onUpdated={() => {
            // For now just close; UI will reflect because call state updates locally
          }}
        />
      )}
    </div>
  );
};
