"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/lib/rbac";
import { useSubscription } from "@/hooks/useSubscription";
import { useMeetingLimitationCheck } from "@/hooks/useLimitationCheck";
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
  const [quickFilter, setQuickFilter] = useState<"all" | "upcoming" | "today" | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
              const meetingsResponse = await meetingService.getMeetingsByProjectId(project.id);
              if (meetingsResponse.success && meetingsResponse.data) {
                allMeetings.push(...meetingsResponse.data);
              }
            } catch (error) {
              console.error(`Error fetching meetings for project ${project.id}:`, error);
            }
          }
          setMeetings(allMeetings);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
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
        selectedStatuses.length === 0 || selectedStatuses.includes(meeting.status);

      // Date range filter
      const meetingDate = new Date(meeting.startTime);
      const matchesDateRange = 
        (!dateRangeStart || meetingDate >= new Date(dateRangeStart)) &&
        (!dateRangeEnd || meetingDate <= new Date(dateRangeEnd));

      return (
        matchesSearch &&
        matchesProject &&
        matchesStatus &&
        matchesDateRange
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

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project ? project.name : "Unknown";
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "Scheduled";
      case "finished":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
      case "upcoming":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300";
      case "completed":
      case "finished":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300";
      case "cancelled":
      case "canceled":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300";
      case "in-progress":
      case "ongoing":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300";
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
    setMeetings((prevMeetings: MeetingItem[]) => [meetingData, ...prevMeetings]);

    // Close modal
    setIsCreateModalOpen(false);
    toast.success("Meeting created successfully!");
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
        toast.success("Meeting deleted successfully!");
      } else {
        toast.error(result.error || "Failed to delete meeting");
      }
    } catch (error: any) {
      console.error("Error deleting meeting:", error);
      toast.error(error.message || "Failed to delete meeting");
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
          const meetingsResponse = await meetingService.getMeetingsByProjectId(project.id);
          if (meetingsResponse.success && meetingsResponse.data) {
            allMeetings.push(...meetingsResponse.data);
          }
        } catch (error) {
          console.error(`Error fetching meetings for project ${project.id}:`, error);
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-gray-500">Loading meetings...</p>
        </div>
      </div>
    );
  }

  // Redirect if not ProjectManager
  if (role !== UserRole.PROJECT_MANAGER) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500">
            Only Project Managers can view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="meetings-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Meetings List</h1>
          <p className="page-subtitle">
            Manage and track project meetings
          </p>
        </div>
        <button className="create-meeting-btn" onClick={handleOpenCreateModal}>
          <Plus size={16} />
          Create new meeting
        </button>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <span className="search-icon">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <details className="filters-dropdown">
          <summary className="filters-toggle-btn">
            <Filter size={16} />
            Filters
            {(selectedStatuses.length > 0 || 
              dateRangeStart || 
              dateRangeEnd || 
              selectedProject !== "all" || 
              quickFilter) && (
              <span className="filter-badge">
                {(selectedStatuses.length > 0 ? 1 : 0) +
                  (dateRangeStart || dateRangeEnd ? 1 : 0) +
                  (selectedProject !== "all" ? 1 : 0) +
                  (quickFilter && quickFilter !== "all" ? 1 : 0)}
              </span>
            )}
          </summary>

          <div className="filters-panel">
            {/* Quick Filters */}
            <div className="filter-section">
              <div className="filter-section-title">Quick Filters</div>
              <div className="quick-filters">
                <button
                  className={`quick-filter-btn ${quickFilter === null ? "active" : ""}`}
                  onClick={() => setQuickFilter(null)}
                >
                  All Meetings
                </button>
                <button
                  className={`quick-filter-btn ${quickFilter === "upcoming" ? "active" : ""}`}
                  onClick={() => setQuickFilter("upcoming")}
                >
                  <Calendar size={14} />
                  Upcoming
                </button>
                <button
                  className={`quick-filter-btn ${quickFilter === "today" ? "active" : ""}`}
                  onClick={() => setQuickFilter("today")}
                >
                  <Clock size={14} />
                  Today
                </button>
              </div>
            </div>

            {/* Project Filter */}
            <div className="filter-section">
              <div className="filter-section-title">Project</div>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="filter-select-full"
              >
                <option value="all">All projects</option>
                {projects?.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Multi-Select */}
            <div className="filter-section">
              <div className="filter-section-title">
                Status{" "}
                {selectedStatuses.length > 0 && (
                  <span className="count-badge">({selectedStatuses.length})</span>
                )}
              </div>
              <div className="filter-checkboxes">
                {["Scheduled", "Finished", "Cancelled"].map((status) => (
                  <label key={status} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => {
                        if (selectedStatuses.includes(status)) {
                          setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
                        } else {
                          setSelectedStatuses([...selectedStatuses, status]);
                        }
                      }}
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="filter-section">
              <div className="filter-section-title">
                <Calendar size={14} />
                Date Range
              </div>
              <div className="date-range-filter">
                <input
                  type="date"
                  className="date-input"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  placeholder="Start date"
                />
                <span>to</span>
                <input
                  type="date"
                  className="date-input"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedStatuses.length > 0 ||
              dateRangeStart ||
              dateRangeEnd ||
              selectedProject !== "all" ||
              quickFilter) && (
              <div className="filter-actions">
                <button
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedProject("all");
                    setSelectedStatuses([]);
                    setDateRangeStart("");
                    setDateRangeEnd("");
                    setQuickFilter(null);
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </details>
      </div>

      <div className="meetings-content">
        <div className="meetings-stats">
          <div className="stat-card">
            <div className="stat-number">{filteredMeetings.length}</div>
            <div className="stat-label">Total meetings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {filteredMeetings.filter((m: MeetingItem) => m.status === "Scheduled").length}
            </div>
            <div className="stat-label">Scheduled</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {filteredMeetings.filter((m: MeetingItem) => m.status === "Finished").length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="meetings-list">
          {filteredMeetings.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                <Calendar size={48} />
              </span>
              <h3 className="empty-title">No meetings</h3>
              <p className="empty-description">
                {searchTerm ||
                selectedProject !== "all" ||
                selectedStatuses.length > 0 ||
                dateRangeStart ||
                dateRangeEnd ||
                quickFilter
                  ? "No meetings found matching the filters."
                  : "No meetings have been created yet."}
              </p>
            </div>
          ) : (
            <div className="meetings-grid">
              {filteredMeetings.map((meeting: any) => (
                <div
                  key={meeting.id}
                  className="meeting-card"
                  onClick={() => handleCardClick(meeting.id)}
                >
                  <div className="meeting-header">
                    <h3 className="meeting-title">{meeting.title}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`status-badge ${getStatusColor(
                          meeting.status
                        )}`}
                      >
                        {getStatusLabel(meeting.status)}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => handleDropdownToggle(meeting.id, e)}
                          className="dropdown-trigger"
                          title="Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openDropdownId === meeting.id && (
                          <div className="dropdown-menu">
                            <button
                              onClick={(e) => handleEditMeeting(meeting, e)}
                              className="dropdown-item edit-item"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteMeeting(meeting, e)}
                              className="dropdown-item delete-item"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="meeting-description">{meeting.description}</p>

                  <div className="meeting-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>
                        {new Date(meeting.startTime).toLocaleDateString(
                          "en-US"
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
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
                    <div className="detail-item">
                      <Users size={16} />
                      <span>
                        {meeting.participants?.length ?? 0} participants
                      </span>
                    </div>
                  </div>

                  <div className="meeting-meta">
                    <div className="meta-item">
                      <span className="meta-label">Project:</span>
                      <span className="meta-value">
                        {getProjectName(meeting.projectId)}
                      </span>
                    </div>
                    {meeting.roomUrl && (
                      <div className="meta-item">
                        <span className="meta-label">Link:</span>
                        <button
                          onClick={(e) => handleJoinMeeting(e, meeting.title)}
                          className="meta-link"
                        >
                          Join meeting
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
