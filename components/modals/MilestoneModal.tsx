import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Member } from '@/types';
import { MilestoneFormData } from '@/types/milestone';
import '@/app/styles/milestone.scss';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: MilestoneFormData) => void;
  initialData?: MilestoneFormData;
  projectMembers: Member[];
  mode: 'create' | 'edit';
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projectMembers,
  mode
}) => {
  const [formData, setFormData] = useState<MilestoneFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'pending',
    priority: 'medium',
    members: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="milestone-modal">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo Milestone Mới' : 'Chỉnh Sửa Milestone'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="milestone-form">
          <div className="form-group">
            <label htmlFor="name">Tên Milestone *</label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên milestone"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về milestone"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Ngày bắt đầu *</label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Ngày kết thúc *</label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="select-input"
              >
                <option value="pending">Chờ thực hiện</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="delayed">Bị trễ</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Độ ưu tiên</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="select-input"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Thành viên</label>
            <div className="members-grid">
              {projectMembers.map((member) => (
                <div key={member.id} className="member-item">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={formData.members.includes(member.id)}
                    onChange={(e) => {
                      const newMembers = e.target.checked
                        ? [...formData.members, member.id]
                        : formData.members.filter(id => id !== member.id);
                      setFormData({ ...formData, members: newMembers });
                    }}
                  />
                  <label htmlFor={`member-${member.id}`} className="member-label">
                    <div className="member-avatar">{member.avatar}</div>
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className="member-role">{member.role}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="default">
              {mode === 'create' ? 'Tạo Milestone' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneModal;
