import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select } from '../../ui/select';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskData: {
    id: string;
    title: string;
    description: string;
    priority: string;
    assignee: string;
    startDate: string;
    endDate: string;
    status: string;
    progress: number;
    epicId: string;
  }) => void;
  task: {
    id: string;
    title: string;
    description?: string;
    priority?: string;
    assignee?: string;
    startDate: string;
    endDate: string;
    status: string;
    progress?: number;
    epicId?: string;
  } | null;
  epicTitle?: string;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onUpdateTask,
  task,
  epicTitle
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: 'Quang Long',
    startDate: '',
    endDate: '',
    status: 'todo',
    progress: 0
  });

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        assignee: task.assignee || 'Quang Long',
        startDate: task.startDate,
        endDate: task.endDate,
        status: task.status,
        progress: task.progress || 0
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.title.trim() && task) {
      onUpdateTask({
        id: task.id,
        epicId: task.epicId || '',
        ...formData
      });
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-purple-100">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            Chỉnh sửa Task
          </DialogTitle>
          {epicTitle && (
            <p className="text-sm text-gray-600 mt-2">
              Trong Epic: <span className="font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">{epicTitle}</span>
            </p>
          )}
          <p className="text-sm text-gray-600 mt-2">Cập nhật thông tin Task hiện tại</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Tên Task *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: API Authentication"
              className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg h-12 text-lg font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về task này..."
              className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Độ ưu tiên
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: string) => setFormData({ ...formData, priority: value })}
              >
                <option value="low">🟢 Thấp</option>
                <option value="medium">🟡 Trung bình</option>
                <option value="high">🟠 Cao</option>
                <option value="urgent">🔴 Khẩn cấp</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Người phụ trách
              </Label>
              <Select
                value={formData.assignee}
                onValueChange={(value: string) => setFormData({ ...formData, assignee: value })}
              >
                <option value="Quang Long">👨‍💻 Quang Long</option>
                <option value="Phuoc Loc">👨‍💻 Phuoc Loc</option>
                <option value="Minh Duc">👨‍💻 Minh Duc</option>
                <option value="Van Anh">👩‍💻 Van Anh</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Trạng thái
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData({ ...formData, status: value })}
              >
                <option value="todo">⏳ Chưa bắt đầu</option>
                <option value="in-progress">🔄 Đang làm</option>
                <option value="review">👀 Đang review</option>
                <option value="done">✅ Hoàn thành</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Tiến độ (%)
              </Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg h-12 text-center font-semibold text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Ngày bắt đầu
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Ngày kết thúc
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg h-12"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-purple-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-3 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-lg font-medium transition-all"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Cập nhật Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
