"use client";

import { useState, useEffect } from "react";
import { Project, ProjectMember } from "@/types/project";
import { Member } from "@/types/member";
import { AddMemberModal } from "./modals/AddMemberModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUser } from "@/hooks/useUser";
import { projectService } from "@/services/projectService";
import { toast } from "react-toastify";
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
  availableProjectManagers?: ProjectManager[];
  onProjectUpdate?: () => void;
}

export const ProjectSettings = ({ project, availableProjectManagers = [], onProjectUpdate }: ProjectSettingsProps) => {
  // Helper function to format ISO date to YYYY-MM-DD
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

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
    startDate: formatDateForInput(project.startDate),
    endDate: formatDateForInput(project.endDate),
    manager: project.owner?.fullName || project.createdBy?.fullName || '',
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

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  // Confirm dialog states
  const [isConfirmDeleteMemberOpen, setIsConfirmDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);

  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [tempSettings, setTempSettings] = useState<Settings>({...settings});

  // Get user role for permission checks
  const { role } = useUser();
  const userRole = role?.toLowerCase();

  // Permission checks
  const canEditBasicInfo = userRole === 'projectmanager' || userRole === 'businessowner';
  const canAddPM = userRole === 'businessowner';
  const canAddMember = userRole === 'projectmanager' || userRole === 'businessowner';

  // Fetch project members from API
  useEffect(() => {
    const fetchMembers = async () => {
      if (!project.id) return;
      
      setIsLoadingMembers(true);
      try {
        const result = await projectService.getProjectMembers(project.id);
        console.log('ProjectSettings - Fetched members:', result);
        
        if (result.success && result.data) {
          // Transform ProjectMember[] to Member[]
          // API returns: { id, projectId, userId, member: { id, fullName, email, role, ... }, joinedAt, leftAt }
          const transformedMembers: Member[] = result.data
            .filter((pm: any) => pm.member) // Only include items with member data
            .map((pm: any) => ({
              id: pm.member.id,
              pmId: pm.id, // Store ProjectMember ID for deletion
              name: pm.member.fullName || 'Unknown',
              email: pm.member.email || '',
              role: pm.member.role || 'Member',
              avatar: (pm.member.fullName || 'U').charAt(0).toUpperCase()
            }));
          
          console.log('ProjectSettings - Transformed members:', transformedMembers);
          setMembers(transformedMembers);
        }
      } catch (error) {
        console.error('Error fetching project members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [project.id]);

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

  const handleAddMember = async (member: Member) => {
    setShowAddMemberModal(false);
    
    // Re-fetch members from API to get latest data
    try {
      const result = await projectService.getProjectMembers(project.id);
      if (result.success && result.data) {
        const transformedMembers: Member[] = result.data
          .filter((pm: any) => pm.member)
          .map((pm: any) => ({
            id: pm.member.id,
            name: pm.member.fullName || 'Unknown',
            email: pm.member.email || '',
            role: pm.member.role || 'Member',
            avatar: (pm.member.fullName || 'U').charAt(0).toUpperCase()
          }));
        setMembers(transformedMembers);
      }
    } catch (error) {
      console.error('Error refreshing members:', error);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setMemberToDelete({ id: member.pmId || member.id, name: member.name });
      setIsConfirmDeleteMemberOpen(true);
    }
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      // Call API to remove project member
      const result = await projectService.removeProjectMember(memberToDelete.id);
      
      if (result.success) {
        // Remove from UI on success
        setMembers((prev) => prev.filter((m) => (m.pmId || m.id) !== memberToDelete.id));
        console.log('Successfully deleted member:', memberToDelete.name);
        toast.success('Đã xóa thành viên thành công!');
      } else {
        console.error('Failed to delete member:', result.error);
        toast.error(`Lỗi khi xóa thành viên: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Đã xảy ra lỗi khi xóa thành viên');
    } finally {
      setMemberToDelete(null);
      setIsConfirmDeleteMemberOpen(false);
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

  const handleSaveBasicInfo = async () => {
    if (!project.id) {
      toast.error('Không tìm thấy thông tin dự án');
      return;
    }

    try {
      console.log('[ProjectSettings] Saving basic info:', tempSettings);
      
      const updateData = {
        id: project.id,
        name: tempSettings.name,
        description: tempSettings.description,
        status: tempSettings.status,
        startDate: tempSettings.startDate || undefined,
        endDate: tempSettings.endDate || undefined
      };

      const result = await projectService.updateProject(updateData);
      
      if (result.success && result.data) {
        console.log('[ProjectSettings] Project updated successfully:', result.data);
        setSettings(tempSettings);
        setIsEditingBasicInfo(false);
        toast.success('Cập nhật thông tin dự án thành công!');
        
        // Trigger parent component to refetch data
        if (onProjectUpdate) {
          onProjectUpdate();
        }
      } else {
        console.error('[ProjectSettings] Failed to update project:', result.error);
        toast.error(`Lỗi: ${result.error || 'Không thể cập nhật thông tin dự án'}`);
      }
    } catch (error) {
      console.error('[ProjectSettings] Error updating project:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin dự án');
    }
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
                <option value="Lập kế hoạch">Lập kế hoạch</option>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Tạm dừng">Tạm dừng</option>
                <option value="Hoàn thành">Hoàn thành</option>
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
              <Users size={16} color="white" />
            </div>
            <h4>Thành viên dự án ({members.length})</h4>
            {canAddMember && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddMemberModal(true)}
              >
                <Plus size={14} />
                {userRole === 'businessowner' ? 'Thêm người quản lý' : 'Thêm thành viên'}
              </button>
            )}
          </div>
          <div className="members-list">
            {isLoadingMembers ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Users size={40} color="#9CA3AF" />
                </div>
                <h5>Đang tải thành viên...</h5>
              </div>
            ) : members.length === 0 ? (
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
                    {userRole === 'businessowner' ? 'Thêm người quản lý đầu tiên' : 'Thêm thành viên đầu tiên'}
                  </button>
                )}
              </div>
            ) : (
              <div className="members-grid">
                {members
                  .sort((a, b) => {
                    // Sort by role: ProjectManager first, then Member
                    const roleA = a.role?.toLowerCase() || '';
                    const roleB = b.role?.toLowerCase() || '';
                    
                    if (roleA === 'projectmanager' && roleB !== 'projectmanager') return -1;
                    if (roleA !== 'projectmanager' && roleB === 'projectmanager') return 1;
                    
                    // If same role, sort by name A-Z
                    return (a.name || '').localeCompare(b.name || '');
                  })
                  .map((member) => (
                    <div key={member.id} className="member-card">
                      <div className="member-avatar">{member.avatar}</div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                        <div className="member-email">{member.email}</div>
                      </div>
                      {canAddMember && (userRole === 'businessowner' || member.role?.toLowerCase() === 'member') && (
                        <div className="member-actions">
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
        projectId={project.id}
        ownerId={project.ownerId || project.owner?.userId || ''}
        userRole={userRole}
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
