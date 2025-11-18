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
  name: z.string().min(1, "Tên dự án là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  status: z.enum(ALL_PROJECT_STATUSES as [string, ...string[]]).describe("Trạng thái"),
  members: z.array(z.string()).optional(),
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
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: ProjectStatus.NotStarted,
      members: [],
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (!user?.userId) {
      setSubmitError('Không tìm thấy thông tin người dùng');
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
        setSubmitError(result.error || 'Không thể tạo dự án');
      }
    } catch (error) {
      console.error('Create project error:', error);
      setSubmitError('Đã xảy ra lỗi khi tạo dự án');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={20} />
            Tạo Dự Án Mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-600">{submitError}</span>
            </div>
          )}
          
          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            <div>
              <Label htmlFor="name">Tên dự án *</Label>
              <Input
                id="name"
                placeholder="Nhập tên dự án"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                placeholder="Mô tả dự án"
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="endDate">Ngày dự kiến kết thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Trạng thái *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled>
                    <SelectTrigger className={`${errors.status ? "border-red-500" : ""} bg-gray-100 cursor-not-allowed`}>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]" position="popper" side="bottom" align="start">
                      <SelectItem value={ProjectStatus.NotStarted}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} />
                          Chưa bắt đầu
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">Trạng thái mặc định cho dự án mới</p>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#d1d5db' : 'transparent',
                color: isSubmitting ? '#9ca3af' : '#FF5E13',
                border: `1px solid ${isSubmitting ? '#d1d5db' : '#FF5E13'}`,
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#FF5E13';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#FF5E13';
                }
              }}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo dự án'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Dialog>
  );
}
