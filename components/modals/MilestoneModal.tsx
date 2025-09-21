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

      <style jsx>{`
        /* Responsive Design for MilestoneModal */
        
        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 769px) {
          .milestone-modal {
            max-width: 90vw !important;
            margin: 20px !important;
          }

          .milestone-form {
            padding: 20px !important;
          }

          .form-row {
            flex-direction: column !important;
            gap: 12px !important;
          }

          .member-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }

        /* Mobile Large (481px - 768px) */
        @media (max-width: 768px) and (min-width: 481px) {
          .milestone-modal {
            max-width: 95vw !important;
            margin: 10px !important;
          }

          .milestone-form {
            padding: 16px !important;
          }

          .form-row {
            flex-direction: column !important;
            gap: 10px !important;
          }

          .member-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .member-label {
            padding: 12px !important;
          }

          .member-avatar {
            width: 32px !important;
            height: 32px !important;
            font-size: 14px !important;
          }

          .member-name {
            font-size: 14px !important;
          }

          .member-role {
            font-size: 12px !important;
          }
        }

        /* Mobile Small (320px - 480px) */
        @media (max-width: 480px) {
          .milestone-modal {
            max-width: 100vw !important;
            margin: 0 !important;
            height: 100vh !important;
            border-radius: 0 !important;
          }

          .milestone-form {
            padding: 12px !important;
          }

          .form-row {
            flex-direction: column !important;
            gap: 8px !important;
          }

          .member-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .member-label {
            padding: 10px !important;
          }

          .member-avatar {
            width: 28px !important;
            height: 28px !important;
            font-size: 12px !important;
          }

          .member-name {
            font-size: 13px !important;
          }

          .member-role {
            font-size: 11px !important;
          }

          .form-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }

          .form-actions button {
            width: 100% !important;
          }
        }
      `}</style>
    </Dialog>
  );
};

export default MilestoneModal;
