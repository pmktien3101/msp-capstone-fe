import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-orange-200 rounded-xl shadow-sm hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all duration-200 ease-in-out cursor-pointer bg-gradient-to-r from-white to-orange-50 hover:from-orange-50 hover:to-orange-100 flex items-center justify-between"
      >
        <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-orange-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-orange-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-150 hover:bg-orange-100 hover:text-orange-700 ${
                  value === option.value 
                    ? 'bg-orange-500 text-white hover:bg-orange-600 hover:text-white' 
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
    milestoneId?: string;
  } | null;
  itemType: 'milestone' | 'task';
  epicTitle?: string;
  mode: 'create' | 'edit';
  milestones?: Array<{
    id: string;
    name: string;
  }>;
  assignees?: Array<{
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
  milestones = [],
  assignees = []
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
    milestoneId: 'none'
  });

  // Update form data when item changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        title: item.title || item.name || '',
        description: item.description || '',
        priority: item.priority || (itemType === 'milestone' ? 'high' : 'medium'),
        assignee: item.assignee || (assignees.length > 0 ? assignees[0].name : 'Phuoc Loc'),
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        dueDate: item.dueDate || '',
        status: item.status,
        milestoneId: item.milestoneId || 'none'
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Check if creating task within a milestone
      const defaultMilestoneId = (itemType === 'task' && item?.milestoneId) ? item.milestoneId : 'none';
      
      setFormData({
        title: '',
        description: '',
        priority: itemType === 'milestone' ? 'high' : 'medium',
        assignee: assignees.length > 0 ? assignees[0].name : 'Phuoc Loc',
        startDate: itemType === 'task' ? today : '',
        endDate: itemType === 'task' ? nextWeek : '',
        dueDate: itemType === 'milestone' ? nextWeek : '',
        status: 'todo',
        milestoneId: defaultMilestoneId // Use milestoneId if creating task within milestone
      });
    }
  }, [item, itemType, mode]);

  // Update assignee default when assignees prop changes
  useEffect(() => {
    console.log('🔍 ItemModal - assignees:', assignees);
    console.log('🔍 ItemModal - formData.assignee:', formData.assignee);
    console.log('🔍 ItemModal - formData.status:', formData.status);
    console.log('🔍 ItemModal - formData.priority:', formData.priority);
    console.log('🔍 ItemModal - formData.milestoneId:', formData.milestoneId);
    // Only update if assignees are available and no assignee is set
    if (assignees.length > 0 && !formData.assignee) {
      setFormData(prev => ({
        ...prev,
        assignee: assignees[0].name
      }));
    }
  }, [assignees, formData.assignee]);

  // Debug when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal opened with formData:', formData);
      console.log('🔍 Modal opened with assignees:', assignees);
      console.log('🔍 Modal opened with milestones:', milestones);
    }
  }, [isOpen, formData, assignees, milestones]);

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
        {/* Simple Header */}
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              {isMilestone ? (
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9 6 9-6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? `Tạo ${isMilestone ? 'Milestone' : 'Task'} Mới` : `Chỉnh sửa ${isMilestone ? 'Milestone' : 'Task'}`}
              </div>
              {epicTitle && !isMilestone && (
                <div className="text-sm text-gray-500 mt-1">
                  Trong Milestone: <span className="font-medium text-gray-700">{epicTitle}</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
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
              <CustomDropdown
                value={formData.status}
                onChange={(value) => {
                  console.log('🔍 Status changed to:', value);
                  setFormData({ ...formData, status: value });
                }}
                options={[
                  { value: 'todo', label: 'Chưa bắt đầu' },
                  { value: 'in-progress', label: 'Đang làm' },
                  { value: 'review', label: 'Đang review' },
                  { value: 'done', label: 'Hoàn thành' }
                ]}
                placeholder="Chọn trạng thái"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium text-gray-600">
                Độ ưu tiên
              </Label>
              <CustomDropdown
                value={formData.priority}
                onChange={(value) => {
                  console.log('🔍 Priority changed to:', value);
                  setFormData({ ...formData, priority: value });
                }}
                options={[
                  { value: 'low', label: 'Thấp' },
                  { value: 'medium', label: 'Trung bình' },
                  { value: 'high', label: 'Cao' },
                  { value: 'urgent', label: 'Khẩn cấp' }
                ]}
                placeholder="Chọn độ ưu tiên"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-sm font-medium text-gray-600">
                Người phụ trách
              </Label>
              <CustomDropdown
                value={formData.assignee}
                onChange={(value) => {
                  console.log('🔍 Assignee changed to:', value);
                  setFormData({ ...formData, assignee: value });
                }}
                options={assignees.length > 0 
                  ? assignees.map(assignee => ({ value: assignee.name, label: assignee.name }))
                  : [
                      { value: 'Phuoc Loc', label: 'Phuoc Loc' },
                      { value: 'Quang Long', label: 'Quang Long' },
                      { value: 'Minh Duc', label: 'Minh Duc' },
                      { value: 'Van Anh', label: 'Van Anh' }
                    ]
                }
                placeholder="Chọn người phụ trách"
              />
            </div>
          </div>

          {/* Milestone Selection - Only for tasks */}
          {!isMilestone && (
            <div className="space-y-2">
              <Label htmlFor="milestoneId" className="text-sm font-medium text-gray-600">
                Thuộc Milestone
              </Label>
               <CustomDropdown
                 value={formData.milestoneId}
                 onChange={(value) => {
                   console.log('🔍 Milestone changed to:', value);
                   setFormData({ ...formData, milestoneId: value });
                 }}
                 options={[
                   { value: 'none', label: 'Không thuộc Milestone' },
                   ...milestones.map(milestone => ({ value: milestone.id, label: milestone.name }))
                 ]}
                 placeholder="Chọn Milestone (tùy chọn)"
               />
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
          <div className={`grid ${isMilestone ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
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
