"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { MilestoneBackend } from "@/types/milestone";
import { GetTaskResponse } from "@/types/task";
import { TaskStatus } from "@/constants/status";
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
  const [tasks, setTasks] = useState<GetTaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null
  );
  const [editedMilestone, setEditedMilestone] = useState<
    Partial<MilestoneBackend>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // Confirm delete state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Check if user is Member (read-only mode)
  const isMemberRole = hasRole(UserRole.MEMBER);
  const canEdit =
    !readOnly && (hasRole(UserRole.PROJECT_MANAGER) || hasRole(UserRole.ADMIN));

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
      } else {
        setMilestones([]);
      }

      // Fetch tasks
      const tasksResponse = await taskService.getTasksByProjectId(project.id);
      if (tasksResponse.success && tasksResponse.data) {
        const taskItems = Array.isArray(tasksResponse.data)
          ? tasksResponse.data
          : (tasksResponse.data as any).items || [];
        setTasks(taskItems);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading data");
      setMilestones([]);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (project.id) {
      fetchData();
    }
  }, [project.id, refreshKey]);

  // Calculate milestone progress
  const getMilestoneProgress = (milestoneId: string) => {
    const milestoneTasks = tasks.filter(
      (task) =>
        task.milestones && task.milestones.some((m) => m.id === milestoneId)
    );

    if (milestoneTasks.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    const completed = milestoneTasks.filter(
      (task) => task.status === TaskStatus.Done
    ).length;
    const percentage = Math.round((completed / milestoneTasks.length) * 100);

    return {
      total: milestoneTasks.length,
      completed,
      percentage,
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
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMilestoneId(null);
    setEditedMilestone({});
  };

  // Save milestone changes
  const handleSaveMilestone = async () => {
    if (
      !editingMilestoneId ||
      !editedMilestone.name ||
      !editedMilestone.dueDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSaving(true);

      const updateData = {
        id: editingMilestoneId,
        projectId: project.id,
        name: editedMilestone.name,
        description: editedMilestone.description || "",
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
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
                        <label className="form-label">Milestone Name</label>
                        <input
                          type="text"
                          value={editedMilestone.name || ""}
                          onChange={(e) =>
                            setEditedMilestone({
                              ...editedMilestone,
                              name: e.target.value,
                            })
                          }
                          className="milestone-name-input"
                          placeholder="Enter milestone name..."
                        />
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
                          placeholder="Enter description..."
                          rows={3}
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
                        <TrendingUp size={14} />
                        <span className="progress-label">
                          Progress: {progress.completed}/{progress.total} tasks
                        </span>
                        <span className="progress-percentage">
                          {progress.percentage}%
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="edit-form-group">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        value={editedMilestone.dueDate || ""}
                        onChange={(e) =>
                          setEditedMilestone({
                            ...editedMilestone,
                            dueDate: e.target.value,
                          })
                        }
                        className="date-input"
                      />
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
        title="Xóa Milestone"
        description={`Bạn có chắc muốn xóa milestone "${milestoneToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};
