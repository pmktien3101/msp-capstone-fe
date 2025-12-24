"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { MilestoneBackend } from "@/types/milestone";
import { GetTaskResponse } from "@/types/task";
import { TaskStatus, ProjectStatus } from "@/constants/status";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import { milestoneService } from "@/services/milestoneService";
import { taskService } from "@/services/taskService";
import { toast } from "react-toastify";
import Pagination from "@/components/ui/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  Target,
  Edit3,
  Save,
  X,
  Trash2,
  AlertCircle,
  TrendingUp,
  Plus,
} from "lucide-react";
import "@/app/styles/milestone-list-view.scss";

interface MilestoneListViewProps {
  project: Project;
  refreshKey?: number;
  onCreateMilestone?: () => void;
  readOnly?: boolean;
}

export const MilestoneListView = ({
  project,
  refreshKey,
  onCreateMilestone,
  readOnly = false,
}: MilestoneListViewProps) => {
  const { hasRole } = useAuth();
  const [milestones, setMilestones] = useState<MilestoneBackend[]>([]);
  const [milestoneTasks, setMilestoneTasks] = useState<Map<string, GetTaskResponse[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null
  );
  const [editedMilestone, setEditedMilestone] = useState<
    Partial<MilestoneBackend>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    dueDate: "",
  });

  // Confirm delete state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Check if user is Member (read-only mode)
  const isMemberRole = hasRole(UserRole.MEMBER);
  
  // Check if project is completed, on hold, or cancelled
  const isProjectDisabled =
    project.status === ProjectStatus.Completed ||
    project.status === ProjectStatus.OnHold ||
    project.status === ProjectStatus.Cancelled;

  const canEdit =
    !readOnly && !isProjectDisabled && (hasRole(UserRole.PROJECT_MANAGER) || hasRole(UserRole.ADMIN));

  // Pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedData: paginatedMilestones,
    setCurrentPage,
  } = usePagination({
    data: milestones,
    itemsPerPage: 10,
  });

  // Fetch milestones and tasks
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch milestones
      const milestonesResponse =
        await milestoneService.getMilestonesByProjectId(project.id);
      if (milestonesResponse.success && milestonesResponse.data) {
        const items = Array.isArray(milestonesResponse.data)
          ? milestonesResponse.data
          : (milestonesResponse.data as any).items || [];
        setMilestones(items);

        // Fetch tasks for each milestone in parallel
        const tasksByMilestone = new Map<string, GetTaskResponse[]>();
        await Promise.all(
          items.map(async (milestone: MilestoneBackend) => {
            const tasksRes = await taskService.getTasksByMilestoneId(milestone.id);
            const tasks = tasksRes.success && tasksRes.data ? tasksRes.data : [];
            tasksByMilestone.set(milestone.id, tasks);
          })
        );
        setMilestoneTasks(tasksByMilestone);
      } else {
        setMilestones([]);
        setMilestoneTasks(new Map());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading data");
      setMilestones([]);
      setMilestoneTasks(new Map());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (project.id) {
      fetchData();
    }
  }, [project.id, refreshKey]);

  // Calculate milestone progress based on task status weights
  const getMilestoneProgress = (milestoneId: string) => {
    const tasks = milestoneTasks.get(milestoneId) || [];

    if (tasks.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    // Status weights for progress calculation
    const statusWeights: Record<string, number> = {
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0.5,
      [TaskStatus.ReadyToReview]: 0.75,
      [TaskStatus.Done]: 1.0,
      [TaskStatus.ReOpened]: 0.3,
      [TaskStatus.Cancelled]: 0, // Not counted towards progress
    };

    // Group tasks into 5 separate categories for progress bar
    // Use both enum and string comparison for safety
    const doneCount = tasks.filter(t => 
      t.status === TaskStatus.Done || t.status === 'Done'
    ).length;
    
    // Ready to Review - separated category
    const readyToReviewCount = tasks.filter(t => 
      t.status === TaskStatus.ReadyToReview || t.status === 'ReadyToReview'
    ).length;
    
    // In Progress - now ONLY InProgress status
    const inProgressCount = tasks.filter(t => 
      t.status === TaskStatus.InProgress || t.status === 'InProgress'
    ).length;
    
    // Re-Opened - separated category
    const reopenedCount = tasks.filter(t => 
      t.status === TaskStatus.ReOpened || t.status === 'ReOpened'
    ).length;
    
    const todoCount = tasks.filter(t => 
      t.status === TaskStatus.Todo || t.status === 'Todo'
    ).length;

    // Total tasks excluding Cancelled (all 5 categories)
    const totalTasks = doneCount + readyToReviewCount + inProgressCount + reopenedCount + todoCount;

    // Calculate weighted progress (only for non-cancelled tasks)
    let totalWeight = 0;
    totalWeight += doneCount * (statusWeights.Done || 0);
    totalWeight += inProgressCount * (statusWeights[TaskStatus.InProgress] || 0);
    totalWeight += readyToReviewCount * (statusWeights[TaskStatus.ReadyToReview] || 0);
    totalWeight += reopenedCount * (statusWeights[TaskStatus.ReOpened] || 0);
    totalWeight += todoCount * (statusWeights[TaskStatus.Todo] || 0);

    const percentage = totalTasks > 0 
      ? Math.round((totalWeight / totalTasks) * 100) 
      : 0;

    const completed = doneCount;

    return {
      total: totalTasks,
      completed,
      percentage,
      doneCount,
      readyToReviewCount,
      inProgressCount,
      reopenedCount,
      todoCount,
    };
  };

  // Format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateStr?: string) => {
    if (!dateStr) return "No date";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Invalid";
    }
  };

  // Format date for input field (yyyy-MM-dd)
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // Start editing milestone
  const handleEditMilestone = (milestone: MilestoneBackend) => {
    if (!canEdit) return;
    setEditingMilestoneId(milestone.id);
    setEditedMilestone({
      ...milestone,
      dueDate: formatDateForInput(milestone.dueDate),
    });
    setValidationErrors({ name: "", dueDate: "" });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMilestoneId(null);
    setEditedMilestone({});
    setValidationErrors({ name: "", dueDate: "" });
  };

  // Handle field changes with validation
  const handleNameChange = (value: string) => {
    setEditedMilestone({ ...editedMilestone, name: value });
    
    // Clear name error on change
    setValidationErrors(prev => ({ ...prev, name: "" }));

    // Validate name length
    if (value.trim().length > 0 && value.trim().length < 3) {
      setValidationErrors(prev => ({ ...prev, name: "Milestone name must be at least 3 characters" }));
    } else if (value.trim().length > 200) {
      setValidationErrors(prev => ({ ...prev, name: "Milestone name must not exceed 200 characters" }));
    }
  };

  const handleDueDateChange = (value: string) => {
    setEditedMilestone({ ...editedMilestone, dueDate: value });
    
    // Clear due date error on change
    setValidationErrors(prev => ({ ...prev, dueDate: "" }));

    // Validate due date if name is also present
    if (value && editedMilestone.name) {
      const validation = validateMilestone(editedMilestone.name, value);
      if (!validation.valid) {
        // Determine which field has the error
        if (validation.message?.toLowerCase().includes("due date")) {
          setValidationErrors(prev => ({ ...prev, dueDate: validation.message || "" }));
        }
      }
    }
  };

  // Validate milestone
  const validateMilestone = (
    name: string,
    dueDate: string
  ): { valid: boolean; message?: string } => {
    // Validation 1: Name is required
    if (!name || name.trim() === "") {
      return { valid: false, message: "Milestone name is required" };
    }

    // Validation 2: Name length
    if (name.trim().length < 3) {
      return {
        valid: false,
        message: "Milestone name must be at least 3 characters",
      };
    }

    if (name.trim().length > 200) {
      return {
        valid: false,
        message: "Milestone name must not exceed 200 characters",
      };
    }

    // Validation 3: Due date is required
    if (!dueDate) {
      return { valid: false, message: "Due date is required" };
    }

    // Validation 4: Due date must be within project date range
    if (project.startDate) {
      const projectStart = new Date(project.startDate);
      const milestoneDue = new Date(dueDate);
      projectStart.setHours(0, 0, 0, 0);
      milestoneDue.setHours(0, 0, 0, 0);

      if (milestoneDue < projectStart) {
        return {
          valid: false,
          message: `Due date must be on or after project start date (${formatDateForDisplay(project.startDate)})`,
        };
      }
    }

    if (project.endDate) {
      const projectEnd = new Date(project.endDate);
      const milestoneDue = new Date(dueDate);
      projectEnd.setHours(0, 0, 0, 0);
      milestoneDue.setHours(0, 0, 0, 0);

      if (milestoneDue > projectEnd) {
        return {
          valid: false,
          message: `Due date must be on or before project end date (${formatDateForDisplay(project.endDate)})`,
        };
      }
    }

    return { valid: true };
  };

  // Save milestone changes
  const handleSaveMilestone = async () => {
    // Clear previous errors
    setValidationErrors({ name: "", dueDate: "" });

    // Check required fields
    if (!editingMilestoneId) {
      return;
    }

    if (!editedMilestone.name || !editedMilestone.name.trim()) {
      setValidationErrors(prev => ({ ...prev, name: "Milestone name is required" }));
      return;
    }

    if (!editedMilestone.dueDate) {
      setValidationErrors(prev => ({ ...prev, dueDate: "Due date is required" }));
      return;
    }

    // Validate milestone data
    const validation = validateMilestone(
      editedMilestone.name,
      editedMilestone.dueDate
    );
    if (!validation.valid) {
      // Set error to appropriate field
      if (validation.message?.toLowerCase().includes("name")) {
        setValidationErrors(prev => ({ ...prev, name: validation.message || "" }));
      } else if (validation.message?.toLowerCase().includes("due date")) {
        setValidationErrors(prev => ({ ...prev, dueDate: validation.message || "" }));
      } else {
        // Generic error, show in due date field as it's last
        setValidationErrors(prev => ({ ...prev, dueDate: validation.message || "Invalid milestone data" }));
      }
      return;
    }

    try {
      setIsSaving(true);

      const updateData = {
        id: editingMilestoneId,
        projectId: project.id,
        name: editedMilestone.name.trim(),
        description: editedMilestone.description?.trim() || "",
        dueDate: new Date(editedMilestone.dueDate).toISOString(),
      };

      const response = await milestoneService.updateMilestone(updateData);

      if (response.success) {
        toast.success("Milestone updated successfully");
        await fetchData();
        handleCancelEdit();
      } else {
        toast.error(response.error || "Unable to update milestone");
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Error updating milestone");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete milestone
  const handleDeleteMilestone = (milestone: MilestoneBackend) => {
    if (!canEdit) return;

    setMilestoneToDelete({ id: milestone.id, name: milestone.name });
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteMilestone = async () => {
    if (!milestoneToDelete) return;

    try {
      const response = await milestoneService.deleteMilestone(
        milestoneToDelete.id
      );

      if (response.success) {
        toast.success("Milestone deleted successfully");
        await fetchData();
      } else {
        toast.error(response.error || "Unable to delete milestone");
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error("Error deleting milestone");
    } finally {
      setIsConfirmDeleteOpen(false);
      setMilestoneToDelete(null);
    }
  };

  // Check if milestone is overdue
  const isMilestoneOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="milestone-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading milestone list...</p>
      </div>
    );
  }

  return (
    <div className="milestone-list-view">
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
          <Target size={18} />
          <span>
            This project is not active. Creating, editing, and deleting milestones is disabled.
          </span>
        </div>
      )}
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          padding: "0 4px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#1f2937",
              margin: "0 0 8px 0",
            }}
          >
            Project Milestones
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
            }}
          >
            Track and manage project milestones and deliverables
          </p>
        </div>
        {canEdit && onCreateMilestone && (
          <Button
            onClick={onCreateMilestone}
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
            Create Milestone
          </Button>
        )}
      </div>

      {/* Task Status Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "12px 16px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #e5e7eb",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151",
          }}
        >
          Task Status:
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#10b981",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Done</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#8b5cf6",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              Ready to Review
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#3b82f6",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              In Progress
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#fbbf24",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              Re-Opened
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#6b7280",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>To Do</span>
          </div>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="empty-state">
          <Target size={48} />
          <h3>No milestones yet</h3>
          <p>Create your first milestone to track project progress</p>
        </div>
      ) : (
        <>
          <div className="milestones-grid">
            {paginatedMilestones.map((milestone) => {
              const isEditing = editingMilestoneId === milestone.id;
              const isOverdue = isMilestoneOverdue(milestone.dueDate);
              const progress = getMilestoneProgress(milestone.id);

              return (
                <div
                  key={milestone.id}
                  className={`milestone-card ${isOverdue ? "overdue" : ""}`}
                >
                  {/* Edit actions */}
                  {canEdit && !isEditing && (
                    <div className="card-actions">
                      <button
                        onClick={() => handleEditMilestone(milestone)}
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMilestone(milestone)}
                        className="action-btn delete-btn"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="card-actions editing">
                      <button
                        onClick={handleSaveMilestone}
                        className="action-btn save-btn"
                        disabled={isSaving}
                        title="Save"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="action-btn cancel-btn"
                        disabled={isSaving}
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Milestone content */}
                  {isEditing ? (
                    <>
                      <div className="milestone-header">
                        <Target className="milestone-icon" size={24} />
                      </div>

                      <div className="edit-form-group">
                        <label className="form-label">
                          Milestone Name <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={editedMilestone.name || ""}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className={`milestone-name-input ${validationErrors.name ? "error" : ""}`}
                          placeholder="Enter milestone name..."
                          maxLength={200}
                        />
                        {validationErrors.name && (
                          <span className="error-text">
                            {validationErrors.name}
                          </span>
                        )}
                        {!validationErrors.name && editedMilestone.name && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            {editedMilestone.name.length}/200 characters
                          </span>
                        )}
                      </div>

                      <div className="edit-form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          value={editedMilestone.description || ""}
                          onChange={(e) =>
                            setEditedMilestone({
                              ...editedMilestone,
                              description: e.target.value,
                            })
                          }
                          className="milestone-description-input"
                          placeholder="Enter description (optional)..."
                          rows={3}
                          maxLength={1000}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="milestone-header">
                        <Target className="milestone-icon" size={24} />
                        <h3 className="milestone-name">{milestone.name}</h3>
                      </div>

                      {milestone.description && (
                        <p className="milestone-description">
                          Description: {milestone.description}
                        </p>
                      )}
                    </>
                  )}

                  {/* Progress Bar */}
                  {!isEditing && (
                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-label">
                          {progress.total > 0 ? `${progress.total} tasks` : 'No tasks assigned'}
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        {/* Multi-segment progress bar */}
                        {progress.total > 0 ? (
                          <>
                            {/* Done segment (green) */}
                            {(progress.doneCount ?? 0) > 0 && (() => {
                              const doneCount = progress.doneCount ?? 0;
                              const percentage = Math.round((doneCount / progress.total) * 100);
                              return (
                                <div
                                  className="progress-segment done"
                                  style={{ 
                                    width: `${percentage}%` 
                                  }}
                                  title={`Done: ${doneCount} task${doneCount > 1 ? 's' : ''}`}
                                >
                                  {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                                </div>
                              );
                            })()}
                            {/* Ready to Review segment (purple) */}
                            {(progress.readyToReviewCount ?? 0) > 0 && (() => {
                              const readyCount = progress.readyToReviewCount ?? 0;
                              const percentage = Math.round((readyCount / progress.total) * 100);
                              return (
                                <div
                                  className="progress-segment ready-to-review"
                                  style={{ 
                                    width: `${percentage}%` 
                                  }}
                                  title={`Ready to Review: ${readyCount} task${readyCount > 1 ? 's' : ''}`}
                                >
                                  {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                                </div>
                              );
                            })()}
                            {/* In Progress segment (blue) */}
                            {(progress.inProgressCount ?? 0) > 0 && (() => {
                              const inProgressCount = progress.inProgressCount ?? 0;
                              const percentage = Math.round((inProgressCount / progress.total) * 100);
                              return (
                                <div
                                  className="progress-segment in-progress"
                                  style={{ 
                                    width: `${percentage}%` 
                                  }}
                                  title={`In Progress: ${inProgressCount} task${inProgressCount > 1 ? 's' : ''}`}
                                >
                                  {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                                </div>
                              );
                            })()}
                            {/* Re-Opened segment (yellow) */}
                            {(progress.reopenedCount ?? 0) > 0 && (() => {
                              const reopenedCount = progress.reopenedCount ?? 0;
                              const percentage = Math.round((reopenedCount / progress.total) * 100);
                              return (
                                <div
                                  className="progress-segment reopened"
                                  style={{ 
                                    width: `${percentage}%` 
                                  }}
                                  title={`Re-Opened: ${reopenedCount} task${reopenedCount > 1 ? 's' : ''}`}
                                >
                                  {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                                </div>
                              );
                            })()}
                            {/* Todo segment (gray) */}
                            {(progress.todoCount ?? 0) > 0 && (() => {
                              const todoCount = progress.todoCount ?? 0;
                              const percentage = Math.round((todoCount / progress.total) * 100);
                              return (
                                <div
                                  className="progress-segment todo"
                                  style={{ 
                                    width: `${percentage}%` 
                                  }}
                                  title={`To Do: ${todoCount} task${todoCount > 1 ? 's' : ''}`}
                                >
                                  {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="progress-segment empty" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>No tasks assigned to this milestone</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="edit-form-group">
                      <label className="form-label">
                        Due Date <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={editedMilestone.dueDate || ""}
                        onChange={(e) => handleDueDateChange(e.target.value)}
                        className={`date-input ${validationErrors.dueDate ? "error" : ""}`}
                        min={
                          project.startDate
                            ? formatDateForInput(project.startDate)
                            : undefined
                        }
                        max={
                          project.endDate
                            ? formatDateForInput(project.endDate)
                            : undefined
                        }
                      />
                      {validationErrors.dueDate && (
                        <span className="error-text">
                          {validationErrors.dueDate}
                        </span>
                      )}
                      {!validationErrors.dueDate && project.startDate && project.endDate && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          Must be between {formatDateForDisplay(project.startDate)} and{" "}
                          {formatDateForDisplay(project.endDate)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="milestone-meta">
                      <div className="meta-item">
                        <Calendar size={16} /> Due Date:
                        <span
                          className={
                            isOverdue ? "due-date overdue" : "due-date"
                          }
                        >
                          {formatDateForDisplay(milestone.dueDate)}
                        </span>
                        {isOverdue && (
                          <span className="overdue-badge">Past</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {milestones.length > 10 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
              showInfo={true}
            />
          )}
        </>
      )}

      {/* Confirm Delete Milestone Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setMilestoneToDelete(null);
        }}
        onConfirm={confirmDeleteMilestone}
        title="Delete Milestone"
        description={`Are you sure you want to delete the milestone "${milestoneToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};
