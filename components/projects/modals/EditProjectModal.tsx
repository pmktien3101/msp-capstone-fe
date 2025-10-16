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
import { Project } from "@/types/project";
import { Edit, X, Save } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit size={20} />
            Chỉnh Sửa Dự Án
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            <div>
              <Label htmlFor="name">Tên dự án *</Label>
              <Input
                id="name"
                placeholder="Nhập tên dự án"
                {...register("name", { required: "Tên dự án là bắt buộc" })}
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
                {...register("description", { required: "Mô tả là bắt buộc" })}
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
                  {...register("startDate", { required: "Ngày bắt đầu là bắt buộc" })}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate", { required: "Ngày kết thúc là bắt buộc" })}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Trạng thái *</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Trạng thái là bắt buộc" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chưa bắt đầu">Chưa bắt đầu</SelectItem>
                      <SelectItem value="Đang hoạt động">Đang hoạt động</SelectItem>
                      <SelectItem value="Tạm dừng">Tạm dừng</SelectItem>
                      <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
              )}
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
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
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
              <X size={16} />
              Hủy bỏ
            </Button>
            <Button 
              type="submit"
              style={{
                background: 'transparent',
                color: '#FF5E13',
                border: '1px solid #FF5E13',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FF5E13';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#FF5E13';
              }}
            >
              <Save size={16} />
              Cập nhật dự án
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
