"use client";

import { CheckCircle2, CircleAlertIcon, Plus, Search, SearchIcon, Trash2, User, UserPenIcon, UserStarIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import "../../../../../styles/businessMembers.scss";
import { userService } from "@/services/userService";
import { GetUserResponse } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

const MembersRolesPage = () => {
  const { user } = useAuth();
  
  // States
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [memberToEditRole, setMemberToEditRole] = useState<GetUserResponse | null>(null);
  const [members, setMembers] = useState<GetUserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [updatingRole, setUpdatingRole] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "Member" | "ProjectManager">("all");
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "requests" | "invites">("members");
  const [joinRequests, setJoinRequests] = useState<GetUserResponse[]>([]);
  const [sentInvites, setSentInvites] = useState<string[]>([]);

  // Filtered members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Fetch members
  const fetchMembers = async () => {
    if (!user?.userId) {
      setError("Không tìm thấy thông tin người dùng");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");
    
    const result = await userService.getMembersByBO(user.userId);
    
    if (result.success && result.data) {
      setMembers(result.data);
    } else {
      setError(result.error || "Không thể tải danh sách");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [user?.userId]);

  // Handlers
  const handleDeleteMember = (memberId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      setMembers(members.filter((member) => member.id !== memberId));
      toast.success("Đã xóa thành viên");
    }
  };

  const handleEditRole = (member: GetUserResponse) => {
    setMemberToEditRole(member);
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!memberToEditRole || !user?.userId) {
      toast.error("Thiếu thông tin cần thiết");
      return;
    }

    const originalMember = members.find(m => m.id === memberToEditRole.id);
    if (originalMember?.roleName === memberToEditRole.roleName) {
      toast.info("Vai trò không có thay đổi");
      setShowEditRoleModal(false);
      return;
    }

    setUpdatingRole(true);

    try {
      const result = await userService.reassignRole(
        user.userId,
        memberToEditRole.id,
        memberToEditRole.roleName
      );

      if (result.success && result.data) {
        setMembers(
          members.map((m) =>
            m.id === result.data!.userId
              ? { ...m, roleName: result.data!.newRole as "Member" | "ProjectManager" }
              : m
          )
        );

        toast.success(`Đã cập nhật vai trò thành ${result.data.newRole}`);
        setShowEditRoleModal(false);
        setMemberToEditRole(null);
      } else {
        toast.error(result.error || "Không thể cập nhật vai trò");
      }
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Lỗi khi cập nhật vai trò");
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleInviteInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inviteInput.trim()) {
      e.preventDefault();
      addInviteEmail(inviteInput.trim());
    }
  };

  const addInviteEmail = (email: string) => {
    if (email && !inviteEmails.includes(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteEmails([...inviteEmails, email]);
      setInviteInput("");
    } else if (inviteEmails.includes(email)) {
      toast.warning("Email đã được thêm");
    } else {
      toast.error("Email không hợp lệ");
    }
  };

  const removeInviteEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email));
  };

  const handleSendInvites = () => {
    setSentInvites([...sentInvites, ...inviteEmails]);
    setInviteEmails([]);
    setShowInviteModal(false);
    toast.success(`Đã gửi ${inviteEmails.length} lời mời`);
  };

  const getRoleBadge = (role: string) => {
    return role === "ProjectManager" ? "Project Manager" : "Member";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Hoạt động" : "Không hoạt động";
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="members-roles-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải danh sách thành viên...</p>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className="members-roles-page">
        <div className="error-container">
          <div className="error-icon">
            <CircleAlertIcon size={40} strokeWidth={1.5} />
          </div>
          <p className="error-text">Không thể tải danh sách</p>
          <p className="error-description">{error}</p>
          <button 
            className="add-member-btn" 
            onClick={fetchMembers}
            style={{ marginTop: '16px' }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="members-roles-page">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "members" ? "tab active" : "tab"}
          onClick={() => setActiveTab("members")}
        >
          Danh sách thành viên
        </button>
        <button
          className={activeTab === "requests" ? "tab active" : "tab"}
          onClick={() => setActiveTab("requests")}
        >
          Yêu cầu tham gia ({joinRequests.length})
        </button>
        <button
          className={activeTab === "invites" ? "tab active" : "tab"}
          onClick={() => setActiveTab("invites")}
        >
          Lời mời đã gửi ({sentInvites.length})
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === "members" && (
        <>
          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <SearchIcon size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="role-filter">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
                <option value="all">Tất cả vai trò</option>
                <option value="ProjectManager">Project Manager</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <User size={22} strokeWidth={2} />
              </div>
              <div className="stat-content">
                <h3>Tổng Thành Viên</h3>
                <p className="stat-number">{members.length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <UserStarIcon size={22} strokeWidth={2} />
              </div>
              <div className="stat-content">
                <h3>Project Managers</h3>
                <p className="stat-number">
                  {members.filter((m) => m.roleName === "ProjectManager").length}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle2 size={22} strokeWidth={2} />
              </div>
              <div className="stat-content">
                <h3>Thành Viên Hoạt Động</h3>
                <p className="stat-number">
                  {members.filter((m) => m.isActive === true).length}
                </p>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="members-table-container">
            <div className="table-header">
              <div className="header-left">
                <h3>Danh Sách Thành Viên</h3>
                <span className="member-count">{filteredMembers.length} thành viên</span>
              </div>
              <div className="header-actions">
                <button className="add-member-btn" onClick={() => setShowInviteModal(true)}>
                  <Plus size={22} strokeWidth={2}/>
                  Mời thành viên
                </button>
              </div>
            </div>

            <div className="members-table">
              <div className="table-header-row">
                <div className="col-name">Tên</div>
                <div className="col-email">Email</div>
                <div className="col-role">Vai trò</div>
                <div className="col-status">Trạng thái</div>
                <div className="col-projects">Dự án</div>
                <div className="col-actions">Thao tác</div>
              </div>

              {/* ✅ EMPTY STATE */}
              {filteredMembers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <User size={40} strokeWidth={1.5} />
                  </div>
                  <p className="empty-text">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'Không tìm thấy thành viên phù hợp'
                      : 'Chưa có thành viên nào'}
                  </p>
                  <p className="empty-description">
                    {searchTerm || roleFilter !== 'all'
                      ? 'Thử thay đổi bộ lọc hoặc tìm kiếm'
                      : 'Hãy mời thành viên đầu tiên vào tổ chức'}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div key={member.id} className="table-row">
                    <div className="col-name">
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="member-details">
                          <span className="member-name">{member.fullName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-email">
                      <span className="email">{member.email}</span>
                    </div>

                    <div className="col-role">
                      <span className="role-badge">{getRoleBadge(member.roleName)}</span>
                    </div>

                    <div className="col-status">
                      <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                        {getStatusText(member.isActive)}
                      </span>
                    </div>

                    <div className="col-projects">
                      <span className="project-count">{member.projects || 0} dự án</span>
                    </div>

                    <div className="col-actions">
                      <button className="action-btn edit" onClick={() => handleEditRole(member)} title="Thay đổi vai trò">
                        <UserPenIcon size={16} strokeWidth={2} />
                      </button>

                      <button className="action-btn delete" onClick={() => handleDeleteMember(member.id)} title="Xóa thành viên">
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Role Modal - ✅ VỚI LOADING STATE */}
      {showEditRoleModal && memberToEditRole && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Thay Đổi Vai Trò</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditRoleModal(false)}
                disabled={updatingRole}
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="member-info-section">
                <div className="member-avatar">
                  {memberToEditRole.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="info-name">{memberToEditRole.fullName}</div>
                  <div className="info-email">{memberToEditRole.email}</div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Vai trò hiện tại: <strong>{getRoleBadge(memberToEditRole.roleName)}</strong>
                </label>
                <select
                  value={memberToEditRole.roleName}
                  onChange={(e) =>
                    setMemberToEditRole({
                      ...memberToEditRole,
                      roleName: e.target.value as "Member" | "ProjectManager",
                    })
                  }
                  disabled={updatingRole}
                >
                  <option value="Member">Member</option>
                  <option value="ProjectManager">Project Manager</option>
                </select>
              </div>

              <div className="info-note">
                <p>
                  <strong>Lưu ý:</strong> Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của thành viên.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditRoleModal(false)} disabled={updatingRole}>
                Hủy
              </button>
              <button className="save-btn" onClick={handleUpdateRole} disabled={updatingRole}>
                {updatingRole ? (
                  <>
                    <span className="spinner"></span>
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật vai trò'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal - giữ nguyên code cũ */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Mời thành viên mới</h3>
              <button className="close-btn" onClick={() => setShowInviteModal(false)}>
                <XIcon size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="invite-email-input">
                Nhập email thành viên cần mời
              </label>
              <div className="invite-input-group">
                <input
                  id="invite-email-input"
                  type="email"
                  placeholder="example@email.com"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={handleInviteInputKeyDown}
                />
                <button
                  type="button"
                  className="add-email-btn"
                  onClick={() => addInviteEmail(inviteInput.trim())}
                  disabled={!inviteInput.trim()}
                >
                  Thêm
                </button>
              </div>
              <div className="invite-emails-list">
                {inviteEmails.map((email) => (
                  <span key={email} className="invite-email-label">
                    {email}
                    <button type="button" className="remove-email-btn" onClick={() => removeInviteEmail(email)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowInviteModal(false)}>
                Hủy
              </button>
              <button className="save-btn" onClick={handleSendInvites} disabled={inviteEmails.length === 0}>
                Gửi lời mời ({inviteEmails.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersRolesPage;
