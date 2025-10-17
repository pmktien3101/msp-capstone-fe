"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { CreateMeetingModal } from "./modals/CreateMeetingModal";
import "@/app/styles/meeting-tab.scss";
import { meetingService } from "@/services/meetingService";
import { MeetingItem } from "@/types/meeting";
import { UpdateMeetingModal } from "./modals/UpdateMeetingModal";
import { toast } from "react-toastify";
import { Eye, Pencil, Plus, X } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

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
  const [callInstance, setCallInstance] = useState<any>(null);
  const client = useStreamVideoClient();

  const {
    meetings: backendMeetings,
    isLoading: isLoadingCall,
    refetch: refetchCalls,
  } = useProjectMeetings(project.id);

  // Thay tabs bằng filter + search
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Scheduled" | "Ongoing" | "Finished" | "Cancelled"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  // --- new: custom dropdown state + ref ---
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // hover state for nicer hover effects
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  // --- end new ---

  const { role } = useUser();
  const isMember = role === "Member";

  // Phân loại cuộc họp theo status (duy trì cho thống kê)
  const scheduledMeetings = backendMeetings.filter(
    (m) => m.status === "Scheduled"
  );
  const ongoingMeetings = backendMeetings.filter((m) => m.status === "Ongoing");
  const finishedMeetings = backendMeetings.filter(
    (m) => m.status === "Finished"
  );
  const cancelMeetings = backendMeetings.filter(
    (m) => m.status === "Cancelled"
  );
  const allMeetings = backendMeetings;

  // Áp filter status và search vào danh sách hiển thị
  const meetings = useMemo(() => {
    let list = backendMeetings.slice();

    if (statusFilter !== "all") {
      list = list.filter((m) => m.status === statusFilter);
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const title = (m.title || "").toLowerCase();
        const desc = (m.description || "").toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }

    return list;
  }, [backendMeetings, statusFilter, searchTerm]);

  // Sửa lại getStatusInfo cho đúng nhãn
  const getStatusInfo = (meeting: MeetingItem) => {
    switch (meeting.status) {
      case "Finished":
        return { label: "Kết thúc", color: "#A41F39" };
      case "Scheduled":
        return { label: "Đã lên lịch", color: "#47D69D" };
      case "Ongoing":
        return { label: "Đang diễn ra", color: "#FFA500" };
      case "Cancelled":
        return { label: "Đã hủy", color: "#888" };
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
    if (client) {
      const call = client.call("default", meeting.id);
      setCallInstance(call);
    } else {
      setCallInstance(null);
    }
    setShowUpdateModal(true);
  };

  const handleCancel = async (meeting: MeetingItem) => {
    if (!confirm("Bạn chắc chắn muốn hủy cuộc họp này?")) return;

    try {
      const res = await meetingService.cancelMeeting(meeting.id);

      if (res?.success) {
        await refetchCalls();
        toast.success("Đã hủy cuộc họp thành công");
      } else {
        toast.error(res?.error || res?.message || "Hủy cuộc họp thất bại");
      }
    } catch (e: any) {
      console.error("Cancel meeting failed", e);
      toast.error(e?.message || "Hủy cuộc họp thất bại");
    }
  };

  const allMeetingsCount = allMeetings.length;
  const scheduledMeetingsCount = scheduledMeetings.length;
  const ongoingMeetingsCount = ongoingMeetings.length;
  const finishedMeetingsCount = finishedMeetings.length;
  const cancelMeetingsCount = cancelMeetings.length;

  // status options for custom dropdown
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Scheduled", label: "Đã lên lịch" },
    { value: "Ongoing", label: "Đang diễn ra" },
    { value: "Finished", label: "Kết thúc" },
    { value: "Cancelled", label: "Đã hủy" },
  ];

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
          <div className="stat-label">Đã hủy</div>
        </div>
      </div>

      {/* Filter + Search thay cho các tab */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #E5E7EB",
            width: 360,
          }}
        />

        {/* custom dropdown */}
        <div
          ref={dropdownRef}
          style={{ position: "relative", display: "inline-block" }}
        >
          <button
            onClick={() => setDropdownOpen((s) => !s)}
            aria-expanded={dropdownOpen}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 180,
              transition: "box-shadow 0.15s ease",
              boxShadow: dropdownOpen ? "0 4px 10px rgba(255,94,19,0.06)" : "",
            }}
            title="Lọc trạng thái"
          >
            <span style={{ flex: 1, textAlign: "left" }}>
              {statusOptions.find((o) => o.value === statusFilter)?.label ||
                "Tất cả trạng thái"}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${dropdownOpen ? "#FF5E13" : "#666"}`,
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.18s ease, border-top-color 0.18s ease",
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                zIndex: 40,
                minWidth: 200,
                overflow: "hidden",
              }}
            >
              {statusOptions.map((opt) => (
                <div
                  key={opt.value}
                  role="menuitem"
                  onClick={() => {
                    setStatusFilter(opt.value as any);
                    setDropdownOpen(false);
                  }}
                  onMouseEnter={() => setHoveredOption(opt.value)}
                  onMouseLeave={() => setHoveredOption(null)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    background:
                      statusFilter === opt.value
                        ? "rgba(255,94,19,0.06)"
                        : hoveredOption === opt.value
                        ? "rgba(255,94,19,0.08)"
                        : "transparent",
                    color:
                      statusFilter === opt.value || hoveredOption === opt.value
                        ? "#FF5E13"
                        : "#111827",
                    borderBottom: "1px solid #F3F4F6",
                    transition:
                      "background 0.12s ease, color 0.12s ease, transform 0.12s ease",
                    transform:
                      hoveredOption === opt.value
                        ? "translateX(4px)"
                        : "translateX(0)",
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={() => {
            setStatusFilter("all");
            setSearchTerm("");
            setDropdownOpen(false);
          }}
          style={{
            background: "transparent",
            color: "#FF5E13",
            border: "1px solid #FF5E13",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Reset
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
                    {meeting.status === "Finished" ||
                    meeting.status === "Cancelled" ? (
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
                    {meeting.status !== "Finished" &&
                      meeting.status !== "Cancelled" &&
                      !isMember && (
                        <button
                          className="cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                          title="Cập nhật"
                          onClick={() => handleEdit(meeting)}
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                    {!isMember &&
                      meeting.status !== "Cancelled" &&
                      meeting.status !== "Finished" && (
                        <button
                          className="cursor-pointer p-1.5 rounded-md hover:bg-muted transition border flex items-center justify-center"
                          title="Hủy cuộc họp"
                          onClick={() => handleCancel(meeting)}
                        >
                          <X className="w-5 h-5 text-red-500" />
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
            setCallInstance(null);
          }}
          onUpdated={async () => await refetchCalls()}
          call={callInstance} // truyền call xuống modal
        />
      )}
    </div>
  );
};
