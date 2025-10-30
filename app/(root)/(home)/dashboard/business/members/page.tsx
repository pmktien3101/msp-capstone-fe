"use client";

import { CheckCircle2, CircleAlertIcon, MailOpenIcon, Plus, Search, SearchIcon, Trash2, User, UserPenIcon, UserStarIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import "../../../../../styles/businessMembers.scss";
import { userService } from "@/services/userService";
import { GetUserResponse } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { OrganizationInvitationResponse, SendInvitationResult } from "@/types/organizeInvitation";
import { organizeInvitationService } from "@/services/organizeInvitationService";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

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
  const [sentInvites, setSentInvites] = useState<string[]>([]);

  // Invitation results States
  const [inviteResult, setInviteResult] = useState<SendInvitationResult[] | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);

  // Join requests state
  const [joinRequests, setJoinRequests] = useState<OrganizationInvitationResponse[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Request action loading states
  const [loadingAcceptRequest, setLoadingAcceptRequest] = useState<string | null>(null);
  const [loadingRejectRequest, setLoadingRejectRequest] = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);

  // Sent invitations state
  const [sentInvitations, setSentInvitations] = useState<OrganizationInvitationResponse[]>([]);
  const [loadingSentInvitations, setLoadingSentInvitations] = useState(false);
  const [inviteStatusFilter, setInviteStatusFilter] = useState<"all" | "Pending" | "Accepted" | "Rejected" | "Canceled">("all");

  // Delete member states
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState<string | null>(null);
  const [loadingDeleteMember, setLoadingDeleteMember] = useState<string | null>(null);


  // Filtered members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered sent invitations
  const filteredSentInvitations = inviteStatusFilter === "all"
    ? sentInvitations
    : sentInvitations.filter(inv => inv.statusDisplay === inviteStatusFilter);

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
  const handleDeleteMember = async (memberId: string) => {
    setLoadingDeleteMember(memberId);
    const result = await userService.removeMemberFromOrganization(memberId);
    setLoadingDeleteMember(null);
    setConfirmDeleteMemberId(null);
    if (result.success) {
      setMembers(members.filter((m) => m.id !== memberId));
      toast.success("Đã xóa thành viên");
    } else {
      toast.error(result.error || "Không thể xóa thành viên");
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
    if (inviteEmails.length >= 5) {
      toast.warning("Chỉ có thể mời tối đa 5 người / lần");
      return;
    }
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

  // Send invitations
  const handleSendInvites = async () => {
    if (inviteEmails.length === 0) return;
    setLoadingInvite(true);
    setInviteResult(null);
    try {
      const res = await organizeInvitationService.sendInvitations(inviteEmails);
      if (res.success && res.data) {
        setInviteResult(res.data);
        // Tự động thêm các email gửi thành công vào sentInvites (nếu muốn hiển thị)
        setSentInvites([
          ...sentInvites,
          ...res.data.filter(r => r.success).map(r => r.email)
        ]);
        setInviteEmails([]); // Clear input
      } else {
        toast.error(res.error || "Không thể gửi lời mời");
      }
    } catch (error: any) {
      toast.error(error.message || "Gửi lời mời thất bại");
    }
    setLoadingInvite(false);
  };

  // Fetch join requests
  const fetchJoinRequests = async () => {
    if (!user?.userId) return;
    setLoadingRequests(true);
    const res = await organizeInvitationService.getPendingRequestsByBusinessOwner();
    if (res.success && res.data) {
      setJoinRequests(res.data.filter(r => r.typeDisplay === "Request")); // lọc đúng các "yêu cầu"
    } else {
      setJoinRequests([]);
      toast.error(res.error || "Không thể lấy yêu cầu tham gia");
    }
    setLoadingRequests(false);
  };
  const fetchSentInvitations = async () => {
    setLoadingSentInvitations(true);
    const res = await organizeInvitationService.getSentInvitationsByBusinessOwnerId();
    if (res.success && res.data) {
      setSentInvitations(res.data);
    } else {
      toast.error(res.error || "Không thể tải danh sách lời mời đã gửi");
      setSentInvitations([]);
    }
    setLoadingSentInvitations(false);
  };
  useEffect(() => {
    fetchJoinRequests();
    fetchSentInvitations();
  }, [user?.userId]);

  // Accept join request
  const handleAcceptJoinRequest = async (invitationId: string) => {
    setLoadingAcceptRequest(invitationId);
    const res = await organizeInvitationService.businessOwnerAcceptRequest(invitationId);
    setLoadingAcceptRequest(null);
    if (res.success) {
      toast.success("Đã duyệt yêu cầu thành công!");
      fetchJoinRequests();
    } else {
      toast.error(res.error || "Không thể duyệt yêu cầu");
    }
  };

  // Reject join request
  const handleRejectJoinRequest = async (invitationId: string) => {
    setLoadingRejectRequest(invitationId);
    const res = await organizeInvitationService.businessOwnerRejectRequest(invitationId);
    setLoadingRejectRequest(null);
    setConfirmRejectId(null); // <-- Đảm bảo đóng modal sau khi xong
    if (res.success) {
      toast.success("Đã từ chối yêu cầu!");
      fetchJoinRequests();
    } else {
      toast.error(res.error || "Không thể từ chối yêu cầu");
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "ProjectManager" ? "PM" : "Member";
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
          Lời mời đã gửi ({sentInvitations.length})
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
                  <Plus size={22} strokeWidth={2} />
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

                      <button
                        className="action-btn delete"
                        onClick={() => setConfirmDeleteMemberId(member.id)}
                        title="Xóa thành viên"
                        disabled={loadingDeleteMember === member.id}
                      >
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

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="">
          {loadingRequests ? (
            <div className="loading-request py-8 text-center">
              <CircleAlertIcon size={32} className="text-orange-600 mb-3 animate-spin" />
              <p className="text-muted-foreground">Đang tải yêu cầu tham gia...</p>
            </div>
          ) : joinRequests.length === 0 ? (
            <div className="empty-state py-8 text-center">
              <User size={40} strokeWidth={1.5} className="mb-2" />
              <p className="empty-text">Không có yêu cầu tham gia nào</p>
            </div>
          ) : (
            joinRequests.map(req => (
              <div key={req.id} className="requests-card">
                {/* LEFT: Info */}
                <div className="request-info">
                  <div className="member-avatar">
                    {req.memberAvatar
                      ? <img src={req.memberAvatar} alt={req.memberName} className="avatar-img" />
                      : req.memberName?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="details">
                    <div className="member-name">{req.memberName}</div>
                    <div className="member-email">{req.memberEmail}</div>
                    <div className="organization-badge">{req.organizationName}</div>
                  </div>
                </div>

                {/* MIDDLE: status + ngày gửi */}
                <div className="request-badge-block">
                  <span className={"status-badge " + req.statusDisplay?.toLowerCase()}>
                    {req.statusDisplay === "Pending" && "Chờ duyệt"}
                    {req.statusDisplay === "Accepted" && "Đã nhận"}
                    {req.statusDisplay === "Rejected" && "Đã từ chối"}
                    {req.statusDisplay === "Canceled" && "Đã hủy"}
                  </span>
                  <div className="created-date text-center">Gửi: {new Date(req.createdAt).toLocaleDateString("vi-VN")}<br /></div>
                </div>

                {/* RIGHT: Nút */}
                <div className="request-actions-group">
                  <button className="action-btn accept"
                    onClick={() => handleAcceptJoinRequest(req.id)}
                    disabled={loadingAcceptRequest === req.id || loadingRejectRequest === req.id}
                  >
                    {loadingAcceptRequest === req.id ? "Đang duyệt..." : "Duyệt"}
                  </button>
                  <button className="action-btn reject"
                    onClick={() => setConfirmRejectId(req.id)}
                    disabled={loadingRejectRequest === req.id}
                  >
                    {loadingRejectRequest === req.id ? "Đang từ chối..." : "Từ chối"}
                  </button>
                </div>
              </div>

            ))
          )}
        </div>
      )}

      {/* Sent Invitations Tab */}
      {activeTab === "invites" && (
        <div className="requests-table-container">
          {/* Filter thanh trạng thái */}
          <div className="filters-section" style={{ marginBottom: 12 }}>
            <select
              className="invite-status-filter"
              value={inviteStatusFilter}
              onChange={e => setInviteStatusFilter(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Pending">Đang chờ</option>
              <option value="Accepted">Đã chấp nhận</option>
              <option value="Rejected">Đã từ chối</option>
              <option value="Canceled">Đã được hủy tự động</option>
            </select>
          </div>
          {loadingSentInvitations ? (
            <div className="loading-request py-8 text-center">
              <div className="loading-spinner mb-2"></div>
              <div>Đang tải lời mời đã gửi...</div>
            </div>
          ) : filteredSentInvitations.length === 0 ? (
            <div className="empty-state py-10 text-center">
              <MailOpenIcon size={40} strokeWidth={1.5} className="mb-2" />
              <p className="empty-text">Không có lời mời phù hợp trạng thái.</p>
            </div>
          ) : (
            filteredSentInvitations.map(invite => (
              <div key={invite.id} className="requests-card invite-card">
                <div className="request-info">
                  <div className="member-avatar">
                    {invite.memberAvatar
                      ? <img src={invite.memberAvatar} alt={invite.memberName} className="avatar-img" />
                      : invite.memberName?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="details">
                    <div className="member-name">{invite.memberName}</div>
                    <div className="member-email">{invite.memberEmail}</div>
                    <div className="organization-badge">{invite.organizationName}</div>
                  </div>
                </div>
                <div className="invite-badge-block">
                  <span className={`status-badge ${invite.statusDisplay?.toLowerCase()}`}>
                    {invite.statusDisplay === "Pending" && "Đang chờ"}
                    {invite.statusDisplay === "Accepted" && "Đã chấp nhận"}
                    {invite.statusDisplay === "Rejected" && "Đã từ chối"}
                    {invite.statusDisplay === "Canceled" && "Đã được hủy tự động"}
                    {!["Pending", "Accepted", "Rejected", "Canceled"].includes(invite.statusDisplay) && invite.statusDisplay}
                  </span>
                  <div className="created-date">
                    Gửi: {new Date(invite.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
                  disabled={!inviteInput.trim() || inviteEmails.length >= 5}
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

              {inviteEmails.length >= 5 && (
                <div className="text-xs text-orange-600 mt-2 text-center">
                  Đã đạt tối đa 5 email mỗi lần gửi.
                </div>
              )}


              {inviteResult && (
                <div className="invite-results mt-4 space-y-2">
                  <h4 className="font-semibold mb-2">Kết quả gửi lời mời:</h4>
                  {inviteResult.map(r => (
                    <div
                      key={r.email}
                      className={
                        `flex items-center gap-4 p-3 rounded-lg border overflow-x-auto ` +
                        (r.success
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200")
                      }
                      style={{ maxWidth: "100%" }}
                    >
                      {/* Email + icon */}
                      <div className="flex items-center gap-2 min-w-[120px]">
                        {r.success
                          ? <CheckCircle2 className="text-green-500" size={20} />
                          : <XIcon className="text-red-500" size={20} />}
                        <span className="font-mono text-sm break-all">{r.email}</span>
                      </div>
                      {/* Message luôn đủ rộng và luôn cùng hàng */}
                      {!r.success && (
                        <span
                          className="text-xs text-red-500 italic"
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            maxWidth: "500px"
                          }}
                        >
                          {r.message}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => {
                setShowInviteModal(false);
                setInviteResult(null);
                setInviteEmails([]);
              }}>
                Hủy
              </button>
              <button
                className="save-btn"
                onClick={handleSendInvites}
                disabled={inviteEmails.length === 0 || loadingInvite}
              >
                {loadingInvite ? "Đang gửi..." : `Gửi lời mời (${inviteEmails.length})`}
              </button>
            </div>

          </div>
        </div>
      )}
      <ConfirmModal
        open={!!confirmRejectId}
        title="Từ chối yêu cầu này?"
        content="Bạn sẽ từ chối yêu cầu tham gia này. Thao tác này không thể hoàn tác."
        loading={loadingRejectRequest === confirmRejectId}
        onCancel={() => setConfirmRejectId(null)}
        onConfirm={() => {
          if (confirmRejectId) handleRejectJoinRequest(confirmRejectId);
        }}
        confirmText="Từ chối"
        cancelText="Hủy"
        destructive
      />

      <ConfirmModal
        open={!!confirmDeleteMemberId}
        title="Xóa thành viên khỏi tổ chức?"
        content="Bạn sẽ xóa thành viên này khỏi tổ chức. Thao tác này không thể hoàn tác!"
        loading={loadingDeleteMember === confirmDeleteMemberId}
        onCancel={() => setConfirmDeleteMemberId(null)}
        onConfirm={() => {
          if (confirmDeleteMemberId) handleDeleteMember(confirmDeleteMemberId);
        }}
        confirmText="Xóa"
        cancelText="Hủy"
        destructive
      />
    </div>
  );
};

export default MembersRolesPage;
