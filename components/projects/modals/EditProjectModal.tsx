'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Project } from "@/types/project";
import { Edit, X, Save } from 'lucide-react';
import { PROJECT_STATUS_OPTIONS } from '@/constants/status';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject?: (projectData: any) => void;
}

export function EditProjectModal({ isOpen, onClose, project, onUpdateProject }: EditProjectModalProps) {
  // Helper function to convert ISO date to YYYY-MM-DD format
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: project.name,
      description: project.description,
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      status: project.status,
    }
  });

  // Watch for date changes
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const [dateError, setDateError] = useState<string>("");

  // Validate dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        setDateError("End date must be after or equal to start date");
      } else {
        setDateError("");
      }
    }
  }, [startDate, endDate]);

  const onSubmit = (data: any) => {
    // Validate dates before submitting
    if (dateError) {
      return;
    }

    console.log(data);
    
    // Convert dates to ISO 8601 UTC format for PostgreSQL
    const startDateUTC = data.startDate 
      ? new Date(data.startDate + 'T00:00:00Z').toISOString()
      : undefined;
    
    const endDateUTC = data.endDate 
      ? new Date(data.endDate + 'T23:59:59Z').toISOString()
      : undefined;

    // Handle project update
    if (onUpdateProject) {
      onUpdateProject({
        ...data,
        startDate: startDateUTC,
        endDate: endDateUTC
      });
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="edit-project-modal">
        <DialogHeader>
          <DialogTitle className="epm-header-title">
            <Edit size={20} />
            Edit Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="epm-form-content">
            <div className="epm-field">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                {...register("name", { required: "Project name is required" })}
                className={errors.name ? "epm-error-input" : ""}
              />
              {errors.name && (
                <p className="epm-error-text">{errors.name.message}</p>
              )}
            </div>

            <div className="epm-field">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your project goals and objectives"
                {...register("description", { required: "Description is required" })}
                className={errors.description ? "epm-error-input" : ""}
              />
              {errors.description && (
                <p className="epm-error-text">{errors.description.message}</p>
              )}
            </div>

            <div className="epm-date-grid">
              <div className="epm-field">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate", { required: "Start date is required" })}
                  className={errors.startDate || dateError ? "epm-error-input" : ""}
                />
                {errors.startDate && (
                  <p className="epm-error-text">{errors.startDate.message}</p>
                )}
              </div>
              <div className="epm-field">
                <Label htmlFor="endDate">Expected End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate", { required: "End date is required" })}
                  className={errors.endDate || dateError ? "epm-error-input" : ""}
                />
                {errors.endDate && (
                  <p className="epm-error-text">{errors.endDate.message}</p>
                )}
                {dateError && (
                  <p className="epm-error-text">{dateError}</p>
                )}
              </div>
            </div>

            <div className="epm-field">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                {...register("status", { required: "Status is required" })}
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.status ? "epm-error-input" : ""}`}
              >
                <option value="">Select status</option>
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="epm-error-text">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="epm-footer">
            <Button 
              type="button" 
              variant="ghost"
              onClick={onClose}
              className="epm-btn-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="epm-btn-submit"
            >
              Update Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
