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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Eye,
  Pencil,
  Plus,
  X,
  Trash,
  Video,
  Calendar,
  Clock,
  XCircle,
  Search,
  Filter,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { MeetingStatus, ProjectStatus } from '@/constants/status';
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
  const [statusFilter, setStatusFilter] = useState<"all" | MeetingStatus>(
    "all"
  );
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

  // Check if project is completed, on hold, or cancelled
  const isProjectDisabled =
    project.status === ProjectStatus.Completed ||
    project.status === ProjectStatus.OnHold ||
    project.status === ProjectStatus.Cancelled;

  // Categorize meetings by status (for statistics)
  const scheduledMeetings = backendMeetings.filter(
    (m) => m.status === MeetingStatus.Scheduled
  );
  const ongoingMeetings = backendMeetings.filter(
    (m) => m.status === MeetingStatus.Ongoing
  );
  const finishedMeetings = backendMeetings.filter(
    (m) => m.status === MeetingStatus.Finished
  );
  const cancelMeetings = backendMeetings.filter(
    (m) => m.status === MeetingStatus.Cancelled
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
      case MeetingStatus.Finished:
        return { label: MeetingStatus.Finished, color: "#A41F39" };
      case MeetingStatus.Scheduled:
        return { label: MeetingStatus.Scheduled, color: "#47D69D" };
      case MeetingStatus.Ongoing:
        return { label: MeetingStatus.Ongoing, color: "#FFA500" };
      case MeetingStatus.Cancelled:
        return { label: MeetingStatus.Cancelled, color: "#888" };
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
    setMeetingToCancel(meeting);
    setIsConfirmCancelOpen(true);
  };

  const handleDelete = async (meeting: MeetingItem) => {
    setMeetingToDelete(meeting);
    setIsConfirmDeleteOpen(true);
  };

  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [meetingToCancel, setMeetingToCancel] = useState<MeetingItem | null>(
    null
  );
  const [meetingToDelete, setMeetingToDelete] = useState<MeetingItem | null>(
    null
  );

  const confirmCancel = async () => {
    if (!meetingToCancel) return;
    const res = await meetingService.cancelMeeting(meetingToCancel.id);
    if (res.success) {
      toast.success(res.message || "Meeting cancelled successfully");
      await refetchCalls();
    } else {
      toast.error(res.error || "Failed to cancel meeting");
    }
    setIsConfirmCancelOpen(false);
    setMeetingToCancel(null);
  };

  const confirmDelete = async () => {
    if (!meetingToDelete) return;
    const res = await meetingService.deleteMeeting(meetingToDelete.id);
    if (res.success) {
      toast.success(res.message || "Meeting deleted successfully");
      await refetchCalls();
    } else {
      toast.error(res.error || "Failed to delete meeting");
    }
    setIsConfirmDeleteOpen(false);
    setMeetingToDelete(null);
  };

  const allMeetingsCount = allMeetings.length;
  const scheduledMeetingsCount = scheduledMeetings.length;
  const ongoingMeetingsCount = ongoingMeetings.length;
  const finishedMeetingsCount = finishedMeetings.length;
  const cancelMeetingsCount = cancelMeetings.length;

  // status options for custom dropdown
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: MeetingStatus.Scheduled, label: MeetingStatus.Scheduled },
    { value: MeetingStatus.Ongoing, label: MeetingStatus.Ongoing },
    { value: MeetingStatus.Finished, label: MeetingStatus.Finished },
    { value: MeetingStatus.Cancelled, label: MeetingStatus.Cancelled },
  ];

  return (
    <div className="meeting-tab">
      {isProjectDisabled && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            backgroundColor: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            color: "#92400E",
          }}
        >
          <Calendar size={18} />
          <span>
            This project is not active. Creating, editing, and cancelling meetings is disabled.
          </span>
        </div>
      )}
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
        {!isMember && !readOnly && !isProjectDisabled && (
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
                      {/* <div className="meeting-info"> */}
                        <div >
                          <div className="meeting-title-text">{title}</div>
                          {description && (
                            <div className="meeting-description">
                              {description}
                            </div>
                          )}
                        </div>
                      {/* </div> */}
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
                        !readOnly &&
                        !isProjectDisabled && (
                          <button
                            className="action-btn edit-btn"
                            title="Update"
                            onClick={() => handleEdit(meeting)}
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      {!isMember && !readOnly && !isProjectDisabled && (
                        <>
                          {meeting.status !== "Cancelled" &&
                            meeting.status !== "Finished" && (
                              <button
                                className="action-btn cancel-btn"
                                title="Cancel meeting"
                                onClick={() => handleCancel(meeting)}
                              >
                                <X size={16} />
                              </button>
                            )}

                          {(meeting.status === "Cancelled" ||
                            meeting.status === "Finished") && (
                            <button
                              className="action-btn delete-perm-btn"
                              title="Permanently delete meeting"
                              onClick={() => handleDelete(meeting)}
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </>
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
      {isConfirmCancelOpen && (
        <ConfirmDialog
          isOpen={isConfirmCancelOpen}
          onClose={() => {
            setIsConfirmCancelOpen(false);
            setMeetingToCancel(null);
          }}
          onConfirm={confirmCancel}
          title="Cancel meeting"
          description={`Are you sure you want to cancel meeting "${meetingToCancel?.title}"?`}
          confirmText="Cancel meeting"
          cancelText="Keep"
        />
      )}

      {isConfirmDeleteOpen && (
        <ConfirmDialog
          isOpen={isConfirmDeleteOpen}
          onClose={() => {
            setIsConfirmDeleteOpen(false);
            setMeetingToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Permanently delete meeting"
          description={`Are you sure you want to permanently delete meeting "${meetingToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Keep"
        />
      )}
    </div>
  );
};
