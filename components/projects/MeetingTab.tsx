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
import {
  Eye,
  Pencil,
  Plus,
  X,
  Video,
  Calendar,
  Clock,
  XCircle,
  Search,
  Filter,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useMeetingLimitationCheck } from "@/hooks/useLimitationCheck";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

interface MeetingTabProps {
  project: Project;
  readOnly?: boolean;
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

export const MeetingTab = ({ project, readOnly = false }: MeetingTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(
    null
  );
  const [callInstance, setCallInstance] = useState<any>(null);
  const client = useStreamVideoClient();
  const { checkMeetingLimitation } = useMeetingLimitationCheck();

  const {
    meetings: backendMeetings,
    isLoading: isLoadingCall,
    refetch: refetchCalls,
  } = useProjectMeetings(project.id);

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Scheduled" | "Ongoing" | "Finished" | "Cancelled"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Custom dropdown state and ref
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  const { role } = useUser();
  const isMember = role === "Member";

  // Categorize meetings by status (for statistics)
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

  // Apply status filter and search to display list
  const filteredMeetings = useMemo(() => {
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const meetings = filteredMeetings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Get status label and color
  const getStatusInfo = (meeting: MeetingItem) => {
    switch (meeting.status) {
      case "Finished":
        return { label: "Finished", color: "#A41F39" };
      case "Scheduled":
        return { label: "Scheduled", color: "#47D69D" };
      case "Ongoing":
        return { label: "Ongoing", color: "#FFA500" };
      case "Cancelled":
        return { label: "Cancelled", color: "#888" };
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
    if (!confirm("Bạn có chắc chắn muốn hủy cuộc họp này?")) return;

    try {
      const res = await meetingService.cancelMeeting(meeting.id);

      if (res?.success) {
        await refetchCalls();
        toast.success("Hủy cuộc họp thành công");
      } else {
        toast.error(res?.error || res?.message || "Không thể hủy cuộc họp");
      }
    } catch (e: any) {
      console.error("Cancel meeting failed", e);
      toast.error(e?.message || "Không thể hủy cuộc họp");
    }
  };

  const allMeetingsCount = allMeetings.length;
  const scheduledMeetingsCount = scheduledMeetings.length;
  const ongoingMeetingsCount = ongoingMeetings.length;
  const finishedMeetingsCount = finishedMeetings.length;
  const cancelMeetingsCount = cancelMeetings.length;

  // status options for custom dropdown
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "Ongoing", label: "Ongoing" },
    { value: "Finished", label: "Finished" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <div className="meeting-tab">
      <div className="meeting-header">
        <div className="meeting-title">
          <div className="title-icon">
            <Video size={28} />
          </div>
          <div className="title-text">
            <h3>Project Meetings</h3>
            <p>
              Manage and schedule meetings for{" "}
              <span className="project-name">{project.name}</span>
            </p>
          </div>
        </div>
        {!isMember && !readOnly && (
          <Button
            onClick={() => {
              if (checkMeetingLimitation()) {
                setShowCreateModal(true);
              }
            }}
            className="create-meeting-btn"
          >
            <Plus size={18} />
            New Meeting
          </Button>
        )}
      </div>

      <div className="meeting-stats">
        <div className="stat-card">
          <div className="stat-number">{allMeetingsCount}</div>
          <div className="stat-label">Total Meetings</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{scheduledMeetingsCount}</div>
          <div className="stat-label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{ongoingMeetingsCount}</div>
          <div className="stat-label">Ongoing</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{finishedMeetingsCount}</div>
          <div className="stat-label">Finished</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{cancelMeetingsCount}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="filter-section">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search meetings by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* custom dropdown */}
        <div ref={dropdownRef} className="filter-dropdown">
          <button
            onClick={() => setDropdownOpen((s) => !s)}
            aria-expanded={dropdownOpen}
            className={`dropdown-trigger ${dropdownOpen ? "active" : ""}`}
          >
            <Filter size={16} />
            <span>
              {statusOptions.find((o) => o.value === statusFilter)?.label ||
                "All Statuses"}
            </span>
            <span className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu" role="menu">
              {statusOptions.map((opt) => (
                <div
                  key={opt.value}
                  role="menuitem"
                  onClick={() => {
                    setStatusFilter(opt.value as any);
                    setDropdownOpen(false);
                  }}
                  className={`dropdown-item ${
                    statusFilter === opt.value ? "selected" : ""
                  }`}
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
          className="reset-btn"
        >
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>

      <div className="meeting-list">
        {isLoadingCall ? (
          <div className="meeting-tab-loading">
            <div className="loading-spinner" />
            <p>Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h4>No meetings found</h4>
            <p>Create your first meeting to get started</p>
          </div>
        ) : (
          <div className="meeting-table">
            <div className="table-header">
              <div className="col-stt">#</div>
              <div className="col-title">Meeting Details</div>
              <div className="col-time">Schedule</div>
              <div className="col-room">Room</div>
              <div className="col-status">Status</div>
              <div className="col-actions">Actions</div>
            </div>
            <div className="table-body">
              {meetings.map((meeting: MeetingItem, idx: number) => {
                const title = meeting.title;
                const description = meeting.description?.substring(0, 80);
                const startsAt = meeting.startTime
                  ? new Date(meeting.startTime)
                  : null;
                const endsAt = meeting.endTime
                  ? new Date(meeting.endTime)
                  : null;
                const statusInfo = getStatusInfo(meeting);

                return (
                  <div key={meeting.id || idx} className="table-row">
                    <div className="col-stt">
                      <div className="stt-number">{startIndex + idx + 1}</div>
                    </div>
                    <div className="col-title">
                      <div className="meeting-info">
                        <div className="meeting-details">
                          <div className="meeting-title-text">{title}</div>
                          {description && (
                            <div className="meeting-description">
                              {description}...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-time">
                      <div className="time-info">
                        {startsAt && (
                          <div className="start-time">
                            <Calendar size={12} />
                            <span>{startsAt.toLocaleDateString("vi-VN")}</span>
                          </div>
                        )}
                        {startsAt && (
                          <div className="end-time">
                            <Clock size={12} />
                            <span>
                              {startsAt.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {endsAt && (
                              <span>
                                {" "}
                                -{" "}
                                {endsAt.toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-room">
                      {meeting.status === "Finished" ||
                      meeting.status === "Cancelled" ? (
                        <span className="room-closed">
                          <XCircle size={14} />
                          Closed
                        </span>
                      ) : (
                        <button
                          className="join-btn"
                          onClick={() => handleJoin(meeting)}
                        >
                          Join Now
                        </button>
                      )}
                    </div>
                    <div className="col-status">
                      <span
                        className={`status-badge status-${meeting.status?.toLowerCase()}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="col-actions">
                      <button
                        className="action-btn view-btn"
                        title="View details"
                        onClick={() => handleView(meeting)}
                      >
                        <Eye size={16} />
                      </button>
                      {meeting.status !== "Finished" &&
                        meeting.status !== "Cancelled" &&
                        !isMember &&
                        !readOnly && (
                          <button
                            className="action-btn edit-btn"
                            title="Update"
                            onClick={() => handleEdit(meeting)}
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      {!isMember &&
                        !readOnly &&
                        meeting.status !== "Cancelled" &&
                        meeting.status !== "Finished" && (
                          <button
                            className="action-btn delete-btn"
                            title="Cancel meeting"
                            onClick={() => handleCancel(meeting)}
                          >
                            <X size={16} />
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoadingCall && filteredMeetings.length > 0 && (
        <div className="table-footer">
          <div className="footer-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredMeetings.length)} of{" "}
            {filteredMeetings.length} meetings
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first, last, current and neighbors
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    const showEllipsis =
                      page === currentPage - 2 || page === currentPage + 2;

                    if (showPage) {
                      return (
                        <button
                          key={page}
                          className={`page-number ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      showEllipsis &&
                      page !== 1 &&
                      page !== totalPages
                    ) {
                      return (
                        <span key={page} className="ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>
              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

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
