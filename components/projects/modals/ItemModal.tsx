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
    startDate: string;
    endDate: string;
    status: string;
    progress: number;
    epicId?: string;
  }) => void;
  item?: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    priority?: string;
    assignee?: string;
    startDate: string;
    endDate: string;
    status: string;
    progress?: number;
    epicId?: string;
  } | null;
  itemType: 'epic' | 'task';
  epicTitle?: string;
  mode: 'create' | 'edit';
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  itemType,
  epicTitle,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: 'Phuoc Loc',
    startDate: '',
    endDate: '',
    status: 'todo',
    progress: 0
  });

  // Update form data when item changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        title: item.title || item.name || '',
        description: item.description || '',
        priority: item.priority || (itemType === 'epic' ? 'high' : 'medium'),
        assignee: item.assignee || (itemType === 'epic' ? 'Phuoc Loc' : 'Quang Long'),
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
        progress: item.progress || 0
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        priority: itemType === 'epic' ? 'high' : 'medium',
        assignee: itemType === 'epic' ? 'Phuoc Loc' : 'Quang Long',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'todo',
        progress: 0
      });
    }
  }, [item, itemType, mode]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit({
        id: item?.id,
        epicId: item?.epicId || '',
        ...formData
      });
      onClose();
    }
  };

  const isEpic = itemType === 'epic';
  const primaryColor = isEpic ? 'orange' : 'purple';
  const iconColor = isEpic ? 'from-orange-500 to-red-500' : 'from-purple-500 to-indigo-500';
  const inputColor = isEpic ? 'border-orange-200 focus:border-orange-400 focus:ring-orange-400' : 'border-purple-200 focus:border-purple-400 focus:ring-purple-400';
  const buttonColor = isEpic ? 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' : 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600';
  const cancelColor = isEpic ? 'border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300' : 'border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[600px] bg-white shadow-2xl rounded-xl border-0 overflow-hidden`}>
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${primaryColor} p-6 -m-6 mb-6 relative overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white bg-opacity-5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <DialogHeader className="pb-0 relative z-10">
            <DialogTitle className="text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg border border-white border-opacity-30">
                {isEpic ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-xl font-bold text-white">
                  {mode === 'create' ? `Tạo ${isEpic ? 'Epic' : 'Task'} Mới` : `Chỉnh sửa ${isEpic ? 'Epic' : 'Task'}`}
                </div>
                <div className="text-white text-opacity-90 text-sm font-normal mt-1">
                  {mode === 'create' 
                    ? `${isEpic ? 'Tạo một Epic lớn để quản lý nhiều Task con' : 'Tạo một Task mới trong Epic'}`
                    : `${isEpic ? 'Cập nhật thông tin Epic hiện tại' : 'Cập nhật thông tin Task hiện tại'}`
                  }
                </div>
                {epicTitle && !isEpic && (
                  <div className="text-sm text-white text-opacity-80 mt-2">
                    Trong Epic: <span className="font-semibold bg-white bg-opacity-20 px-2 py-1 rounded-md text-xs">{epicTitle}</span>
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
              Tên {isEpic ? 'Epic' : 'Task'} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isEpic ? "Ví dụ: XÂY DỰNG HỆ THỐNG LOGIN" : "Ví dụ: API Authentication"}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-600">
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder={`Mô tả chi tiết về ${isEpic ? 'epic' : 'task'} này...`}
              className={`${inputColor} rounded-lg resize-none border focus:ring-1 focus:ring-opacity-50 transition-all px-3 py-2`}
              rows={3}
            />
          </div>

          {/* Progress and Dates Row */}
          <div className="grid grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-600">
                Ngày bắt đầu
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
                Ngày kết thúc
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
              {mode === 'create' ? `Tạo ${isEpic ? 'Epic' : 'Task'}` : `Cập nhật ${isEpic ? 'Epic' : 'Task'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
