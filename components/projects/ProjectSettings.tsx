"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { Member } from "@/types/member";
import { AddMemberModal } from "./modals/AddMemberModal";
import { EditMemberModal } from "./modals/EditMemberModal";
import { AddPMModal } from "./modals/AddPMModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUser } from "@/hooks/useUser";
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
  Paperclip,
  UserCog
} from "lucide-react";

interface ProjectManager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

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
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>(project.projectManagers ?? []);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddPMModal, setShowAddPMModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // Confirm dialog states
  const [isConfirmDeleteMemberOpen, setIsConfirmDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isConfirmDeletePMOpen, setIsConfirmDeletePMOpen] = useState(false);
  const [pmToDelete, setPmToDelete] = useState<{ id: string; name: string } | null>(null);

  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [tempSettings, setTempSettings] = useState<Settings>({...settings});

  // Mock available PMs
  const availableProjectManagers: ProjectManager[] = [
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@company.com' },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@company.com' },
    { id: '3', name: 'Lê Văn C', email: 'levanc@company.com' },
    { id: '4', name: 'Phạm Thị D', email: 'phamthid@company.com' },
    { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@company.com' },
  ];

  // Get user role for permission checks
  const { role } = useUser();
  const userRole = role?.toLowerCase();

  // Permission checks
  const canEditBasicInfo = userRole === 'pm' || userRole === 'businessowner';
  const canAddPM = userRole === 'businessowner';
  const canAddMember = userRole === 'pm';

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
    const member = members.find(m => m.id === memberId);
    if (member) {
      setMemberToDelete({ id: member.id, name: member.name });
      setIsConfirmDeleteMemberOpen(true);
    }
  };

  const confirmDeleteMember = () => {
    if (memberToDelete) {
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      setMemberToDelete(null);
      console.log('Deleted member:', memberToDelete.id);
      // In real app, call API to delete member
    }
  };

  const handleAddPM = (pmIds: string[]) => {
    const newPMs = availableProjectManagers.filter(pm => pmIds.includes(pm.id));
    setProjectManagers(prev => [...prev, ...newPMs]);
    setShowAddPMModal(false);
  };

  const handleRemovePM = (pmId: string) => {
    const pm = projectManagers.find(p => p.id === pmId);
    if (pm) {
      setPmToDelete({ id: pm.id, name: pm.name });
      setIsConfirmDeletePMOpen(true);
    }
  };

  const confirmDeletePM = () => {
    if (pmToDelete) {
      setProjectManagers(prev => prev.filter(pm => pm.id !== pmToDelete.id));
      setPmToDelete(null);
      console.log('Deleted PM:', pmToDelete.id);
      // In real app, call API to remove PM
    }
  };

  const handleStartEdit = () => {
    setTempSettings({...settings});
    setIsEditingBasicInfo(true);
  };

  const handleCancelEdit = () => {
    setTempSettings({...settings});
    setIsEditingBasicInfo(false);
  };

  const handleSaveBasicInfo = () => {
    setSettings(tempSettings);
    setIsEditingBasicInfo(false);
    console.log("Saving basic info:", tempSettings);
    // TODO: Call API to save
  };

  const handleTempInputChange = (field: string, value: any) => {
    setTempSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            {!isEditingBasicInfo && canEditBasicInfo && (
              <button
                className="btn btn-secondary"
                onClick={handleStartEdit}
              >
                <Edit size={14} />
                Chỉnh sửa
              </button>
            )}
          </div>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                <User size={14} />
                Tên dự án
              </label>
              <input
                type="text"
                value={isEditingBasicInfo ? tempSettings.name : settings.name}
                onChange={(e) => handleTempInputChange("name", e.target.value)}
                className="form-input"
                placeholder="Nhập tên dự án"
                disabled={!isEditingBasicInfo}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <MessageSquare size={14} />
                Mô tả
              </label>
              <textarea
                value={isEditingBasicInfo ? tempSettings.description : settings.description}
                onChange={(e) => handleTempInputChange("description", e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder="Mô tả chi tiết về dự án"
                disabled={!isEditingBasicInfo}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Shield size={14} />
                Trạng thái
              </label>
              <select
                value={isEditingBasicInfo ? tempSettings.status : settings.status}
                onChange={(e) => handleTempInputChange("status", e.target.value)}
                className="form-select"
                disabled={!isEditingBasicInfo}
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
                value={isEditingBasicInfo ? tempSettings.manager : settings.manager}
                onChange={(e) => handleTempInputChange("manager", e.target.value)}
                className="form-input"
                placeholder="Tên người quản lý"
                disabled={!isEditingBasicInfo}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={isEditingBasicInfo ? tempSettings.startDate : settings.startDate}
                onChange={(e) => handleTempInputChange("startDate", e.target.value)}
                className="form-input"
                disabled={!isEditingBasicInfo}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={isEditingBasicInfo ? tempSettings.endDate : settings.endDate}
                onChange={(e) => handleTempInputChange("endDate", e.target.value)}
                className="form-input"
                disabled={!isEditingBasicInfo}
              />
            </div>
          </div>

          {/* Action buttons inside Basic Info card */}
          {isEditingBasicInfo && (
            <div className="card-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                <X size={14} />
                Hủy
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveBasicInfo}
              >
                <Save size={14} />
                Lưu thay đổi
              </button>
            </div>
          )}
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
              <UserCog size={16} color="white" />
            </div>
            <h4>Project Managers ({projectManagers.length})</h4>
            {canAddPM && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddPMModal(true)}
              >
                <Plus size={14} />
                Thêm PM
              </button>
            )}
          </div>
          <div className="members-list">
            {projectManagers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <UserCog size={40} color="#9CA3AF" />
                </div>
                <h5>Chưa có Project Manager nào</h5>
                <p>Thêm Project Manager để quản lý dự án hiệu quả hơn!</p>
                {canAddPM && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddPMModal(true)}
                  >
                    <Plus size={14} />
                    Thêm PM đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="members-grid">
                {projectManagers.map((pm) => (
                  <div key={pm.id} className="member-card pm-card">
                    <div className="pm-badge">PM</div>
                    <div className="member-avatar">{pm.name.charAt(0)}</div>
                    <div className="member-info">
                      <div className="member-name">{pm.name}</div>
                      <div className="member-role">Project Manager</div>
                      <div className="member-email">{pm.email}</div>
                    </div>
                    {canAddPM && (
                      <div className="member-actions">
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemovePM(pm.id)}
                          title="Xóa PM"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Users size={16} color="white" />
            </div>
            <h4>Thành viên dự án ({members.length})</h4>
            {canAddMember && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddMemberModal(true)}
              >
                <Plus size={14} />
                Thêm thành viên
              </button>
            )}
          </div>
          <div className="members-list">
            {members.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Users size={40} color="#9CA3AF" />
                </div>
                <h5>Chưa có thành viên nào</h5>
                <p>Hãy thêm thành viên đầu tiên để bắt đầu cộng tác!</p>
                {canAddMember && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    <Plus size={14} />
                    Thêm thành viên đầu tiên
                  </button>
                )}
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
                  {canAddMember && (
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
                  )}
                  </div>
                ))}
                </div>
            )}
          </div>
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

      {/* Add PM Modal */}
      <AddPMModal
        isOpen={showAddPMModal}
        onClose={() => setShowAddPMModal(false)}
        onAdd={handleAddPM}
        availableManagers={availableProjectManagers.filter(
          pm => !projectManagers.some(existing => existing.id === pm.id)
        )}
        currentManagers={projectManagers}
      />

      {/* Confirm Delete Member Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteMemberOpen}
        onClose={() => {
          setIsConfirmDeleteMemberOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={confirmDeleteMember}
        title="Xóa thành viên"
        description={`Bạn có chắc chắn muốn xóa thành viên ${memberToDelete?.name} khỏi dự án này không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />

      {/* Confirm Delete PM Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeletePMOpen}
        onClose={() => {
          setIsConfirmDeletePMOpen(false);
          setPmToDelete(null);
        }}
        onConfirm={confirmDeletePM}
        title="Xóa Project Manager"
        description={`Bạn có chắc chắn muốn xóa Project Manager ${pmToDelete?.name} khỏi dự án này không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />

      <style jsx>{`
        .project-settings {
          width: 100%;
          background: #FAFAFA;
          min-height: 100vh;
          padding: 20px;
        }

        .settings-content {
          max-width: 1100px;
          margin: 0 auto;
        }

        .settings-section {
          margin-bottom: 20px;
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 1px solid #E5E7EB;
          transition: box-shadow 0.2s ease;
        }

        .settings-section:hover {
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.08);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #FFF4ED;
        }

        .section-header h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1F2937;
          margin: 0;
          flex: 1;
        }

        .section-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(255, 94, 19, 0.25);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
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
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #E5E7EB;
          border-radius: 7px;
          font-size: 13px;
          transition: all 0.2s ease;
          background: white;
          font-weight: 500;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #FF5E13;
          box-shadow: 0 0 0 3px rgba(255, 94, 19, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 70px;
        }

        .form-input:disabled,
        .form-textarea:disabled,
        .form-select:disabled {
          background: #F9FAFB;
          color: #6B7280;
          cursor: not-allowed;
          border-color: #E5E7EB;
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
          background: #FAFBFC;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .checkbox-card:hover {
          border-color: #FFD4B8;
          background: #FFF4ED;
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
          background: #CBD5E1;
          transition: all 0.3s ease;
          border-radius: 22px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background: white;
          transition: all 0.3s ease;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input:checked + .toggle-slider {
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(18px);
        }

        .members-list {
          margin-top: 12px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          background: #F9FAFB;
          border: 2px dashed #D1D5DB;
          border-radius: 10px;
        }

        .empty-icon {
          margin-bottom: 12px;
          color: #9CA3AF;
        }

        .empty-state h5 {
          font-size: 16px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 6px 0;
        }

        .empty-state p {
          color: #6B7280;
          margin: 0 0 20px 0;
          font-size: 13px;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .member-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .member-card:hover {
          border-color: #FFD4B8;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.1);
        }

        .pm-card {
          border-color: #FFE8D9;
          background: linear-gradient(135deg, #FFFBF8 0%, #FFFFFF 100%);
        }

        .pm-card:hover {
          border-color: #FF5E13;
        }

        .pm-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          color: white;
          padding: 3px 10px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 6px rgba(255, 94, 19, 0.25);
        }

        .member-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(255, 94, 19, 0.25);
        }

        .member-info {
          flex: 1;
          min-width: 0;
        }

        .member-name {
          font-weight: 700;
          color: #1F2937;
          font-size: 14px;
          margin-bottom: 3px;
        }

        .member-role {
          font-size: 11px;
          color: #FF5E13;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .member-email {
          font-size: 11px;
          color: #6B7280;
          font-weight: 500;
        }

        .member-actions {
          display: flex;
          gap: 6px;
        }

        .btn {
          padding: 8px 14px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          color: white;
          box-shadow: 0 2px 6px rgba(255, 94, 19, 0.25);
        }

        .btn-primary:hover {
          box-shadow: 0 4px 10px rgba(255, 94, 19, 0.35);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #F3F4F6;
          color: #4B5563;
          border: 2px solid #E5E7EB;
        }

        .btn-secondary:hover {
          background: #E5E7EB;
        }

        .btn-danger {
          background: #EF4444;
          color: white;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
        }

        .btn-danger:hover {
          background: #DC2626;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.35);
        }

        .btn-sm {
          padding: 6px 10px;
          font-size: 11px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 2px solid #FFF4ED;
        }

        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .checkbox-grid {
            grid-template-columns: 1fr;
          }
          
          .members-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .project-settings {
            padding: 16px;
          }
          
          .settings-section {
            padding: 16px;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
