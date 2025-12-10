"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/lib/rbac";
import { useSubscription } from "@/hooks/useSubscription";
import { useMeetingLimitationCheck } from "@/hooks/useLimitationCheck";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";
import { toast } from "react-toastify";

import { CreateMeetingModal } from "@/components/projects/modals/CreateMeetingModal";
import { UpdateMeetingModal } from "@/components/projects/modals/UpdateMeetingModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { meetingService } from "@/services/meetingService";
import { projectService } from "@/services/projectService";
import { MeetingItem } from "@/types/meeting";
import "@/app/styles/meetings-page.scss";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Video,
  CalendarDays,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  X,
  ChevronDown,
  FolderKanban,
} from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  roomUrl?: string;
  projectId: string;
  milestoneId?: string;
  participates: string[];
}

const MeetingsPage = () => {
  const { role } = useUser();
  const router = useRouter();
  const { checkMeetingLimitation } = useMeetingLimitationCheck();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [quickFilter, setQuickFilter] = useState<
    "all" | "upcoming" | "today" | null
  >(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectsResponse = await projectService.getAllProjects();

        if (projectsResponse.success && projectsResponse.data) {
          const projectsList = projectsResponse.data.items || [];
          setProjects(projectsList);

          // Fetch meetings for all projects
          const allMeetings: MeetingItem[] = [];
          for (const project of projectsList) {
            try {
              const meetingsResponse =
                await meetingService.getMeetingsByProjectId(project.id);
              if (meetingsResponse.success && meetingsResponse.data) {
                allMeetings.push(...meetingsResponse.data);
              }
            } catch (error) {
              console.error(
                `Error fetching meetings for project ${project.id}:`,
                error
              );
            }
          }
          setMeetings(allMeetings);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter meetings based on search and filters
  const filteredMeetings = useMemo(() => {
    let filtered = meetings.filter((meeting: any) => {
      const matchesSearch =
        meeting?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting?.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject =
        selectedProject === "all" || meeting.projectId === selectedProject;

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(meeting.status);

      // Date range filter
      const meetingDate = new Date(meeting.startTime);
      const matchesDateRange =
        (!dateRangeStart || meetingDate >= new Date(dateRangeStart)) &&
        (!dateRangeEnd || meetingDate <= new Date(dateRangeEnd));

      return (
        matchesSearch && matchesProject && matchesStatus && matchesDateRange
      );
    });

    // Apply quick filters
    if (quickFilter === "upcoming") {
      const now = new Date();
      filtered = filtered.filter(
        (m: any) => new Date(m.startTime) > now && m.status === "Scheduled"
      );
    } else if (quickFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter((m: any) => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= today && meetingDate < tomorrow;
      });
    }

    return filtered;
  }, [
    meetings,
    searchTerm,
    selectedProject,
    selectedStatuses,
    dateRangeStart,
    dateRangeEnd,
    quickFilter,
  ]);

  // Pagination for filtered meetings
  const {
    paginatedData: paginatedMeetings,
    currentPage,
    totalPages,
    setCurrentPage,
  } = usePagination({
    data: filteredMeetings,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project ? project.name : "Unknown";
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "Scheduled";
      case "finished":
        return "Finished";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleCardClick = (meetingId: string) => {
    router.push(`/meeting-detail/${meetingId}`);
    // router.push(`/meeting-detail/3b2140ee-24c5-4d12-8eb8-6de2a3f4fdd0`);
  };

  const handleJoinMeeting = (e: React.MouseEvent, meetingTitle: string) => {
    e.stopPropagation(); // Prevent event bubbling to card
    alert(`Join meeting: ${meetingTitle}`);
  };

  const handleOpenCreateModal = () => {
    // Check meeting limitation before opening modal
    if (!checkMeetingLimitation()) {
      return; // Limit reached, prevent opening modal
    }

    // Open modal if limit not reached
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateMeeting = (meetingData: any) => {
    console.log("Meeting created:", meetingData);

    // Add new meeting to state
    setMeetings((prevMeetings: MeetingItem[]) => [
      meetingData,
      ...prevMeetings,
    ]);

    // Close modal
    setIsCreateModalOpen(false);
    toast.success("Tạo cuộc họp thành công!");
  };

  const handleEditMeeting = (meeting: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to card
    setSelectedMeeting(meeting);
    setIsUpdateModalOpen(true);
    setOpenDropdownId(null); // Close dropdown
  };

  const handleDeleteMeeting = (meeting: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to card
    setMeetingToDelete(meeting);
    setIsConfirmDeleteOpen(true);
    setOpenDropdownId(null); // Close dropdown
  };

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;

    try {
      // Call API to delete meeting
      const result = await meetingService.deleteMeeting(meetingToDelete.id);

      if (result.success) {
        // Remove from local state
        setMeetings((prevMeetings: MeetingItem[]) =>
          prevMeetings.filter((m: MeetingItem) => m.id !== meetingToDelete.id)
        );
        toast.success("Xóa cuộc họp thành công!");
      } else {
        toast.error(result.error || "Không thể xóa cuộc họp");
      }
    } catch (error: any) {
      console.error("Error deleting meeting:", error);
      toast.error(error.message || "Không thể xóa cuộc họp");
    } finally {
      setIsConfirmDeleteOpen(false);
      setMeetingToDelete(null);
    }
  };

  const handleUpdateMeeting = async () => {
    // Reload meetings after update
    try {
      const allMeetings: MeetingItem[] = [];
      for (const project of projects) {
        try {
          const meetingsResponse = await meetingService.getMeetingsByProjectId(
            project.id
          );
          if (meetingsResponse.success && meetingsResponse.data) {
            allMeetings.push(...meetingsResponse.data);
          }
        } catch (error) {
          console.error(
            `Error fetching meetings for project ${project.id}:`,
            error
          );
        }
      }
      setMeetings(allMeetings);
    } catch (error) {
      console.error("Error reloading meetings:", error);
    }

    // Close modal
    setIsUpdateModalOpen(false);
    setSelectedMeeting(null);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedMeeting(null);
  };

  const handleDropdownToggle = (meetingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === meetingId ? null : meetingId);
  };

  const handleCloseDropdown = () => {
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdownId]);

  // Reset state when component remounts (when back from detail page)
  useEffect(() => {
    setOpenDropdownId(null);
    setIsCreateModalOpen(false);
    setIsUpdateModalOpen(false);
    setIsConfirmDeleteOpen(false);
    setSelectedMeeting(null);
    setMeetingToDelete(null);
  }, []);

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedStatuses.length > 0) count++;
    if (dateRangeStart || dateRangeEnd) count++;
    if (selectedProject !== "all") count++;
    if (quickFilter) count++;
    return count;
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <CalendarDays size={12} />;
      case "finished":
        return <CheckCircle2 size={12} />;
      case "cancelled":
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="meetings-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <Loader2 className="spinner-icon" />
          </div>
          <p className="loading-text">Loading your meetings...</p>
        </div>
      </div>
    );
  }

  // Redirect if not ProjectManager
  if (role !== UserRole.PROJECT_MANAGER) {
    return (
      <div className="meetings-page">
        <div className="access-denied">
          <div className="denied-icon">
            <XCircle size={48} />
          </div>
          <h2 className="denied-title">Access Denied</h2>
          <p className="denied-text">
            Only Project Managers can view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="meetings-page">
      {/* Hero Header */}
      <div className="hero-header">
        <div className="hero-background">
          <div className="hero-gradient" />
          <div className="hero-pattern" />
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Meetings List</h1>
            <p className="hero-subtitle">
              Schedule, manage and track all your project meetings in one place
            </p>
          </div>
          <button className="create-btn" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            <span>New Meeting</span>
            <Sparkles size={14} className="sparkle-icon" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card total">
          <div className="stat-icon-wrapper">
            <Video size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{filteredMeetings.length}</span>
            <span className="stat-label">Total Meetings</span>
          </div>
        </div>
        <div className="stat-card scheduled">
          <div className="stat-icon-wrapper">
            <CalendarDays size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {
                filteredMeetings.filter(
                  (m: MeetingItem) => m.status === "Scheduled"
                ).length
              }
            </span>
            <span className="stat-label">Scheduled</span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {
                filteredMeetings.filter(
                  (m: MeetingItem) => m.status === "Finished"
                ).length
              }
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card cancelled">
          <div className="stat-icon-wrapper">
            <XCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {
                filteredMeetings.filter(
                  (m: MeetingItem) =>
                    m.status === "Cancelled" || m.status === "Cancel"
                ).length
              }
            </span>
            <span className="stat-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-container">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search meetings by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-actions">
          {/* Quick Filter Buttons */}
          <div className="quick-filters">
            <button
              className={`quick-btn ${quickFilter === null ? "active" : ""}`}
              onClick={() => setQuickFilter(null)}
            >
              All
            </button>
            <button
              className={`quick-btn ${
                quickFilter === "upcoming" ? "active" : ""
              }`}
              onClick={() => setQuickFilter("upcoming")}
            >
              <Calendar size={14} />
              Upcoming
            </button>
            <button
              className={`quick-btn ${quickFilter === "today" ? "active" : ""}`}
              onClick={() => setQuickFilter("today")}
            >
              <Clock size={14} />
              Today
            </button>
          </div>

          {/* Advanced Filter Dropdown */}
          <details className="filter-dropdown">
            <summary className="filter-toggle">
              <Filter size={16} />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="filter-count">{getActiveFiltersCount()}</span>
              )}
              <ChevronDown size={14} className="chevron" />
            </summary>

            <div className="filter-panel">
              {/* Project Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <FolderKanban size={14} />
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Projects</option>
                  {projects?.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <CheckCircle2 size={14} />
                  Status
                </label>
                <div className="checkbox-group">
                  {["Scheduled", "Finished", "Cancelled"].map((status) => (
                    <label key={status} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => {
                          if (selectedStatuses.includes(status)) {
                            setSelectedStatuses(
                              selectedStatuses.filter((s) => s !== status)
                            );
                          } else {
                            setSelectedStatuses([...selectedStatuses, status]);
                          }
                        }}
                      />
                      <span className="checkbox-text">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="filter-group">
                <label className="filter-label">
                  <Calendar size={14} />
                  Date Range
                </label>
                <div className="date-inputs">
                  <input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="date-input"
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>

              {/* Clear All */}
              {getActiveFiltersCount() > 0 && (
                <button
                  className="clear-all-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedProject("all");
                    setSelectedStatuses([]);
                    setDateRangeStart("");
                    setDateRangeEnd("");
                    setQuickFilter(null);
                  }}
                >
                  <X size={14} />
                  Clear All Filters
                </button>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="meetings-section">
        {filteredMeetings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <Video size={64} />
            </div>
            <h3 className="empty-title">No meetings found</h3>
            <p className="empty-text">
              {searchTerm ||
              selectedProject !== "all" ||
              selectedStatuses.length > 0 ||
              dateRangeStart ||
              dateRangeEnd ||
              quickFilter
                ? "Try adjusting your filters to find what you're looking for."
                : "Get started by scheduling your first meeting."}
            </p>
            {!searchTerm &&
              selectedProject === "all" &&
              selectedStatuses.length === 0 &&
              !dateRangeStart &&
              !dateRangeEnd &&
              !quickFilter && (
                <button className="empty-cta" onClick={handleOpenCreateModal}>
                  <Plus size={18} />
                  Create Meeting
                </button>
              )}
          </div>
        ) : (
          <>
            <div className="meetings-grid">
              {paginatedMeetings.map((meeting: any) => (
                <div
                  key={meeting.id}
                  className={`meeting-card status-${meeting.status.toLowerCase()}`}
                  onClick={() => handleCardClick(meeting.id)}
                >
                  {/* Card Header */}
                  <div className="card-header">
                    <div
                      className={`status-indicator ${meeting.status.toLowerCase()}`}
                    >
                      {getStatusIcon(meeting.status)}
                      <span>{getStatusLabel(meeting.status)}</span>
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={(e) => handleDropdownToggle(meeting.id, e)}
                        className="action-btn"
                        title="More options"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openDropdownId === meeting.id && (
                        <div className="action-menu">
                          <button
                            onClick={(e) => handleEditMeeting(meeting, e)}
                            className="menu-item"
                          >
                            <Edit size={14} />
                            Edit Meeting
                          </button>
                          <button
                            onClick={(e) => handleDeleteMeeting(meeting, e)}
                            className="menu-item danger"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <h3 className="card-title">{meeting.title}</h3>
                    <p className="card-description">
                      {meeting.description || "No description provided"}
                    </p>
                  </div>

                  {/* Card Info */}
                  <div className="card-info">
                    <div
                      className="info-row project-row"
                      title={getProjectName(meeting.projectId)}
                    >
                      <FolderKanban size={14} />
                      <span className="project-name">
                        {getProjectName(meeting.projectId)}
                      </span>
                    </div>
                    <div className="info-row">
                      <div className="info-item">
                        <Calendar size={14} />
                        <span>{formatDate(meeting.startTime)}</span>
                      </div>
                      <div className="info-item">
                        <Clock size={14} />
                        <span>
                          {new Date(meeting.startTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <div className="info-item">
                        <Users size={14} />
                        <span>
                          {meeting.attendees?.length ??
                            meeting.participants?.length ??
                            0}{" "}
                          attendees
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer">
                    <button
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(meeting.id);
                      }}
                    >
                      View Details
                      <ArrowRight size={14} />
                    </button>
                    {meeting.roomUrl && meeting.status === "Scheduled" && (
                      <button
                        className="join-btn"
                        onClick={(e) => handleJoinMeeting(e, meeting.title)}
                      >
                        <Video size={14} />
                        Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredMeetings.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              showInfo={true}
            />
          </>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateMeetingModal
          onClose={handleCloseCreateModal}
          onCreated={handleCreateMeeting}
          requireProjectSelection={true}
        />
      )}

      {isUpdateModalOpen && selectedMeeting && (
        <UpdateMeetingModal
          meeting={selectedMeeting}
          onClose={handleCloseUpdateModal}
          onUpdated={handleUpdateMeeting}
          requireProjectSelection={true}
        />
      )}

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setMeetingToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Meeting"
        description={`Are you sure you want to delete meeting "${meetingToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default MeetingsPage;
