"use client";

import { Eye } from "lucide-react";
import UserDetailModal from "@/components/modals/UserDetailModal";
import React, { useState } from "react";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "Member" | "ProjectManager";
  status: "active" | "inactive";
  joinDate: string;
  lastActive: string;
  projects: number;
}

const MembersRolesPage = () => {
  const [members, setMembers] = useState<Member[]>([
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@company.com",
      phone: "+84 123 456 789",
      password: "password123",
      role: "ProjectManager",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2024-12-20",
      projects: 5,
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "tranthib@company.com",
      phone: "+84 987 654 321",
      password: "password123",
      role: "Member",
      status: "active",
      joinDate: "2024-02-20",
      lastActive: "2024-12-19",
      projects: 3,
    },
    {
      id: "3",
      name: "Lê Văn C",
      email: "levanc@company.com",
      phone: "+84 555 123 456",
      password: "password123",
      role: "Member",
      status: "inactive",
      joinDate: "2024-03-10",
      lastActive: "2024-12-15",
      projects: 2,
    },
    {
      id: "4",
      name: "Phạm Thị D",
      email: "phamthid@company.com",
      phone: "+84 111 222 333",
      password: "password123",
      role: "ProjectManager",
      status: "active",
      joinDate: "2024-04-05",
      lastActive: "2024-12-20",
      projects: 4,
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
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
  const [joinRequests, setJoinRequests] = useState<Member[]>([
    {
      id: "5",
      name: "Vũ Minh E",
      email: "vuminhe@company.com",
      phone: "+84 222 333 444",
      password: "password123",
      role: "Member",
      status: "inactive",
      joinDate: "2024-09-01",
      lastActive: "2024-09-10",
      projects: 0,
    },
  ]);
  const [sentInvites, setSentInvites] = useState<string[]>([]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleViewMember = (member: Member) => {
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
          color: config.textColor,
        }}
      >
        {config.text}
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
          color: config.textColor,
        }}
      >
        {config.text}
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="8"
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
                <h3>Project Managers</h3>
                <p className="stat-number">
                  {members.filter((m) => m.role === "ProjectManager").length}
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
                  {members.filter((m) => m.status === "active").length}
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
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{member.name}</span>
                        <span className="join-date">
                          Tham gia: {member.joinDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-email">
                    <span className="email">{member.email}</span>
                  </div>

                  <div className="col-role">{getRoleBadge(member.role)}</div>

                  <div className="col-status">
                    <span className="status-badge">
                      {getStatusBadge(member.status)}
                    </span>
                  </div>

                  <div className="col-projects">
                    <span className="project-count">
                      {member.projects} dự án
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
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{req.name}</span>
                        <span className="join-date">
                          Tham gia: {req.joinDate}
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
                        setMembers([...members, { ...req, status: "active" }]);
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
                    value={selectedMember.name}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        name: e.target.value,
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
                  value={selectedMember.phone}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vai trò</label>
                  <select
                    value={selectedMember.role}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        role: e.target.value as "Member" | "ProjectManager",
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
                    value={selectedMember.status}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        status: e.target.value as "active" | "inactive",
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
      <UserDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        member={selectedMember}
      />

      <style jsx>{`
        .members-roles-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-content h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0d062d;
          margin: 0 0 8px 0;
        }

        .header-content p {
          font-size: 16px;
          color: #787486;
          margin: 0;
        }

        .add-member-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ff5e13;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-member-btn:hover {
          background: #ffa463;
          transform: translateY(-2px);
        }

        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          position: relative;
          flex: 1;
          background: white;
          border-radius: 8px;
        }

        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #787486;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 44px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #ff5e13;
        }

        .role-filter select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .role-filter select:focus {
          outline: none;
          border-color: #ff5e13;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: #f9f4ee;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff5e13;
        }

        .stat-content h3 {
          font-size: 12px;
          color: #787486;
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #0d062d;
          margin: 0;
        }

        .members-table-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid #f1f5f9;
          position: relative;
        }

        .members-table-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ff5e13, transparent);
          opacity: 0.3;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .table-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0d062d;
          margin: 0;
        }

        .member-count {
          font-size: 14px;
          color: #787486;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .download-template-btn,
        .import-excel-btn,
        .add-member-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #0d062d;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .download-template-btn:hover {
          border-color: #10b981;
          color: #10b981;
          background: #f0fdf4;
        }

        .import-excel-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #eff6ff;
        }

        .add-member-btn {
          background: #ff5e13;
          border-color: #ff5e13;
          color: white;
        }

        .add-member-btn:hover {
          background: #e04a0c;
          border-color: #e04a0c;
        }

        .members-table {
          overflow-x: auto;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1.5fr;
          gap: 16px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 2px solid #e2e8f0;
          position: relative;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .table-header-row::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff5e13, #ff8c42, #ffa463);
          border-radius: 0 0 2px 2px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1.5fr;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          align-items: center;
          transition: all 0.3s ease;
          background: white;
        }

        .table-row:hover {
          background: linear-gradient(135deg, #fef7f0 0%, #fff5f0 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.08);
          border-left: 3px solid #ff5e13;
        }

        .table-row:nth-child(even) {
          background: #fafbfc;
        }

        .table-row:nth-child(even):hover {
          background: linear-gradient(135deg, #fef7f0 0%, #fff5f0 100%);
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .member-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
          border: 3px solid white;
          position: relative;
          transition: all 0.3s ease;
        }

        .member-avatar::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff5e13, #ff8c42, #ffa463);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .member-avatar:hover::before {
          opacity: 1;
        }

        .member-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 94, 19, 0.4);
        }

        .member-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .member-name {
          font-size: 15px;
          font-weight: 700;
          color: #0d062d;
          transition: color 0.3s ease;
        }

        .table-row:hover .member-name {
          color: #ff5e13;
        }

        .join-date {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .email {
          font-size: 14px;
          color: #475569;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .table-row:hover .email {
          color: #ff5e13;
        }

        .role-badge,
        .status-badge {
          font-size: 12px;
          font-weight: 600;
          color: #059669;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
          transition: all 0.3s ease;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          max-width: 100%;
        }

        .table-row:hover .role-badge {
          background: linear-gradient(135deg, #fef7f0, #fff5f0);
          color: #ff5e13;
          transform: scale(1.05);
        }

        .table-row:hover .status-badge {
          background: linear-gradient(135deg, #fef7f0, #fff5f0);
          color: #ff5e13;
          transform: scale(1.05);
        }

        .project-count {
          font-size: 14px;
          color: #475569;
          font-weight: 600;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          padding: 4px 8px;
          border-radius: 12px;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .table-row:hover .project-count {
          background: linear-gradient(135deg, #fef7f0, #fff5f0);
          color: #ff5e13;
        }

        .col-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .action-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .action-btn:hover::before {
          opacity: 1;
        }

        .action-btn.view {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          color: #16a34a;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
        }

        .action-btn.view:hover {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .action-btn.edit {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .action-btn.edit:hover {
          background: linear-gradient(135deg, #bfdbfe, #93c5fd);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-btn.delete {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
        }

        .action-btn.delete:hover {
          background: linear-gradient(135deg, #fecaca, #fca5a5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid #f3f4f6;
          background: linear-gradient(135deg, #f9f4ee 0%, #fff5f0 100%);
          border-radius: 16px 16px 0 0;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0d062d;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #787486;
          padding: 4px;
        }

        .close-btn:hover {
          color: #0d062d;
        }

        .modal-body {
          padding: 24px;
          background: white;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-row .form-group {
          margin-bottom: 0;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #0d062d;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #fafbfc;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #ff5e13;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 94, 19, 0.1);
          transform: translateY(-1px);
        }

        .email-input-group {
          display: flex;
          align-items: center;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }

        .email-input-group:focus-within {
          border-color: #ff5e13;
        }

        .email-input-group input {
          flex: 1;
          border: none;
          padding: 12px;
          font-size: 14px;
          outline: none;
        }

        .email-domain {
          padding: 12px;
          background: #f9f4ee;
          color: #787486;
          font-size: 14px;
          font-weight: 500;
          border-left: 1px solid #e5e7eb;
        }

        .phone {
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .table-row:hover .phone {
          color: #ff5e13;
        }

        /* Import Modal Styles */
        .import-instructions {
          background: #f9f4ee;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .import-instructions h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #0d062d;
        }

        .import-instructions ol {
          margin: 0;
          padding-left: 20px;
        }

        .import-instructions li {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .file-upload-area {
          border: 2px dashed #e5e7eb;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          transition: border-color 0.3s ease;
        }

        .file-upload-area:hover {
          border-color: #ff5e13;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: #6b7280;
        }

        .file-upload-label svg {
          color: #ff5e13;
        }

        .file-upload-label span {
          font-size: 16px;
          font-weight: 500;
          color: #0d062d;
        }

        .file-upload-label small {
          font-size: 12px;
          color: #6b7280;
        }

        /* Preview Modal Styles */
        .preview-modal {
          max-width: 1000px;
          width: 90%;
        }

        .import-summary {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
          padding: 16px;
          background: #f9f4ee;
          border-radius: 8px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-item .label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .summary-item .value {
          font-size: 18px;
          font-weight: 700;
          color: #0d062d;
        }

        .summary-item .value.valid {
          color: #10b981;
        }

        .summary-item .value.error {
          color: #ef4444;
        }

        .preview-table {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .preview-header {
          display: grid;
          grid-template-columns: 60px 1fr 1.5fr 1fr 1fr;
          gap: 12px;
          padding: 12px 16px;
          background: #f9f4ee;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .preview-row {
          display: grid;
          grid-template-columns: 60px 1fr 1.5fr 1fr 1fr;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }

        .preview-row.valid {
          background: white;
        }

        .preview-row.error {
          background: #fef2f2;
        }

        .preview-col {
          display: flex;
          align-items: center;
        }

        .status-valid {
          color: #10b981;
          font-weight: 500;
        }

        .status-error {
          color: #ef4444;
          font-weight: 500;
        }

        .error-details {
          margin-top: 4px;
        }

        .error-item {
          font-size: 12px;
          color: #dc2626;
          margin-bottom: 2px;
        }

        .confirm-import-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .confirm-import-btn:hover:not(:disabled) {
          background: #059669;
        }

        .confirm-import-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px 28px;
          border-top: 1px solid #f3f4f6;
          background: #fafbfc;
          border-radius: 0 0 16px 16px;
        }

        .cancel-btn {
          padding: 12px 24px;
          border: 2px solid #e5e7eb;
          background: white;
          color: #787486;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          border-color: #d1d5db;
          color: #0d062d;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .save-btn {
          padding: 12px 24px;
          border: none;
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          color: white;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        .save-btn:hover {
          background: linear-gradient(135deg, #e04a0c, #ff5e13);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 94, 19, 0.4);
        }

        @media (max-width: 768px) {
          .members-roles-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .filters-section {
            flex-direction: column;
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-header-row,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .col-name,
          .col-email,
          .col-role,
          .col-status,
          .col-projects,
          .col-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          }

          .col-name::before {
            content: "Tên: ";
            font-weight: 600;
          }
          .col-email::before {
            content: "Email: ";
            font-weight: 600;
          }
          .col-role::before {
            content: "Vai trò: ";
            font-weight: 600;
          }
          .col-status::before {
            content: "Trạng thái: ";
            font-weight: 600;
          }
          .col-projects::before {
            content: "Dự án: ";
            font-weight: 600;
          }
          .col-actions::before {
            content: "Thao tác: ";
            font-weight: 600;
          }

          /* Modal responsive */
          .modal {
            max-width: 95%;
            margin: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .modal-header {
            padding: 20px 24px;
          }

          .modal-body {
            padding: 20px 24px;
          }

          .modal-footer {
            padding: 20px 24px;
          }
        }

        .tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .tab {
          padding: 10px 24px;
          border-radius: 8px 8px 0 0;
          background: #f3f4f6;
          color: #787486;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab.active {
          background: #ff5e13;
          color: white;
        }
        .requests-table,
        .invites-table {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 24px;
          margin-bottom: 32px;
        }
        .requests-table h3,
        .invites-table h3 {
          margin-bottom: 16px;
        }

        .invite-input-group {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .invite-input-group input {
          flex: 1;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }
        .add-email-btn {
          background: #ff5e13;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        .add-email-btn:disabled {
          background: #f3f4f6;
          color: #787486;
          cursor: not-allowed;
        }
        .invite-emails-list {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .invite-email-label {
          background: #f3f4f6;
          color: #0d062d;
          border-radius: 16px;
          padding: 6px 16px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .remove-email-btn {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 18px;
          cursor: pointer;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
};

export default MembersRolesPage;
