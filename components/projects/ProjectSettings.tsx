"use client";

import { useState, useEffect } from "react";
import { Project, ProjectMember } from "@/types/project";
import { Member } from "@/types/member";
import { AddMemberModal } from "./modals/AddMemberModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUser } from "@/hooks/useUser";
import { projectService } from "@/services/projectService";
import { toast } from "react-toastify";
import { PROJECT_STATUS_OPTIONS, getProjectStatusLabel } from "@/constants/status";
import { useMemberInProjectLimitationCheck } from "@/hooks/useLimitationCheck";
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
import "@/app/styles/project-settings.scss";

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
  const { checkMemberInProjectLimit } = useMemberInProjectLimitationCheck();

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

  const handleAddMember = async (member: Member) => {
    // Check member count limitation before adding
    const newMemberCount = members.length + 1;
    if (!checkMemberInProjectLimit(newMemberCount)) {
      return; // Limit exceeded, don't add
    }

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
        toast.success('Member removed successfully!');
      } else {
        toast.error(`Error removing member: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('An error occurred while removing member');
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
      toast.error('Project information not found');
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
        toast.success('Project information updated successfully!');
        
        // Trigger parent component to refetch data
        if (onProjectUpdate) {
          onProjectUpdate();
        }
      } else {
        toast.error(`Error: ${result.error || 'Failed to update project information'}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating project information');
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
            <h4>Basic Information</h4>
            {!isEditingBasicInfo && canEditBasicInfo && (
              <button
                className="btn btn-secondary"
                onClick={handleStartEdit}
              >
                <Edit size={14} />
                Edit
              </button>
            )}
          </div>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                <User size={14} />
                Project Name
              </label>
              <input
                type="text"
                value={isEditingBasicInfo ? tempSettings.name : settings.name}
                onChange={(e) => handleTempInputChange("name", e.target.value)}
                className="form-input"
                placeholder="Enter project name"
                disabled={!isEditingBasicInfo}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <MessageSquare size={14} />
                Description
              </label>
              <textarea
                value={isEditingBasicInfo ? tempSettings.description : settings.description}
                onChange={(e) => handleTempInputChange("description", e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder="Detailed project description"
                disabled={!isEditingBasicInfo}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Shield size={14} />
                Status
              </label>
              <select
                value={isEditingBasicInfo ? tempSettings.status : settings.status}
                onChange={(e) => handleTempInputChange("status", e.target.value)}
                className="form-select"
                disabled={!isEditingBasicInfo}
              >
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={14} />
                Project Owner
              </label>
              <input
                type="text"
                value={isEditingBasicInfo ? tempSettings.manager : settings.manager}
                onChange={(e) => handleTempInputChange("manager", e.target.value)}
                className="form-input"
                placeholder="Manager name"
                disabled={!isEditingBasicInfo}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                Start Date
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
                End Date
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

          {/* Action buttons */}
          {isEditingBasicInfo && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '2px solid #FFF4ED'
            }}>
              <button 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                <X size={14} />
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveBasicInfo}
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Bell size={16} color="white" />
            </div>
          <h4>Notifications</h4>
          </div>
          
          <div className={`checkbox-grid ${Object.keys(settings.notifications).length % 2 === 1 ? 'three-columns' : ''}`}>
            <div className="checkbox-card">
              <div className="checkbox-header">
                <Mail size={16} color="#FF5E13" />
                <span className="checkbox-title">Email Notifications</span>
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
                <span className="checkbox-title">Slack Notifications</span>
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
                <span className="checkbox-title">In-App Notifications</span>
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
            <h4>Project Members ({members.length})</h4>
            {canAddMember && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddMemberModal(true)}
              >
                <Plus size={14} />
                {userRole === 'businessowner' ? 'Add Manager' : 'Add Member'}
              </button>
            )}
          </div>
          <div className="members-list">
            {isLoadingMembers ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Users size={40} color="#9CA3AF" />
                </div>
                <h5>Loading members...</h5>
              </div>
            ) : members.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Users size={40} color="#9CA3AF" />
                </div>
                <h5>No members yet</h5>
                <p>Add your first member to start collaborating!</p>
                {canAddMember && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    <Plus size={14} />
                    {userRole === 'businessowner' ? 'Add First Manager' : 'Add First Member'}
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
                            title="Remove member"
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
        title="Remove Member"
        description={`Are you sure you want to remove ${memberToDelete?.name} from this project? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
};
