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
import { useForm } from "react-hook-form";
import { Project } from "@/types/project";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
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
          <DialogTitle>✏️ Chỉnh Sửa Dự Án</DialogTitle>
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
              <Select {...register("status")}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">📋 Lập kế hoạch</SelectItem>
                  <SelectItem value="active">🚀 Đang thực hiện</SelectItem>
                  <SelectItem value="on-hold">⏸️ Tạm dừng</SelectItem>
                  <SelectItem value="completed">✅ Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium mb-2">👁️ Xem trước thay đổi</h4>
              <div className="bg-white p-4 rounded-md">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📁</div>
                  <div className="flex-1">
                    <h5 className="text-base font-medium">{project.name}</h5>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              ❌ Hủy bỏ
            </Button>
            <Button type="submit">
              💾 Cập nhật dự án
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
