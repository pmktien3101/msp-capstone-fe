'use client';

import { useState } from 'react';
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
import '@/app/styles/edit-project-modal.scss';

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

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      name: project.name,
      description: project.description,
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      status: project.status,
    }
  });

  const onSubmit = (data: any) => {
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
      <DialogContent className="edit-project-modal sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="dialog-title">
            <Edit size={20} />
            Edit Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="form-content scrollbar-hide">
            <div className="form-field">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                {...register("name", { required: "Project name is required" })}
                className={errors.name ? "error" : ""}
              />
              {errors.name && (
                <p className="error-text">{errors.name.message}</p>
              )}
            </div>

            <div className="form-field">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Project description"
                {...register("description", { required: "Description is required" })}
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <p className="error-text">{errors.description.message}</p>
              )}
            </div>

            <div className="date-grid">
              <div className="form-field">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate", { required: "Start date is required" })}
                  className={errors.startDate ? "error" : ""}
                />
                {errors.startDate && (
                  <p className="error-text">{errors.startDate.message}</p>
                )}
              </div>
              <div className="form-field">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate", { required: "End date is required" })}
                  className={errors.endDate ? "error" : ""}
                />
                {errors.endDate && (
                  <p className="error-text">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="form-field">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                {...register("status", { required: "Status is required" })}
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.status ? "error" : ""}`}
              >
                <option value="">Select status</option>
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="error-text">{errors.status.message}</p>
              )}
            </div>

          </div>

          <DialogFooter className="dialog-footer">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              className="btn-cancel"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button 
              type="submit"
              className="btn-submit"
            >
              <Save size={16} />
              Update Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
