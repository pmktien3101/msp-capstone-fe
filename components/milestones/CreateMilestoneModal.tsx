"use client";

import { useState } from "react";
import { X, Target } from "lucide-react";
import { milestoneService } from "@/services/milestoneService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { Project } from "@/types/project";
import "@/app/styles/create-milestone-modal.scss";

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMilestone?: (milestoneData: any) => void;
  onSuccess?: () => void;
  projectId: string;
  project?: Project; // Add project prop for date validation
}

export const CreateMilestoneModal = ({
  isOpen,
  onClose,
  onCreateMilestone,
  onSuccess,
  projectId,
  project,
}: CreateMilestoneModalProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    description: "",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    setValidationErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
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

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      dueDate: "",
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Milestone name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Milestone name must be at least 3 characters";
    } else if (formData.name.trim().length > 200) {
      newErrors.name = "Milestone name must not exceed 200 characters";
    }

    // Validate due date
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      // Validate against project dates if project info is available
      if (project?.startDate) {
        const projectStart = new Date(project.startDate);
        const milestoneDue = new Date(formData.dueDate);
        projectStart.setHours(0, 0, 0, 0);
        milestoneDue.setHours(0, 0, 0, 0);

        if (milestoneDue < projectStart) {
          newErrors.dueDate = `Due date must be on or after project start date (${formatDateForDisplay(project.startDate)})`;
        }
      }

      if (project?.endDate) {
        const projectEnd = new Date(project.endDate);
        const milestoneDue = new Date(formData.dueDate);
        projectEnd.setHours(0, 0, 0, 0);
        milestoneDue.setHours(0, 0, 0, 0);

        if (milestoneDue > projectEnd) {
          newErrors.dueDate = `Due date must be on or before project end date (${formatDateForDisplay(project.endDate)})`;
        }
      }
    }

    setValidationErrors(newErrors);
    return !newErrors.name && !newErrors.description && !newErrors.dueDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get userId from useAuth hook
      if (!user || !user.userId) {
        console.error("No user found from useAuth");
        toast.error(
          "User information not found. Please login again."
        );
        setIsSubmitting(false);
        return;
      }

      console.log("User from useAuth:", user);
      console.log("Using userId:", user.userId);

      const milestoneData = {
        userId: user.userId,
        projectId: projectId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate,
      };

      const response = await milestoneService.createMilestone(milestoneData);

      if (response.success) {
        // Call onCreateMilestone if provided (for backwards compatibility)
        if (onCreateMilestone) {
          onCreateMilestone(response.data);
        }

        // Call onSuccess to refresh the milestone list
        if (onSuccess) {
          onSuccess();
        }

        toast.success("Milestone created successfully!");

        // Reset form
        setFormData({
          name: "",
          description: "",
          dueDate: "",
        });
        setValidationErrors({ name: "", description: "", dueDate: "" });
        onClose();
      } else {
        toast.error(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast.error("An error occurred while creating milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      dueDate: "",
    });
    setValidationErrors({ name: "", description: "", dueDate: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Target size={24} />
            <h2>Create New Milestone</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Milestone Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`form-input ${validationErrors.name ? "error" : ""}`}
              placeholder="Enter milestone name..."
              maxLength={200}
            />
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span>
            )}
            {!validationErrors.name && formData.name && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {formData.name.length}/200 characters
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`form-textarea ${validationErrors.description ? "error" : ""}`}
              placeholder="Enter detailed description of this milestone (optional)..."
              rows={4}
              maxLength={1000}
            />
            <div className="char-count">
              {formData.description.length}/1000 characters
            </div>
            {validationErrors.description && (
              <span className="error-message">{validationErrors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              Due Date *
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className={`form-input ${validationErrors.dueDate ? "error" : ""}`}
              min={project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : undefined}
              max={project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : undefined}
            />
            {validationErrors.dueDate && (
              <span className="error-message">{validationErrors.dueDate}</span>
            )}
            {!validationErrors.dueDate && project?.startDate && project?.endDate && (
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

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Milestone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
