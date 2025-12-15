"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Flag, Target } from "lucide-react";
import { projectService } from "@/services/projectService";
import { milestoneService } from "@/services/milestoneService";
import { taskService } from "@/services/taskService";
import { MilestoneBackend } from "@/types/milestone";
import { Project } from "@/types/project";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import "@/app/styles/create-task-modal.scss";
import { formatDate } from "@/lib/formatDate";

interface CreateTaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MEMBER_CREATE_STATUS_OPTIONS = [
  { value: "Todo", label: "Todo" },
  { value: "InProgress", label: "In Progress" },
];

const ALL_STATUS_OPTIONS = [
  { value: "Todo", label: "Todo" },
  { value: "InProgress", label: "In Progress" },
  { value: "ReadyToReview", label: "Ready to Review" },
  { value: "Done", label: "Done" },
  { value: "Cancelled", label: "Cancelled" },
];

export const CreateTaskModal = ({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) => {
  const { user } = useAuth();
  const isMember = user?.role === "Member";

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "Todo",
    userId: "",
    reviewerId: "",
    startDate: "",
    endDate: "",
    milestoneIds: [] as string[],
  });

  const [members, setMembers] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<MilestoneBackend[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Validation errors (replace toast with inline errors)
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    startDate: "",
    endDate: "",
    milestone: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !isOpen) return;

      setIsLoadingData(true);
      try {
        // Fetch project details for date validation
        const projectResponse = await projectService.getProjectById(projectId);
        if (projectResponse.success && projectResponse.data) {
          setProject(projectResponse.data);
        }

        const membersResponse = await projectService.getProjectMembersByRole(
          projectId,
          "Member"
        );
        if (membersResponse.success && membersResponse.data) {
          const membersList = membersResponse.data
            .filter((pm: any) => pm.member)
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
            }));
          setMembers(membersList);
        }

        const reviewersResponse = await projectService.getProjectManagers(
          projectId
        );
        if (reviewersResponse.success && reviewersResponse.data) {
          const reviewersList = reviewersResponse.data
            .filter((pm: any) => pm.member)
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
            }));
          setReviewers(reviewersList);
        }

        const milestonesResponse =
          await milestoneService.getMilestonesByProjectId(projectId);
        if (milestonesResponse.success && milestonesResponse.data) {
          const items = Array.isArray(milestonesResponse.data)
            ? milestonesResponse.data
            : (milestonesResponse.data as any).items || [];
          setMilestones(items);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [projectId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTaskData({
        title: "",
        description: "",
        status: "Todo",
        userId: "",
        reviewerId: "",
        startDate: "",
        endDate: "",
        milestoneIds: [],
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  const handleSave = async () => {
    // Clear previous errors
    setValidationErrors({
      title: "",
      startDate: "",
      endDate: "",
      milestone: "",
    });

    if (!user?.userId) {
      toast.error("User not logged in");
      return;
    }
    
    if (!taskData.title.trim()) {
      setValidationErrors(prev => ({ ...prev, title: "Task title is required" }));
      return;
    }
    
    if (taskData.title.trim().length < 3) {
      setValidationErrors(prev => ({ ...prev, title: "Task title must be at least 3 characters" }));
      return;
    }
    
    if (taskData.title.trim().length > 50) {
      setValidationErrors(prev => ({ ...prev, title: "Task title must not exceed 50 characters" }));
      return;
    }
    
    if (!taskData.startDate) {
      setValidationErrors(prev => ({ ...prev, startDate: "Start date is required" }));
      return;
    }
    
    if (!taskData.endDate) {
      setValidationErrors(prev => ({ ...prev, endDate: "End date is required" }));
      return;
    }

    // Validate dates
    const start = new Date(taskData.startDate);
    const end = new Date(taskData.endDate);
    
    if (start > end) {
      setValidationErrors(prev => ({ ...prev, endDate: "End date must be after or equal to start date" }));
      return;
    }

    // Validate against project dates
    if (project?.startDate && start < new Date(project.startDate)) {
      setValidationErrors(prev => ({ ...prev, startDate: "Task start date cannot be before project start date" }));
      return;
    }

    if (project?.endDate && end > new Date(project.endDate)) {
      setValidationErrors(prev => ({ ...prev, endDate: "Task end date cannot be after project end date" }));
      return;
    }

    // Validate dates against selected milestones
    if (taskData.milestoneIds.length > 0) {
      const selectedMilestones = milestones.filter(m => 
        taskData.milestoneIds.includes(m.id)
      );
      
      for (const milestone of selectedMilestones) {
        if (milestone.dueDate) {
          const milestoneDue = new Date(milestone.dueDate);
          if (end > milestoneDue) {
            setValidationErrors(prev => ({ ...prev, endDate: `Task end date cannot be after milestone "${milestone.name}" due date` }));
            return;
          }
        }
      }
    }

    try {
      setIsSaving(true);

      const createData = {
        projectId,
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        status: taskData.status,
        actorId: user.userId,
        userId: taskData.userId || undefined,
        reviewerId: taskData.reviewerId || undefined,
        startDate: new Date(taskData.startDate).toISOString(),
        endDate: new Date(taskData.endDate).toISOString(),
        milestoneIds: taskData.milestoneIds,
      };

      const response = await taskService.createTask(createData);

      if (response.success) {
        toast.success("Task created successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error creating task");
    } finally {
      setIsSaving(false);
    }
  };

  // Validate dates when they change
  const handleStartDateChange = (newStartDate: string) => {
    // Clear error when changing
    setValidationErrors(prev => ({ ...prev, startDate: "" }));
    
    // Always allow clearing the date
    if (!newStartDate) {
      setTaskData({ ...taskData, startDate: newStartDate });
      return;
    }

    // Validate against project dates (always check)
    if (project?.startDate) {
      const projectStart = new Date(project.startDate);
      const selectedStart = new Date(newStartDate);
      
      if (selectedStart < projectStart) {
        setValidationErrors(prev => ({ ...prev, startDate: "Task start date cannot be before project start date" }));
        return;
      }
    }

    if (project?.endDate) {
      const projectEnd = new Date(project.endDate);
      const selectedStart = new Date(newStartDate);
      
      if (selectedStart > projectEnd) {
        setValidationErrors(prev => ({ ...prev, startDate: "Task start date cannot be after project end date" }));
        return;
      }
    }

    // Validate with end date if present
    if (taskData.endDate) {
      const start = new Date(newStartDate);
      const end = new Date(taskData.endDate);
      
      if (start > end) {
        setValidationErrors(prev => ({ ...prev, startDate: "Start date must be before or equal to end date" }));
        return;
      }

      // Validate against milestones if any selected
      if (taskData.milestoneIds.length > 0) {
        const selectedMilestones = milestones.filter(m => 
          taskData.milestoneIds.includes(m.id)
        );
        
        for (const milestone of selectedMilestones) {
          if (milestone.dueDate) {
            const milestoneDue = new Date(milestone.dueDate);
            if (end > milestoneDue) {
              setValidationErrors(prev => ({ ...prev, startDate: `Task dates conflict with milestone "${milestone.name}"` }));
              return;
            }
          }
        }
      }
    } else if (taskData.milestoneIds.length > 0) {
      // If only start date and milestones are selected, check if start is valid with milestone due dates
      const selectedMilestones = milestones.filter(m => 
        taskData.milestoneIds.includes(m.id)
      );
      
      for (const milestone of selectedMilestones) {
        if (milestone.dueDate) {
          const milestoneDue = new Date(milestone.dueDate);
          const selectedStart = new Date(newStartDate);
          
          if (selectedStart > milestoneDue) {
            setValidationErrors(prev => ({ ...prev, startDate: `Start date cannot be after milestone "${milestone.name}" due date` }));
            return;
          }
        }
      }
    }

    setTaskData({ ...taskData, startDate: newStartDate });
  };

  const handleEndDateChange = (newEndDate: string) => {
    // Clear error when changing
    setValidationErrors(prev => ({ ...prev, endDate: "" }));
    
    // Always allow clearing the date
    if (!newEndDate) {
      setTaskData({ ...taskData, endDate: newEndDate });
      return;
    }

    // Validate against project dates (always check)
    if (project?.startDate) {
      const projectStart = new Date(project.startDate);
      const selectedEnd = new Date(newEndDate);
      
      if (selectedEnd < projectStart) {
        setValidationErrors(prev => ({ ...prev, endDate: "Task end date cannot be before project start date" }));
        return;
      }
    }

    if (project?.endDate) {
      const projectEnd = new Date(project.endDate);
      const selectedEnd = new Date(newEndDate);
      
      if (selectedEnd > projectEnd) {
        setValidationErrors(prev => ({ ...prev, endDate: "Task end date cannot be after project end date" }));
        return;
      }
    }

    // Validate with start date if present
    if (taskData.startDate) {
      const start = new Date(taskData.startDate);
      const end = new Date(newEndDate);
      
      if (start > end) {
        setValidationErrors(prev => ({ ...prev, endDate: "End date must be after or equal to start date" }));
        return;
      }

      // Validate against milestones if any selected
      if (taskData.milestoneIds.length > 0) {
        const selectedMilestones = milestones.filter(m => 
          taskData.milestoneIds.includes(m.id)
        );
        
        for (const milestone of selectedMilestones) {
          if (milestone.dueDate) {
            const milestoneDue = new Date(milestone.dueDate);
            if (end > milestoneDue) {
              setValidationErrors(prev => ({ ...prev, endDate: `End date cannot be after milestone "${milestone.name}" due date` }));
              return;
            }
          }
        }
      }
    } else if (taskData.milestoneIds.length > 0) {
      // If only end date and milestones are selected, check if end is valid with milestone due dates
      const selectedMilestones = milestones.filter(m => 
        taskData.milestoneIds.includes(m.id)
      );
      
      for (const milestone of selectedMilestones) {
        if (milestone.dueDate) {
          const milestoneDue = new Date(milestone.dueDate);
          const selectedEnd = new Date(newEndDate);
          
          if (selectedEnd > milestoneDue) {
            setValidationErrors(prev => ({ ...prev, endDate: `End date cannot be after milestone "${milestone.name}" due date` }));
            return;
          }
        }
      }
    }

    setTaskData({ ...taskData, endDate: newEndDate });
  };

  const toggleMilestone = (milestoneId: string) => {
    // Clear milestone error
    setValidationErrors(prev => ({ ...prev, milestone: "" }));
    
    const isAdding = !taskData.milestoneIds.includes(milestoneId);
    const newMilestoneIds = isAdding
      ? [...taskData.milestoneIds, milestoneId]
      : taskData.milestoneIds.filter((id) => id !== milestoneId);

    // If adding a milestone, validate ONLY the new milestone being added
    if (isAdding) {
      const milestoneToAdd = milestones.find(m => m.id === milestoneId);
      
      if (milestoneToAdd && milestoneToAdd.dueDate) {
        const milestoneDue = new Date(milestoneToAdd.dueDate);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
        
        // Check if milestone due date is in the past
        if (milestoneDue < currentDate) {
          setValidationErrors(prev => ({ ...prev, milestone: `Cannot select milestone "${milestoneToAdd.name}" - due date has passed` }));
          return;
        }
        
        // Check if start date is after THIS milestone's due date
        if (taskData.startDate) {
          const taskStart = new Date(taskData.startDate);
          if (taskStart > milestoneDue) {
            setValidationErrors(prev => ({ ...prev, milestone: `Cannot select milestone "${milestoneToAdd.name}" - conflicts with task start date` }));
            return;
          }
        }
        
        // Check if end date is after THIS milestone's due date
        if (taskData.endDate) {
          const taskEnd = new Date(taskData.endDate);
          if (taskEnd > milestoneDue) {
            setValidationErrors(prev => ({ ...prev, milestone: `Cannot select milestone "${milestoneToAdd.name}" - conflicts with task end date` }));
            return;
          }
        }
      }
    }

    setTaskData((prev) => ({
      ...prev,
      milestoneIds: newMilestoneIds,
    }));
  };

  const statusOptions = isMember
    ? MEMBER_CREATE_STATUS_OPTIONS
    : ALL_STATUS_OPTIONS;

  if (!isOpen) return null;

  return (
    <div className="create-task-modal-overlay" onClick={handleClose}>
      <div
        className="create-task-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Create New Task</h2>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {isLoadingData ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : (
            <div className="modal-content-grid">
              <div className="left-column">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Task Title</span>
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${validationErrors.title ? "error" : ""}`}
                    value={taskData.title}
                    onChange={(e) => {
                      setTaskData({ ...taskData, title: e.target.value });
                      setValidationErrors(prev => ({ ...prev, title: "" }));
                    }}
                    placeholder="Enter task title..."
                    disabled={isSaving}
                  />
                  {validationErrors.title && (
                    <p className="error-text">{validationErrors.title}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={taskData.description}
                    onChange={(e) =>
                      setTaskData({ ...taskData, description: e.target.value })
                    }
                    placeholder="Enter task description..."
                    rows={5}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Target size={16} />
                    <span className="label-text">Milestones</span>
                  </label>
                  <div className="milestone-list">
                    {milestones.length === 0 ? (
                      <p className="no-data-text">No milestones available</p>
                    ) : (
                      milestones.map((milestone) => {
                        const milestoneDue = new Date(milestone.dueDate);
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0);
                        const isPastDue = milestoneDue < currentDate;
                        
                        return (
                          <label
                            key={milestone.id}
                            className="milestone-checkbox-label"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "12px",
                              opacity: isPastDue ? 0.5 : 1,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={taskData.milestoneIds.includes(
                                  milestone.id
                                )}
                                onChange={() => toggleMilestone(milestone.id)}
                                disabled={isSaving || isPastDue}
                              />
                              <span>{milestone.name}</span>
                            </div>
                            <span
                              style={{
                                fontSize: "11px",
                                color: isPastDue ? "#ef4444" : "#6b7280",
                                whiteSpace: "nowrap",
                                textAlign: "right",
                              }}
                            >
                              {formatDate(milestone.dueDate)}
                              {isPastDue && " (Past due)"}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  {validationErrors.milestone && (
                    <p className="error-text">{validationErrors.milestone}</p>
                  )}
                </div>
              </div>

              <div className="right-column">
                <div className="form-group">
                  <label className="form-label">
                    <Flag size={16} />
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="form-select"
                    value={taskData.status}
                    onChange={(e) =>
                      setTaskData({ ...taskData, status: e.target.value })
                    }
                    disabled={isSaving}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    <span className="label-text">Assignee</span>
                  </label>
                  <select
                    className="form-select"
                    value={taskData.userId}
                    onChange={(e) =>
                      setTaskData({ ...taskData, userId: e.target.value })
                    }
                    disabled={isSaving}
                  >
                    <option value="">Select assignee (optional)</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    <span className="label-text">Start Date</span>
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-input ${validationErrors.startDate ? "error" : ""}`}
                    value={taskData.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    min={
                      new Date().toISOString().split("T")[0]
                    }
                    max={
                      project?.endDate
                        ? new Date(project.endDate).toISOString().split("T")[0]
                        : undefined
                    }
                    disabled={isSaving}
                  />
                  {validationErrors.startDate && (
                    <p className="error-text">{validationErrors.startDate}</p>
                  )}
                  {project?.startDate && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      Project start: {formatDate(project.startDate)}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    <span className="label-text">End Date</span>
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-input ${validationErrors.endDate ? "error" : ""}`}
                    value={taskData.endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={taskData.startDate || undefined}
                    max={
                      project?.endDate
                        ? new Date(project.endDate).toISOString().split("T")[0]
                        : undefined
                    }
                    disabled={isSaving}
                  />
                  {validationErrors.endDate && (
                    <p className="error-text">{validationErrors.endDate}</p>
                  )}
                  {project?.endDate && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      Project end: {formatDate(project.endDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="footer-button cancel-button"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="footer-button save-button"
            onClick={handleSave}
            disabled={isSaving || isLoadingData}
          >
            {isSaving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};
