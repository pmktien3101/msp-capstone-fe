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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderOpen, Calendar } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { Project, CreateProjectRequest } from '@/types/project';
import { useAuth } from "@/hooks/useAuth";
import { ProjectStatus, ALL_PROJECT_STATUSES } from '@/constants/status';

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(ALL_PROJECT_STATUSES as [string, ...string[]]).describe("Status"),
  members: z.array(z.string()).optional(),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject?: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onCreateProject }: CreateProjectModalProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  
  // console.log('CreateProjectModal render - isOpen:', isOpen, 'user:', user);
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: ProjectStatus.NotStarted,
      members: [],
    },
  });

  // Watch startDate changes
  const startDate = watch("startDate");

  // Auto-update status based on startDate
  useEffect(() => {
    if (startDate) {
      const selectedDate = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      // If startDate is today or in the past, set status to InProgress
      if (selectedDate <= today) {
        setValue("status", ProjectStatus.InProgress);
      } else {
        setValue("status", ProjectStatus.NotStarted);
      }
    }
  }, [startDate, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!user?.userId) {
      setSubmitError('User information not found');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Convert dates to ISO 8601 UTC format for PostgreSQL
      const startDateUTC = data.startDate 
        ? new Date(data.startDate + 'T00:00:00Z').toISOString()
        : undefined;
      
      const endDateUTC = data.endDate 
        ? new Date(data.endDate + 'T23:59:59Z').toISOString()
        : undefined;

      // Create project via API
      const projectData: CreateProjectRequest = {
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: startDateUTC,
        endDate: endDateUTC,
        createdById: user.userId
      };

      const result = await projectService.createProject(projectData);
      
      if (result.success && result.data) {
        // Call parent callback with created project
        if (onCreateProject) {
          onCreateProject(result.data);
        }
        
        // Close modal
        onClose();
      } else {
        setSubmitError(result.error || 'Unable to create project');
      }
    } catch (error) {
      console.error('Create project error:', error);
      setSubmitError('An error occurred while creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="create-project-modal">
        <DialogHeader>
          <DialogTitle className="cpm-header-title">
            <FolderOpen size={20} />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          {submitError && (
            <div className="cpm-error-banner">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}
          
          <div className="cpm-form-content">
            <div className="cpm-field">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                {...register("name")}
                className={errors.name ? "cpm-error-input" : ""}
              />
              {errors.name && (
                <p className="cpm-error-text">{errors.name.message}</p>
              )}
            </div>

            <div className="cpm-field">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your project goals and objectives"
                {...register("description")}
                className={errors.description ? "cpm-error-input" : ""}
              />
              {errors.description && (
                <p className="cpm-error-text">{errors.description.message}</p>
              )}
            </div>

            <div className="cpm-date-grid">
              <div className="cpm-field">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "cpm-error-input" : ""}
                />
                {errors.startDate && (
                  <p className="cpm-error-text">{errors.startDate.message}</p>
                )}
              </div>
              <div className="cpm-field">
                <Label htmlFor="endDate">Expected End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className={errors.endDate ? "cpm-error-input" : ""}
                />
                {errors.endDate && (
                  <p className="cpm-error-text">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="cpm-field">
              <Label>Status *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <>
                    <Select onValueChange={field.onChange} value={field.value} disabled>
                      <SelectTrigger className={`cpm-status-select ${errors.status ? "cpm-error-input" : ""}`}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]" position="popper" side="bottom" align="start">
                        <SelectItem value={ProjectStatus.NotStarted}>
                          <div className="cpm-status-item">
                            <Calendar size={16} />
                            Not Started
                          </div>
                        </SelectItem>
                        <SelectItem value={ProjectStatus.InProgress}>
                          <div className="cpm-status-item">
                            <Calendar size={16} />
                            In Progress
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="cpm-status-info">
                      {field.value === ProjectStatus.InProgress 
                        ? "Auto-set to In Progress (start date is today or past)" 
                        : "Default status for future projects"}
                    </p>
                  </>
                )}
              />
            </div>
          </div>

          <div className="cpm-footer">
            <Button 
              type="button" 
              variant="ghost"
              onClick={onClose}
              className="cpm-btn-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="cpm-btn-submit"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
