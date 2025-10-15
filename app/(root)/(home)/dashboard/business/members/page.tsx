"use client";

import { Eye, UserPenIcon, UserStarIcon } from "lucide-react";
import UserDetailModal from "@/components/modals/UserDetailModal";
import React, { useEffect, useState } from "react";
import "../../../../../styles/businessMembers.scss";
import { userService } from "@/services/userService";
import { GetUserResponse } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";

const MembersRolesPage = () => {
  // Lấy current user từ useAuth
  const { user, isAuthenticated, isLoading } = useAuth();
  //State cho modal chỉnh sửa vai trò
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [memberToEditRole, setMemberToEditRole] = useState<GetUserResponse | null>(null);

  // State cho danh sách thành viên
  const [members, setMembers] = useState<GetUserResponse[]>([]);
  // State cho loading và error khi fetch members
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");


  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GetUserResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "Member" | "ProjectManager"
  >("all");
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState("");

  const [activeTab, setActiveTab] = useState<
    "members" | "requests" | "invites"
  >("members");

  // Mock data cho các request và invites
  const [joinRequests, setJoinRequests] = useState<GetUserResponse[]>([
    {
      id: "5",
      fullName: "Vũ Minh E",
      email: "vuminhe@company.com",
      phoneNumber: "+84 222 333 444",
      // password: "password123",
      roleName: "Member",
      isActive: false,
      createdAt: "2024-09-01",
      avatarUrl: "",
      googleId: "",
      organization: "",
      managedBy: "",
      managerName: "",
      businessLicense: "",
      isApproved: false,
      projects: 0,
    },
  ]);
  const [sentInvites, setSentInvites] = useState<string[]>([]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleViewMember = (member: GetUserResponse) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      setMembers(members.filter((member) => member.id !== memberId));
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ProjectManager: { textColor: "#1E40AF", text: "Project Manager" },
      Member: { textColor: "#065F46", text: "Member" },
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <span
        className="role-badge"
        style={{
          color: config?.textColor,
        }}
      >
        {config?.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { textColor: "#065F46", text: "Hoạt động" },
      inactive: { textColor: "#DC2626", text: "Không hoạt động" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className="status-badge"
        style={{
          color: config?.textColor,
        }}
      >
        {config?.text}
      </span>
    );
  };

  // Handle invite input (add email when press Enter or click Add)
  const handleInviteInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if ((e.key === "Enter" || e.key === ",") && inviteInput.trim()) {
      e.preventDefault();
      addInviteEmail(inviteInput.trim());
    }
  };

  const addInviteEmail = (email: string) => {
    if (
      email &&
      !inviteEmails.includes(email) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setInviteEmails([...inviteEmails, email]);
      setInviteInput("");
    }
  };

  const removeInviteEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email));
  };

  const handleSendInvites = () => {
    setSentInvites([...sentInvites, ...inviteEmails]);
    setInviteEmails([]);
    setShowInviteModal(false);
  };

  const fetchMembers = async () => {
    // Lấy userId từ user object
    if (!user?.userId) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }
    setLoading(true);
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

  const handleEditRole = (member: GetUserResponse) => {
    setMemberToEditRole(member);
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = () => {
    if (memberToEditRole) {
      setMembers(
        members.map((m) =>
          m.id === memberToEditRole.id
            ? { ...m, roleName: memberToEditRole.roleName }
            : m
        )
      );
      setShowEditRoleModal(false);
      setMemberToEditRole(null);
    }
  };

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

      {/* Tab content */}
      {activeTab === "members" && (
        <>
          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="role-filter">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
              >
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Tổng Thành Viên</h3>
                <p className="stat-number">{members.length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <UserStarIcon size={24} strokeWidth={2} color="currentColor" />
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
                <span className="member-count">
                  {filteredMembers.length} thành viên
                </span>
              </div>
              <div className="header-actions">
                <button
                  className="add-member-btn"
                  onClick={() => setShowInviteModal(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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

              {filteredMembers.map((member) => (
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

                  <div className="col-role">{getRoleBadge(member.roleName)}</div>

                  <div className="col-status">
                    <span className="status-badge">
                      {getStatusBadge(member.isActive ? "active" : "inactive")}
                    </span>
                  </div>

                  <div className="col-projects">
                    <span className="project-count">
                      {member.projects || 0} dự án
                    </span>
                  </div>

                  <div className="col-actions">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewMember(member)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} strokeWidth={2} color="currentColor" />
                    </button>

                    {/* NÚT MỚI - Edit Role */}
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditRole(member)}
                      title="Thay đổi vai trò"
                    >
                      <UserPenIcon size={16} strokeWidth={2} color="currentColor" />
                    </button>

                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteMember(member.id)}
                      title="Xóa"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 6H5H21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "requests" && (
        <div className="members-table-container">
          <div className="table-header">
            <div className="header-left">
              <h3>Yêu cầu tham gia</h3>
              <span className="member-count">
                {joinRequests.length} yêu cầu
              </span>
            </div>
          </div>
          <div className="members-table">
            <div
              className="table-header-row"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1.5fr",
                gap: "16px",
                padding: "20px 24px",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                fontSize: "12px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              <div className="col-name">Tên</div>
              <div className="col-email">Email</div>
              <div className="col-status">Trạng thái</div>
              <div className="col-actions">Thao tác</div>
            </div>
            {joinRequests.length === 0 ? (
              <div style={{ padding: "24px" }}>Không có yêu cầu nào.</div>
            ) : (
              joinRequests.map((req) => (
                <div
                  key={req.id}
                  className="table-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr 1.5fr",
                    gap: "16px",
                    padding: "20px 24px",
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
                    background: "white",
                  }}
                >
                  <div className="col-name">
                    <div className="member-info">
                      <div className="member-avatar">
                        {req.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{req.fullName}</span>
                        <span className="join-date">
                          Tham gia: {req.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-email">
                    <span className="email">{req.email}</span>
                  </div>
                  <div className="col-status">
                    <span className="status-badge">
                      {/* Luôn hiển thị "Chờ duyệt" cho request */}
                      Chờ duyệt
                    </span>
                  </div>
                  <div
                    className="col-actions"
                    style={{ display: "flex", gap: "8px" }}
                  >
                    <button
                      className="action-btn"
                      style={{
                        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                        color: "#16a34a",
                        fontWeight: 600,
                        padding: "0 24px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onClick={() => {
                        // setMembers([...members, { ...req, status: "active" }]);
                        setJoinRequests(
                          joinRequests.filter((r) => r.id !== req.id)
                        );
                      }}
                    >
                      Chấp nhận
                    </button>
                    <button
                      className="action-btn delete"
                      style={{
                        background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                        color: "#dc2626",
                        fontWeight: 600,
                        padding: "0 24px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onClick={() =>
                        setJoinRequests(
                          joinRequests.filter((r) => r.id !== req.id)
                        )
                      }
                      title="Từ chối"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "invites" && (
        <div className="members-table-container">
          <div className="table-header">
            <div className="header-left">
              <h3>Lời mời đã gửi</h3>
              <span className="member-count">{sentInvites.length} lời mời</span>
            </div>
          </div>
          <div className="members-table">
            <div
              className="table-header-row"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1.5fr",
                gap: "16px",
                padding: "20px 24px",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                fontSize: "12px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              <div className="col-name">Tên</div>
              <div className="col-email">Email</div>
              <div className="col-status">Trạng thái</div>
              <div className="col-actions">Thao tác</div>
            </div>
            {sentInvites.length === 0 ? (
              <div style={{ padding: "24px" }}>Không có lời mời nào.</div>
            ) : (
              sentInvites.map((inviteEmail) => (
                <div
                  key={inviteEmail}
                  className="table-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr 1.5fr",
                    gap: "16px",
                    padding: "20px 24px",
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
                    background: "white",
                  }}
                >
                  <div className="col-name">
                    <div className="member-info">
                      <div className="member-avatar">
                        {inviteEmail.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{inviteEmail}</span>
                        <span className="join-date">
                          {/* No joinDate for invites */}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-email">
                    <span className="email">{inviteEmail}</span>
                  </div>
                  <div className="col-status">
                    <span className="status-badge">Đang chờ</span>
                  </div>
                  <div
                    className="col-actions"
                    style={{ display: "flex", gap: "8px" }}
                  >
                    <button
                      className="action-btn delete"
                      style={{
                        background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                        color: "#dc2626",
                        fontWeight: 600,
                        padding: "0 24px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onClick={() =>
                        setSentInvites(
                          sentInvites.filter((i) => i !== inviteEmail)
                        )
                      }
                      title="Hủy lời mời"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Mời thành viên mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowInviteModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="invite-email-input">
                Nhập email thành viên cần mời, nhấn Enter để thêm
              </label>
              <div className="invite-input-group">
                <input
                  id="invite-email-input"
                  type="email"
                  placeholder="Nhập email cần mời..."
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
                    <button
                      type="button"
                      className="remove-email-btn"
                      onClick={() => removeInviteEmail(email)}
                      title="Xóa email"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowInviteModal(false)}
              >
                Hủy
              </button>
              <button
                className="save-btn"
                onClick={handleSendInvites}
                disabled={inviteEmails.length === 0}
              >
                Gửi lời mời ({inviteEmails.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Chỉnh Sửa Thành Viên</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên thành viên</label>
                  <input
                    type="text"
                    value={selectedMember.fullName}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        fullName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedMember.email}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={selectedMember.phoneNumber}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vai trò</label>
                  <select
                    value={selectedMember.roleName}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        roleName: e.target.value as "Member" | "ProjectManager",
                      })
                    }
                  >
                    <option value="Member">Member</option>
                    <option value="ProjectManager">Project Manager</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={selectedMember.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        isActive: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {/* <UserDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        member={selectedMember}
      /> */}

      {/* Edit Role Modal */}
      {showEditRoleModal && memberToEditRole && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Thay Đổi Vai Trò Thành Viên</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditRoleModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="member-info-section" style={{
                background: 'linear-gradient(135deg, #f9f4ee 0%, #fff5f0 100%)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div className="member-avatar">
                  {memberToEditRole.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#0d062d', marginBottom: '4px' }}>
                    {memberToEditRole.fullName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#787486' }}>
                    {memberToEditRole.email}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Vai trò hiện tại: <strong>{memberToEditRole.roleName === "ProjectManager" ? "Project Manager" : "Member"}</strong>
                </label>
                <select
                  value={memberToEditRole.roleName}
                  onChange={(e) =>
                    setMemberToEditRole({
                      ...memberToEditRole,
                      roleName: e.target.value as "Member" | "ProjectManager",
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#fafbfc',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Member">Member</option>
                  <option value="ProjectManager">Project Manager</option>
                </select>
              </div>

              <div style={{
                background: '#eff6ff',
                padding: '12px 16px',
                borderRadius: '8px',
                marginTop: '16px',
                border: '1px solid #bfdbfe'
              }}>
                <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
                  <strong>Lưu ý:</strong> Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của thành viên trong hệ thống.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowEditRoleModal(false)}
              >
                Hủy
              </button>
              <button
                className="save-btn"
                onClick={handleUpdateRole}
              >
                Cập nhật vai trò
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MembersRolesPage;
