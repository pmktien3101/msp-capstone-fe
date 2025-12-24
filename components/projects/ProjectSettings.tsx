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
  PROJECT_STATUS_OPTIONS,
  getProjectStatusLabel,
  ProjectStatus,
} from "@/constants/status";
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
  UserCog,
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

export const ProjectSettings = ({
  project,
  availableProjectManagers = [],
  onProjectUpdate,
}: ProjectSettingsProps) => {
  const { checkMemberInProjectLimit } = useMemberInProjectLimitationCheck();

  // Helper function to format date for display (dd/MM/yyyy)
  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Helper function to convert dd/MM/yyyy back to yyyy-MM-dd for date input
  const convertDisplayToInput = (displayDate: string) => {
    if (!displayDate) return "";
    const [day, month, year] = displayDate.split("/");
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
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
    startDate: formatDateForDisplay(project.startDate),
    endDate: formatDateForDisplay(project.endDate),
    manager: project.owner?.fullName || project.createdBy?.fullName || "",
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
  const [formerMembers, setFormerMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Confirm dialog states
  const [isConfirmDeleteMemberOpen, setIsConfirmDeleteMemberOpen] =
    useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [tempSettings, setTempSettings] = useState<Settings>({ ...settings });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  // Get user role for permission checks
  const { role } = useUser();
  const userRole = role?.toLowerCase();

  // Check if project is completed, on hold, or cancelled
  const isProjectDisabled =
    settings.status === ProjectStatus.Completed ||
    settings.status === ProjectStatus.OnHold ||
    settings.status === ProjectStatus.Cancelled;

  // Permission checks
  const canEditBasicInfo =
    (userRole === "projectmanager" || userRole === "businessowner") &&
    !isProjectDisabled;
  const canAddPM = userRole === "businessowner" && !isProjectDisabled;
  const canAddMember =
    (userRole === "projectmanager" || userRole === "businessowner") &&
    !isProjectDisabled;

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
          
          // Separate active and former members
          const activeMembers: Member[] = [];
          const formerMembersList: Member[] = [];

          result.data
            .filter((pm: any) => pm.member) // Only include items with member data
            .forEach((pm: any) => {
              const memberData = {
                id: pm.member.id,
                pmId: pm.id, // Store ProjectMember ID for deletion
                name: pm.member.fullName || "Unknown",
                email: pm.member.email || "",
                role: pm.member.role || "Member",
                avatar: (pm.member.fullName || "U").charAt(0).toUpperCase(),
                avatarUrl: pm.member.avatarUrl || null,
                leftAt: pm.leftAt, // Store leftAt date
              };

              // If leftAt exists, member has left the project
              if (pm.leftAt) {
                formerMembersList.push(memberData);
              } else {
                activeMembers.push(memberData);
              }
            });

          setMembers(activeMembers);
          setFormerMembers(formerMembersList);
        }
      } catch (error) {
        console.error("Error fetching project members:", error);
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

  // Helper function to refresh members list from API
  const refreshMembersList = async () => {
    try {
      const result = await projectService.getProjectMembers(project.id);
      if (result.success && result.data) {
        const activeMembers: Member[] = [];
        const formerMembersList: Member[] = [];

        result.data
          .filter((pm: any) => pm.member)
          .forEach((pm: any) => {
            const memberData = {
              id: pm.member.id,
              pmId: pm.id,
              name: pm.member.fullName || "Unknown",
              email: pm.member.email || "",
              role: pm.member.role || "Member",
              avatar: (pm.member.fullName || "U").charAt(0).toUpperCase(),
              avatarUrl: pm.member.avatarUrl || null,
              leftAt: pm.leftAt,
            };

            if (pm.leftAt) {
              formerMembersList.push(memberData);
            } else {
              activeMembers.push(memberData);
            }
          });

        setMembers(activeMembers);
        setFormerMembers(formerMembersList);
      }
    } catch (error) {
      console.error("Error refreshing members:", error);
    }
  };

  const handleAddMember = async (member: Member) => {
    // Check member count limitation before adding
    const newMemberCount = members.length + 1;
    if (!checkMemberInProjectLimit(newMemberCount)) {
      return; // Limit exceeded, don't add
    }

    // Don't close modal here - let user add multiple members
    // setShowAddMemberModal(false);

    // Re-fetch members from API to get latest data
    await refreshMembersList();
    
    // Trigger project header refresh
    if (onProjectUpdate) {
      onProjectUpdate();
    }
  };

  const handleDeleteMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setMemberToDelete({ id: member.pmId || member.id, name: member.name });
      setIsConfirmDeleteMemberOpen(true);
    }
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      // Call API to remove project member
      const result = await projectService.removeProjectMember(
        memberToDelete.id
      );

      if (result.success) {
        // Re-fetch members from API to get updated data (moved to Former Members)
        await refreshMembersList();
        
        // Trigger project header refresh
        if (onProjectUpdate) {
          onProjectUpdate();
        }
        
        toast.success("Member removed successfully!");
      } else {
        toast.error(
          `Error removing member: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error("An error occurred while removing member");
    } finally {
      setMemberToDelete(null);
      setIsConfirmDeleteMemberOpen(false);
    }
  };

  const handleStartEdit = () => {
    setTempSettings({ ...settings });
    setValidationErrors({ name: "", startDate: "", endDate: "" });
    setIsEditingBasicInfo(true);
  };

  const handleCancelEdit = () => {
    setTempSettings({ ...settings });
    setValidationErrors({ name: "", startDate: "", endDate: "" });
    setIsEditingBasicInfo(false);
  };

  const handleSaveBasicInfo = async () => {
    if (!project.id) {
      toast.error("Project information not found");
      return;
    }

    // Clear previous errors
    setValidationErrors({ name: "", startDate: "", endDate: "" });

    // Validate name
    if (!tempSettings.name || !tempSettings.name.trim()) {
      setValidationErrors(prev => ({ ...prev, name: "Project name is required" }));
      return;
    }

    if (tempSettings.name.trim().length < 3) {
      setValidationErrors(prev => ({ ...prev, name: "Project name must be at least 3 characters" }));
      return;
    }

    // Validate dates
    if (!tempSettings.startDate) {
      setValidationErrors(prev => ({ ...prev, startDate: "Start date is required" }));
      return;
    }

    if (!tempSettings.endDate) {
      setValidationErrors(prev => ({ ...prev, endDate: "End date is required" }));
      return;
    }

    // Convert dates to compare
    const convertToDate = (dateStr: string) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split("/");
      return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const startDate = convertToDate(tempSettings.startDate);
    const endDate = convertToDate(tempSettings.endDate);

    if (startDate && endDate && endDate < startDate) {
      setValidationErrors(prev => ({ ...prev, endDate: "End date must be after or equal to start date" }));
      return;
    }

    try {
      // Convert date from display format (dd/MM/yyyy) to ISO format
      const convertToISO = (dateStr: string) => {
        if (!dateStr) return undefined;
        try {
          const [day, month, year] = dateStr.split("/");
          return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
          ).toISOString();
        } catch {
          return undefined;
        }
      };

      const updateData = {
        id: project.id,
        name: tempSettings.name.trim(),
        description: tempSettings.description,
        status: tempSettings.status,
        startDate: convertToISO(tempSettings.startDate),
        endDate: convertToISO(tempSettings.endDate),
      };

      const result = await projectService.updateProject(updateData);

      if (result.success && result.data) {
        console.log(
          "[ProjectSettings] Project updated successfully:",
          result.data
        );
        setSettings(tempSettings);
        setValidationErrors({ name: "", startDate: "", endDate: "" });
        setIsEditingBasicInfo(false);
        toast.success("Project information updated successfully!");

        // Trigger parent component to refetch data
        if (onProjectUpdate) {
          onProjectUpdate();
        }
      } else {
        toast.error(
          `Error: ${result.error || "Unable to update project information"}`
        );
      }
    } catch (error) {
      toast.error("An error occurred while updating project information");
    }
  };

  const handleTempInputChange = (field: string, value: any) => {
    setTempSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for the field being edited
    if (field === "name" || field === "startDate" || field === "endDate") {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Real-time validation for dates
    if (field === "startDate" || field === "endDate") {
      const convertToDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/");
        return new Date(Number(year), Number(month) - 1, Number(day));
      };

      const startDate = field === "startDate" ? convertToDate(value) : convertToDate(tempSettings.startDate);
      const endDate = field === "endDate" ? convertToDate(value) : convertToDate(tempSettings.endDate);

      if (startDate && endDate && endDate < startDate) {
        setValidationErrors(prev => ({ 
          ...prev, 
          endDate: "End date must be after or equal to start date" 
        }));
      } else {
        setValidationErrors(prev => ({ ...prev, endDate: "" }));
      }
    }
  };

  return (
    <div className="project-settings">
      <div className="settings-content">
        {isProjectDisabled && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              color: "#92400E",
            }}
          >
            <Shield size={18} />
            <span>
              This project is not active. Editing project information and managing members is disabled.
            </span>
          </div>
        )}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-icon">
              <Settings size={16} color="white" />
            </div>
            <h4>Basic Information</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!isEditingBasicInfo &&
                (userRole === "projectmanager" ||
                  userRole === "businessowner") && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={settings.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const updateData = {
                              id: project.id,
                              name: settings.name,
                              description: settings.description,
                              status: newStatus,
                              startDate: settings.startDate ? new Date(settings.startDate.split('/').reverse().join('-')).toISOString() : undefined,
                              endDate: settings.endDate ? new Date(settings.endDate.split('/').reverse().join('-')).toISOString() : undefined,
                            };
                            
                            const result = await projectService.updateProject(updateData);
                            
                            if (result.success) {
                              setSettings(prev => ({ ...prev, status: newStatus }));
                              toast.success('Project status updated!');
                              if (onProjectUpdate) onProjectUpdate();
                            } else {
                              toast.error(result.error || 'Failed to update status');
                            }
                          } catch (error) {
                            toast.error('Error updating status');
                          }
                        }}
                        className="form-select"
                        style={{
                          padding: '6px 32px 6px 10px',
                          fontSize: '13px',
                          borderRadius: '6px',
                          border: '1.5px solid #e5e7eb',
                          cursor: 'pointer',
                          minWidth: '140px',
                          fontWeight: 500
                        }}
                      >
                        {PROJECT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={handleStartEdit}
                      disabled={isProjectDisabled}
                      title={
                        isProjectDisabled
                          ? "Cannot edit inactive project information"
                          : ""
                      }
                      style={
                        isProjectDisabled
                          ? {
                              opacity: 0.5,
                              cursor: "not-allowed",
                            }
                          : {}
                      }
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  </>
                )}
            </div>
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
                className={`form-input ${validationErrors.name ? "error" : ""}`}
                placeholder="Enter project name"
                disabled={!isEditingBasicInfo}
              />
              {validationErrors.name && (
                <span className="error-text">{validationErrors.name}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <MessageSquare size={14} />
                Description
              </label>
              <textarea
                value={
                  isEditingBasicInfo
                    ? tempSettings.description
                    : settings.description
                }
                onChange={(e) =>
                  handleTempInputChange("description", e.target.value)
                }
                className="form-textarea"
                rows={3}
                placeholder="Detailed project description"
                disabled={!isEditingBasicInfo}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                Start Date
              </label>
              {isEditingBasicInfo ? (
                <>
                  <input
                    type="date"
                    value={convertDisplayToInput(tempSettings.startDate)}
                    onChange={(e) =>
                      handleTempInputChange(
                        "startDate",
                        formatDateForDisplay(e.target.value)
                      )
                    }
                    className={`form-input ${validationErrors.startDate ? "error" : ""}`}
                  />
                  {validationErrors.startDate && (
                    <span className="error-text">{validationErrors.startDate}</span>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={settings.startDate}
                  className="form-input"
                  disabled
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                End Date
              </label>
              {isEditingBasicInfo ? (
                <>
                  <input
                    type="date"
                    value={convertDisplayToInput(tempSettings.endDate)}
                    onChange={(e) =>
                      handleTempInputChange(
                        "endDate",
                        formatDateForDisplay(e.target.value)
                      )
                    }
                    className={`form-input ${validationErrors.endDate ? "error" : ""}`}
                  />
                  {validationErrors.endDate && (
                    <span className="error-text">{validationErrors.endDate}</span>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={settings.endDate}
                  className="form-input"
                  disabled
                />
              )}
            </div>
          </div>

          {/* Action buttons */}
          {isEditingBasicInfo && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "2px solid #FFF4ED",
              }}
            >
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                <X size={14} />
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveBasicInfo}>
                <Save size={14} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* <div className="settings-section">
          <div className="settings-section-header">
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
        </div> */}

        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-icon">
              <Users size={16} color="white" />
            </div>
            <h4>Project Members ({members.length})</h4>
            {(userRole === "projectmanager" ||
              userRole === "businessowner") && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddMemberModal(true)}
                disabled={isProjectDisabled}
                title={
                  isProjectDisabled
                    ? "Cannot add members to inactive project"
                    : ""
                }
                style={
                  isProjectDisabled
                    ? {
                        opacity: 0.5,
                        cursor: "not-allowed",
                      }
                    : {}
                }
              >
                <Plus size={14} />
                {userRole === "businessowner" ? "Add Manager" : "Add Member"}
              </button>
            )}
          </div>
          <div className="members-list-settings">
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
                {(userRole === "projectmanager" ||
                  userRole === "businessowner") && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddMemberModal(true)}
                    disabled={isProjectDisabled}
                    title={
                      isProjectDisabled
                        ? "Cannot add members to inactive project"
                        : ""
                    }
                    style={
                      isProjectDisabled
                        ? {
                            opacity: 0.5,
                            cursor: "not-allowed",
                          }
                        : {}
                    }
                  >
                    <Plus size={14} />
                    {userRole === "businessowner"
                      ? "Add First Manager"
                      : "Add First Member"}
                  </button>
                )}
              </div>
            ) : (
              <div className="members-grid-settings">
                {members
                  .sort((a, b) => {
                    // Sort by role: ProjectManager first, then Member
                    const roleA = a.role?.toLowerCase() || "";
                    const roleB = b.role?.toLowerCase() || "";

                    if (
                      roleA === "projectmanager" &&
                      roleB !== "projectmanager"
                    )
                      return -1;
                    if (
                      roleA !== "projectmanager" &&
                      roleB === "projectmanager"
                    )
                      return 1;

                    // If same role, sort by name A-Z
                    return (a.name || "").localeCompare(b.name || "");
                  })
                  .map((member) => (
                    <div key={member.id} className="member-card">
                      <div className="member-avatar">
                        {(member as any).avatarUrl ? (
                          <img
                            src={(member as any).avatarUrl}
                            alt={member.name}
                          />
                        ) : (
                          member.avatar
                        )}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                        <div className="member-email">{member.email}</div>
                      </div>
                      {!isProjectDisabled &&
                        canAddMember &&
                        (userRole === "businessowner" ||
                          member.role?.toLowerCase() === "member") && (
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

        {/* Former Members Section */}
        {formerMembers.length > 0 && (
          <div className="settings-section former-members-section">
            <div className="settings-section-header">
              <div className="section-icon">
                <Users size={16} color="white" />
              </div>
              <h4>Former Members ({formerMembers.length})</h4>
            </div>
            <div className="members-list-settings">
              <div className="members-grid-settings">
                {formerMembers
                  .sort((a, b) => {
                    // Sort by leftAt date (most recent first)
                    const dateA = (a as any).leftAt ? new Date((a as any).leftAt).getTime() : 0;
                    const dateB = (b as any).leftAt ? new Date((b as any).leftAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map((member) => (
                    <div key={member.id} className="member-card former-member-card">
                      <div className="member-avatar">
                        {(member as any).avatarUrl ? (
                          <img
                            src={(member as any).avatarUrl}
                            alt={member.name}
                          />
                        ) : (
                          member.avatar
                        )}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                        <div className="member-email">{member.email}</div>
                        {(member as any).leftAt && (
                          <div className="left-date">
                            <Calendar size={12} />
                            Left: {formatDateForDisplay((member as any).leftAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddMember}
        onRemoveMember={handleDeleteMember}
        existingMembers={members}
        projectId={project.id}
        ownerId={project.ownerId || project.owner?.userId || ""}
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
