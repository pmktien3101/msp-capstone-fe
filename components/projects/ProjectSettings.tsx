"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { Member } from "@/types/member";
import { AddMemberModal } from "./modals/AddMemberModal";
import { EditMemberModal } from "./modals/EditMemberModal";
import { Plus, Edit, Trash2 } from "lucide-react";

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
      <div className="settings-header">
        <h3>Cài Đặt Dự Án</h3>
        <p>Quản lý cài đặt và cấu hình cho dự án {project.name}</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h4>Thông tin cơ bản</h4>
          <div className="form-group">
            <label>Tên dự án</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              value={settings.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Trạng thái</label>
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
              <label>Quản lý dự án</label>
              <input
                type="text"
                value={settings.manager}
                onChange={(e) => handleInputChange("manager", e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>
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
          <h4>Thông báo</h4>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) =>
                  handleNestedChange("notifications", "email", e.target.checked)
                }
              />
              <span>Email thông báo</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={settings.notifications.slack}
                onChange={(e) =>
                  handleNestedChange("notifications", "slack", e.target.checked)
                }
              />
              <span>Slack thông báo</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={settings.notifications.inApp}
                onChange={(e) =>
                  handleNestedChange("notifications", "inApp", e.target.checked)
                }
              />
              <span>Thông báo trong ứng dụng</span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h4>Quyền truy cập</h4>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={settings.permissions.public}
                onChange={(e) =>
                  handleNestedChange("permissions", "public", e.target.checked)
                }
              />
              <span>Dự án công khai</span>
            </label>

            <label className="checkbox-item">
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
              <span>Chỉ thành viên</span>
            </label>

            <label className="checkbox-item">
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
              <span>Cho phép bình luận</span>
            </label>

            <label className="checkbox-item">
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
              <span>Cho phép đính kèm</span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h4>Thành viên dự án ({members.length})</h4>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddMemberModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Plus size={16} />
              Thêm thành viên
            </button>
          </div>
          <div className="members-list">
            {members.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                <p style={{ margin: 0 }}>Chưa có thành viên nào</p>
                <p style={{ margin: "8px 0 0 0" }}>
                  Hãy thêm thành viên đầu tiên!
                </p>
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="member-item">
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
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Edit size={12} />
                      Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteMember(member.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Trash2 size={12} />
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-secondary">Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddMember}
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
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h3 {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .settings-header p {
          color: #6b7280;
          margin: 0;
        }

        .settings-content {
          max-width: 600px;
        }

        .settings-section {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .settings-section:last-child {
          border-bottom: none;
        }

        .settings-section h4 {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 16px 0;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #ff5e13;
          box-shadow: 0 0 0 3px rgba(255, 94, 19, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #ff5e13;
        }

        .members-list {
          margin-bottom: 16px;
        }

        .member-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .member-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(251, 146, 60, 0.3);
        }

        .member-info {
          flex: 1;
        }

        .member-name {
          font-weight: 500;
          color: #374151;
        }

        .member-role {
          font-size: 12px;
          color: #6b7280;
        }

        .member-email {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .member-actions {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: transparent;
          color: #ff5e13;
          border: 1px solid #ff5e13;
        }

        .btn-primary:hover {
          background: #ff5e13;
          color: white;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }

        .settings-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};
