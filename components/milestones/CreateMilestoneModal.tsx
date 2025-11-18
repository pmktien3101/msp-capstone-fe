"use client";

import { useState } from "react";
import { X, Calendar, FileText, Target } from "lucide-react";
import { milestoneService } from "@/services/milestoneService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import "@/app/styles/create-milestone-modal.scss";

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMilestone?: (milestoneData: any) => void;
  onSuccess?: () => void;
  projectId: string;
}

export const CreateMilestoneModal = ({
  isOpen,
  onClose,
  onCreateMilestone,
  onSuccess,
  projectId,
}: CreateMilestoneModalProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Milestone name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Milestone name must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        console.error('No user found from useAuth');
        toast.error('User information not found. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      console.log('User from useAuth:', user);
      console.log('Using userId:', user.userId);

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
        
        toast.success('Milestone created successfully!');
        
        // Reset form
        setFormData({
          name: "",
          description: "",
          dueDate: "",
        });
        setErrors({});
        onClose();
      } else {
        toast.error(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('An error occurred while creating milestone');
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
    setErrors({});
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
              <FileText size={16} />
              Milestone Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Enter milestone name..."
              maxLength={100}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <FileText size={16} />
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`form-textarea ${errors.description ? "error" : ""}`}
              placeholder="Enter detailed description of this milestone..."
              rows={4}
              maxLength={500}
            />
            <div className="char-count">
              {formData.description.length}/500 characters
            </div>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              <Calendar size={16} />
              Due Date *
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className={`form-input ${errors.dueDate ? "error" : ""}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
