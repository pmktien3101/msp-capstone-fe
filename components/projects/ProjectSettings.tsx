"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { Member } from "@/types/member";
import { AddMemberModal } from "./modals/AddMemberModal";
import { EditMemberModal } from "./modals/EditMemberModal";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  Save,
  X,
  Calendar,
  User,
  Mail,
  MessageSquare,
  Paperclip
} from "lucide-react";

interface ProjectSettingsProps {
  project: Project;
}

export const ProjectSettings = ({ project }: ProjectSettingsProps) => {
  type Settings = {
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    manager: string;
    notifications: {
      email: boolean;
      slack: boolean;
      inApp: boolean;
    };
    permissions: {
      public: boolean;
      membersOnly: boolean;
      allowComments: boolean;
      allowAttachments: boolean;
    };
  };

  const [settings, setSettings] = useState<Settings>({
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    manager: project.manager ?? '',
    notifications: {
      email: true,
      slack: false,
      inApp: true,
    },
    permissions: {
      public: false,
      membersOnly: true,
      allowComments: true,
      allowAttachments: true,
    },
  });

  const [members, setMembers] = useState<Member[]>(project.members ?? []);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = <T extends keyof Settings>(
    parent: T,
    field: keyof Settings[T],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object),
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving settings:", settings);
    console.log("Saving members:", members);
  };

  const handleAddMember = (member: Member) => {
    setMembers((prev) => [...prev, member]);
    setShowAddMemberModal(false);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  return (
    <div className="project-settings">
      <div className="settings-content">
        <div className="settings-section">
            <div className="section-header">
              <div className="section-icon">
                <Settings size={16} color="white" />
              </div>
          <h4>Thông tin cơ bản</h4>
          </div>
          
          <div className="form-grid">
          <div className="form-group full-width">
              <label className="form-label">
                <User size={14} />
                Tên dự án
              </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="form-input"
                placeholder="Nhập tên dự án"
            />
          </div>

            <div className="form-group full-width">
              <label className="form-label">
                <MessageSquare size={14} />
                Mô tả
              </label>
            <textarea
              value={settings.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="form-textarea"
              rows={3}
                placeholder="Mô tả chi tiết về dự án"
            />
          </div>

            <div className="form-group">
              <label className="form-label">
                <Shield size={14} />
                Trạng thái
              </label>
              <select
                value={settings.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="form-select"
              >
                <option value="planning">Đang lập kế hoạch</option>
                <option value="active">Đang hoạt động</option>
                <option value="on-hold">Tạm dừng</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={14} />
                Quản lý dự án
              </label>
              <input
                type="text"
                value={settings.manager}
                onChange={(e) => handleInputChange("manager", e.target.value)}
                className="form-input"
                placeholder="Tên người quản lý"
              />
          </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={settings.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Bell size={16} color="white" />
            </div>
          <h4>Thông báo</h4>
          </div>
          
          <div className={`checkbox-grid ${Object.keys(settings.notifications).length % 2 === 1 ? 'three-columns' : ''}`}>
            <div className="checkbox-card">
              <div className="checkbox-header">
                <Mail size={16} color="#FF5E13" />
                <span className="checkbox-title">Email thông báo</span>
              </div>
              <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) =>
                  handleNestedChange("notifications", "email", e.target.checked)
                }
              />
                <span className="toggle-slider"></span>
            </label>
            </div>

            <div className="checkbox-card">
              <div className="checkbox-header">
                <MessageSquare size={16} color="#FF5E13" />
                <span className="checkbox-title">Slack thông báo</span>
              </div>
              <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={settings.notifications.slack}
                onChange={(e) =>
                  handleNestedChange("notifications", "slack", e.target.checked)
                }
              />
                <span className="toggle-slider"></span>
            </label>
            </div>

            <div className="checkbox-card">
              <div className="checkbox-header">
                <Bell size={16} color="#FF5E13" />
                <span className="checkbox-title">Thông báo trong ứng dụng</span>
              </div>
              <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={settings.notifications.inApp}
                onChange={(e) =>
                  handleNestedChange("notifications", "inApp", e.target.checked)
                }
              />
                <span className="toggle-slider"></span>
            </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Shield size={16} color="white" />
            </div>
          <h4>Quyền truy cập</h4>
          </div>
          
          <div className={`checkbox-grid ${Object.keys(settings.permissions).length % 2 === 1 ? 'three-columns' : ''}`}>
            <div className="checkbox-card">
              <div className="checkbox-header">
                <Shield size={16} color="#FF5E13" />
                <span className="checkbox-title">Dự án công khai</span>
              </div>
              <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={settings.permissions.public}
                onChange={(e) =>
                  handleNestedChange("permissions", "public", e.target.checked)
                }
              />
                <span className="toggle-slider"></span>
            </label>
            </div>

            <div className="checkbox-card">
              <div className="checkbox-header">
                <Users size={16} color="#FF5E13" />
                <span className="checkbox-title">Chỉ thành viên</span>
              </div>
              <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={settings.permissions.membersOnly}
                onChange={(e) =>
                  handleNestedChange(
                    "permissions",
                    "membersOnly",
                    e.target.checked
                  )
                }
              />
                <span className="toggle-slider"></span>
            </label>
            </div>

            <div className="checkbox-card">
              <div className="checkbox-header">
                <MessageSquare size={16} color="#FF5E13" />
                <span className="checkbox-title">Cho phép bình luận</span>
              </div>
              <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={settings.permissions.allowComments}
                onChange={(e) =>
                  handleNestedChange(
                    "permissions",
                    "allowComments",
                    e.target.checked
                  )
                }
              />
                <span className="toggle-slider"></span>
            </label>
            </div>

            <div className="checkbox-card">
              <div className="checkbox-header">
                <Paperclip size={16} color="#FF5E13" />
                <span className="checkbox-title">Cho phép đính kèm</span>
              </div>
              <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={settings.permissions.allowAttachments}
                onChange={(e) =>
                  handleNestedChange(
                    "permissions",
                    "allowAttachments",
                    e.target.checked
                  )
                }
              />
                <span className="toggle-slider"></span>
            </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Users size={16} color="white" />
            </div>
            <h4>Thành viên dự án ({members.length})</h4>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddMemberModal(true)}
            >
              <Plus size={14} />
              Thêm thành viên
            </button>
          </div>
          <div className="members-list">
            {members.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Users size={40} color="#9CA3AF" />
                </div>
                <h5>Chưa có thành viên nào</h5>
                <p>Hãy thêm thành viên đầu tiên để bắt đầu cộng tác!</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <Plus size={14} />
                  Thêm thành viên đầu tiên
                </button>
              </div>
            ) : (
              <div className="members-grid">
                {members.map((member) => (
                  <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                  <div className="member-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditMember(member)}
                        title="Chỉnh sửa thành viên"
                      >
                        <Edit size={12} />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteMember(member.id)}
                        title="Xóa thành viên"
                      >
                        <Trash2 size={12} />
                    </button>
                    </div>
                  </div>
                ))}
                </div>
            )}
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-secondary">
            <X size={14} />
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={14} />
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddMember}
        onRemoveMember={handleDeleteMember}
        existingMembers={members}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onUpdateMember={handleUpdateMember}
        member={editingMember}
      />

      <style jsx>{`
        .project-settings {
          width: 100%;
          background: #f8fafc;
          min-height: 100vh;
          padding: 20px;
        }

        .settings-header {
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .settings-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #FF5E13, #FF8C42, #FFA463);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .header-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 10px 25px rgba(255, 94, 19, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .header-icon::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          border-radius: 22px;
          z-index: -1;
          opacity: 0.3;
          filter: blur(8px);
        }

        .header-text h3 {
          font-size: 32px;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 12px 0;
          background: linear-gradient(135deg, #FF5E13, #FF8C42, #FFA463);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.025em;
        }

        .header-text p {
          color: #6b7280;
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }

        .project-name {
          color: #FF5E13;
          font-weight: 700;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .settings-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .settings-section {
          margin-bottom: 20px;
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .settings-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FF5E13, #FF8C42, #FFA463);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(255, 94, 19, 0.1);
        }

        .section-header h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          flex: 1;
          letter-spacing: -0.025em;
        }

        .section-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(255, 94, 19, 0.3);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: #f8fafc;
          font-weight: 500;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #FF5E13;
          background: white;
          box-shadow: 
            0 0 0 4px rgba(255, 94, 19, 0.1),
            0 10px 25px rgba(255, 94, 19, 0.15);
          transform: translateY(-2px);
        }

        .form-textarea {
          resize: vertical;
          min-height: 70px;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .checkbox-grid.three-columns {
          grid-template-columns: repeat(3, 1fr);
        }

        .checkbox-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .checkbox-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 94, 19, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .checkbox-card:hover {
          border-color: #FF5E13;
          background: #fff7ed;
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(255, 94, 19, 0.15);
        }

        .checkbox-card:hover::before {
          left: 100%;
        }

        .checkbox-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-title {
          font-weight: 600;
          color: #374151;
          font-size: 13px;
        }

        .checkbox-toggle {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }

        .checkbox-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #cbd5e1, #94a3b8);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 22px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
          box-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        input:checked + .toggle-slider {
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.1),
            0 0 20px rgba(255, 94, 19, 0.3);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(18px);
          box-shadow: 
            0 3px 8px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .members-list {
          margin-top: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 24px;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .empty-state::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 94, 19, 0.05) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }

        .empty-icon {
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .empty-state h5 {
          font-size: 18px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 8px 0;
          position: relative;
          z-index: 1;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0 0 24px 0;
          font-size: 14px;
          position: relative;
          z-index: 1;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .member-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .member-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 94, 19, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .member-card:hover {
          border-color: #FF5E13;
          background: #fff7ed;
          transform: translateY(-6px);
          box-shadow: 0 25px 50px rgba(255, 94, 19, 0.2);
        }

        .member-card:hover::before {
          left: 100%;
        }

        .member-avatar {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          box-shadow: 
            0 4px 16px rgba(255, 94, 19, 0.4),
            0 0 0 2px rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .member-avatar::after {
          content: '';
          position: absolute;
          inset: -3px;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          border-radius: 50%;
          z-index: -1;
          opacity: 0.3;
          filter: blur(8px);
        }

        .member-info {
          flex: 1;
        }

        .member-name {
          font-weight: 700;
          color: #1f2937;
          font-size: 15px;
          margin-bottom: 3px;
        }

        .member-role {
          font-size: 12px;
          color: #FF5E13;
          font-weight: 600;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .member-email {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }

        .member-actions {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          color: white;
          box-shadow: 
            0 8px 25px rgba(255, 94, 19, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 15px 35px rgba(255, 94, 19, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 2px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 
            0 8px 25px rgba(239, 68, 68, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .btn-danger:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-3px);
          box-shadow: 
            0 15px 35px rgba(239, 68, 68, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .btn-sm {
          padding: 6px 10px;
          font-size: 10px;
        }

        .settings-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 2px solid rgba(255, 94, 19, 0.1);
        }

        @media (max-width: 768px) {
          .project-settings {
            padding: 16px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .checkbox-grid {
            grid-template-columns: 1fr;
          }
          
          .members-grid {
            grid-template-columns: 1fr;
          }
          
          .settings-actions {
            flex-direction: column;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};
