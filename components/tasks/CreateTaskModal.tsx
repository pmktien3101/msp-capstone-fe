"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, User, Flag, FileText, Layers } from "lucide-react";
import { milestoneService } from "@/services/milestoneService";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import type { MilestoneBackend } from "@/types/milestone";
import type { ProjectMember } from "@/types/project";
import { 
  TaskStatus, 
  TASK_STATUS_OPTIONS, 
  getTaskStatusEnum, 
  getTaskStatusColor, 
  getTaskStatusLabel 
} from "@/constants/status";
import "@/app/styles/create-task-modal.scss";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId?: string;
  defaultStatus?: string;
  onCreateTask: (taskData: any) => void;
  projectId?: string;
  taskToEdit?: any;
}

export const CreateTaskModal = ({ 
  isOpen, 
  onClose, 
  milestoneId, 
  defaultStatus = TaskStatus.NotStarted,
  onCreateTask,
  projectId,
  taskToEdit
}: CreateTaskModalProps) => {
  const { user } = useAuth();
  const isMember = user?.role === UserRole.MEMBER;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    milestoneIds: milestoneId ? [milestoneId] : [],
    status: defaultStatus,
    assignee: "",
    startDate: "",
    endDate: ""
  });

  // UI state
  const [errors, setErrors] = useState<any>({});

  // Data state
  const [milestones, setMilestones] = useState<MilestoneBackend[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Load milestones
  useEffect(() => {
    if (isOpen && projectId) {
      loadMilestones();
    }
  }, [isOpen, projectId]);

  // Load members
  useEffect(() => {
    if (isOpen && projectId) {
      loadMembers();
    }
  }, [isOpen, projectId]);

  // Pre-fill form when editing
  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        milestoneIds: taskToEdit.milestoneIds || [],
        status: taskToEdit.status || defaultStatus,
        assignee: taskToEdit.assignee || "",
        startDate: taskToEdit.startDate || "",
        endDate: taskToEdit.endDate || ""
      });
    }
  }, [taskToEdit, defaultStatus]);

  const loadMilestones = async () => {
    if (!projectId) return;
    
    setIsLoadingMilestones(true);
    try {
      const response = await milestoneService.getMilestonesByProjectId(projectId);
      setMilestones(response.data || []);
    } catch (error) {
      console.error("Error loading milestones:", error);
      setMilestones([]);
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  const loadMembers = async () => {
    if (!projectId) return;
    
    setIsLoadingMembers(true);
    try {
      const response = await projectService.getProjectMembers(projectId);
      setMembers(response.data || []);
    } catch (error) {
      console.error("Error loading members:", error);
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onCreateTask(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      milestoneIds: milestoneId ? [milestoneId] : [],
      status: defaultStatus,
      assignee: "",
      startDate: "",
      endDate: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="create-task-modal-overlay" onClick={handleClose}>
      <div className="create-task-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="create-task-modal-header">
          <h2 className="modal-title">
            {taskToEdit ? "Edit Task" : "Create New Task"}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="create-task-modal-body">
          <form id="create-task-form" onSubmit={handleSubmit} className="create-task-modal-form">
            {/* Left Panel */}
            <div className="create-task-left-panel">
              {/* Task Title */}
              <div className="create-task-form-group">
                <label className="form-label">
                  <FileText size={16} />
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`form-input ${errors.title ? "error" : ""}`}
                  placeholder="Enter task title"
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              {/* Description */}
              <div className="create-task-form-group">
                <label className="form-label">
                  <FileText size={16} />
                  Description * 
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`form-textarea ${errors.description ? "error" : ""}`}
                  placeholder="Describe the task in detail"
                  rows={8}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            {/* Right Panel */}
            <div className="create-task-right-panel">
              {/* Status */}
              <div className="create-task-form-group">
                <label className="form-label">
                  <Flag size={16} />
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="form-select"
                >
                  {TASK_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div className="create-task-form-group">
                <label className="form-label">
                  <User size={16} />
                  Assignee
                </label>
                {isLoadingMembers ? (
                  <div className="create-task-loading-state">Loading members...</div>
                ) : (
                  <select
                    value={formData.assignee}
                    onChange={(e) => handleInputChange("assignee", e.target.value)}
                    className={`form-select ${isMember ? 'disabled' : ''}`}
                    disabled={isMember}
                    title={isMember ? "You don't have permission to change assignee" : ""}
                  >
                    <option value="">Unassigned</option>
                    {members.map((projectMember) => (
                      <option key={projectMember.id} value={projectMember.userId}>
                        {projectMember.member?.fullName || projectMember.member?.email || 'Unknown'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Start Date */}
              <div className="create-task-form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className={`form-input ${errors.startDate ? "error" : ""}`}
                  placeholder="dd/mm/yyyy"
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              {/* End Date */}
              <div className="create-task-form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={`form-input ${errors.endDate ? "error" : ""}`}
                  placeholder="dd/mm/yyyy"
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>

              {/* Milestones */}
              <div className="create-task-form-group">
                <label className="form-label">
                  <Layers size={16} />
                  Related Milestones
                </label>
                {isLoadingMilestones ? (
                  <div className="create-task-loading-state">Loading milestones...</div>
                ) : milestones.length === 0 ? (
                  <div className="create-task-empty-state">No milestones available</div>
                ) : (
                  <div className="create-task-milestone-selection">
                    {milestones.map((milestone) => (
                      <label key={milestone.id} className="milestone-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.milestoneIds.includes(milestone.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange("milestoneIds", [...formData.milestoneIds, milestone.id.toString()]);
                            } else {
                              handleInputChange("milestoneIds", formData.milestoneIds.filter((id: string) => id !== milestone.id.toString()));
                            }
                          }}
                        />
                        <span className="milestone-name">{milestone.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="create-task-modal-footer">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" form="create-task-form">
              {taskToEdit ? "Update Task" : "Create Task"}
            </button>
        </div>
      </div>
    </div>
  );
};
