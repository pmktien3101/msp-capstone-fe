'use client';

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
import { Edit, Calendar, PlayCircle, Pause, CheckCircle, X, Save } from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
    }
  });

  const onSubmit = (data: any) => {
    console.log(data);
    // Handle project update
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit size={20} />
            Chỉnh Sửa Dự Án
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tên dự án *</Label>
              <Input
                id="name"
                placeholder="Nhập tên dự án"
                {...register("name", { required: true })}
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả dự án"
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate", { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate", { required: true })}
                />
              </div>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} />
                          Lập kế hoạch
                        </div>
                      </SelectItem>
                      <SelectItem value="active">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <PlayCircle size={16} />
                          Đang thực hiện
                        </div>
                      </SelectItem>
                      <SelectItem value="on-hold">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Pause size={16} />
                          Tạm dừng
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={16} />
                          Hoàn thành
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

          </div>

          <DialogFooter>
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
    </Dialog>
  );
}
