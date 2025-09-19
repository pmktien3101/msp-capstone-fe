import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: {
    id?: string;
    title: string;
    description: string;
    priority: string;
    assignee: string;
    startDate?: string;
    endDate?: string;
    dueDate?: string;
    status: string;
    progress: number;
    milestoneId?: string;
  }) => void;
  item?: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    priority?: string;
    assignee?: string;
    startDate?: string;
    endDate?: string;
    dueDate?: string;
    status: string;
    progress?: number;
    milestoneId?: string;
  } | null;
  itemType: 'milestone' | 'task';
  epicTitle?: string;
  mode: 'create' | 'edit';
  milestones?: Array<{
    id: string;
    name: string;
  }>;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  itemType,
  epicTitle,
  mode,
  milestones = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: 'Phuoc Loc',
    startDate: '',
    endDate: '',
    dueDate: '',
    status: 'todo',
    progress: 0,
    milestoneId: 'none'
  });

  // Update form data when item changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        title: item.title || item.name || '',
        description: item.description || '',
        priority: item.priority || (itemType === 'milestone' ? 'high' : 'medium'),
        assignee: item.assignee || (itemType === 'milestone' ? 'Phuoc Loc' : 'Quang Long'),
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        dueDate: item.dueDate || '',
        status: item.status,
        progress: item.progress || 0,
        milestoneId: item.milestoneId || 'none'
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      setFormData({
        title: '',
        description: '',
        priority: itemType === 'milestone' ? 'high' : 'medium',
        assignee: itemType === 'milestone' ? 'Phuoc Loc' : 'Quang Long',
        startDate: itemType === 'task' ? today : '',
        endDate: itemType === 'task' ? nextWeek : '',
        dueDate: itemType === 'milestone' ? nextWeek : '',
        status: 'todo',
        progress: 0,
        milestoneId: 'none' // Default to no milestone for same-level tasks
      });
    }
  }, [item, itemType, mode]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.title.trim()) {
      const { milestoneId, ...restFormData } = formData;
      onSubmit({
        id: item?.id,
        milestoneId: milestoneId === 'none' ? undefined : milestoneId,
        ...restFormData
      });
      onClose();
    }
  };

  const isMilestone = itemType === 'milestone';
  const primaryColor = 'orange';
  const iconColor = 'from-orange-500 to-red-500';
  const inputColor = 'border-orange-200 focus:border-orange-400 focus:ring-orange-400';
  const buttonColor = 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600';
  const cancelColor = 'border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[600px] bg-white shadow-2xl rounded-xl border-0 overflow-hidden pt-4 mt-8`}>
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${iconColor} p-6 -m-6 mb-6 relative overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 bg-orange-300 bg-opacity-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 bg-opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500 bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <DialogHeader className="pb-0 relative z-10">
            <DialogTitle className="text-white flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center">
                {isMilestone ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9 6 9-6" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-xl font-bold text-white drop-shadow-lg">
                  {mode === 'create' ? `Tạo ${isMilestone ? 'Milestone' : 'Task'} Mới` : `Chỉnh sửa ${isMilestone ? 'Milestone' : 'Task'}`}
                </div>
                <div className="text-white text-opacity-95 text-sm font-normal mt-1 drop-shadow-md">
                  {mode === 'create' 
                    ? `${isMilestone ? 'Tạo một Milestone để đánh dấu mốc quan trọng' : 'Tạo một Task mới trong Milestone'}`
                    : `${isMilestone ? 'Cập nhật thông tin Milestone hiện tại' : 'Cập nhật thông tin Task hiện tại'}`
                  }
                </div>
                {epicTitle && !isMilestone && (
                  <div className="text-sm text-white text-opacity-90 mt-2 drop-shadow-md">
                    Trong Milestone: <span className="bg-orange-500 px-2 py-1 rounded-md text-xs">{epicTitle}</span>
                  </div>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 px-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-600">
              Tên {isMilestone ? 'Milestone' : 'Task'} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isMilestone ? "Ví dụ: HOÀN THÀNH PHẦN BACKEND" : "Ví dụ: API Authentication"}
              className={`${inputColor} rounded-lg h-10 text-sm font-medium px-3 border focus:ring-1 focus:ring-opacity-50 transition-all`}
              required
            />
          </div>

          {/* Status, Priority, Assignee Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-600">
                Trạng thái
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className={`${inputColor} rounded-lg h-10 border focus:ring-1 focus:ring-opacity-50 transition-all`}>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Chưa bắt đầu</SelectItem>
                  <SelectItem value="in-progress">Đang làm</SelectItem>
                  <SelectItem value="review">Đang review</SelectItem>
                  <SelectItem value="done">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium text-gray-600">
                Độ ưu tiên
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: string) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className={`${inputColor} rounded-lg h-10 border focus:ring-1 focus:ring-opacity-50 transition-all`}>
                  <SelectValue placeholder="Chọn độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-sm font-medium text-gray-600">
                Người phụ trách
              </Label>
              <Select
                value={formData.assignee}
                onValueChange={(value: string) => setFormData({ ...formData, assignee: value })}
              >
                <SelectTrigger className={`${inputColor} rounded-lg h-10 border focus:ring-1 focus:ring-opacity-50 transition-all`}>
                  <SelectValue placeholder="Chọn người phụ trách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phuoc Loc">Phuoc Loc</SelectItem>
                  <SelectItem value="Quang Long">Quang Long</SelectItem>
                  <SelectItem value="Minh Duc">Minh Duc</SelectItem>
                  <SelectItem value="Van Anh">Van Anh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Milestone Selection - Only for tasks */}
          {!isMilestone && (
            <div className="space-y-2">
              <Label htmlFor="milestoneId" className="text-sm font-medium text-gray-600">
                Thuộc Milestone
              </Label>
              <Select
                value={formData.milestoneId}
                onValueChange={(value: string) => setFormData({ ...formData, milestoneId: value })}
              >
                <SelectTrigger className={`${inputColor} rounded-lg h-10 border focus:ring-1 focus:ring-opacity-50 transition-all`}>
                  <SelectValue placeholder="Chọn Milestone (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không thuộc Milestone</SelectItem>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-600">
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder={`Mô tả chi tiết về ${isMilestone ? 'milestone' : 'task'} này...`}
              className={`${inputColor} rounded-lg resize-none border focus:ring-1 focus:ring-opacity-50 transition-all px-3 py-2`}
              rows={3}
            />
          </div>

          {/* Progress and Dates Row */}
          <div className={`grid ${isMilestone ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="progress" className="text-sm font-medium text-gray-600">
                Tiến độ (%)
              </Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className={`${inputColor} rounded-lg h-10 text-center font-medium border focus:ring-1 focus:ring-opacity-50 transition-all`}
              />
            </div>

            {isMilestone ? (
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-gray-600">
                  Ngày dự kiến *
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`${inputColor} rounded-lg h-10 text-sm border focus:ring-1 focus:ring-opacity-50 transition-all`}
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-600">
                    Ngày bắt đầu *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`${inputColor} rounded-lg h-10 text-sm border focus:ring-1 focus:ring-opacity-50 transition-all`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-600">
                    Ngày kết thúc *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`${inputColor} rounded-lg h-10 text-sm border focus:ring-1 focus:ring-opacity-50 transition-all`}
                    required
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className={`flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6`}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`px-6 py-2 ${cancelColor} rounded-lg font-medium text-sm transition-all hover:scale-105 border`}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className={`px-8 py-2 bg-gradient-to-r ${buttonColor} text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-0`}
            >
              {mode === 'create' ? `Tạo ${isMilestone ? 'Milestone' : 'Task'}` : `Cập nhật ${isMilestone ? 'Milestone' : 'Task'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
