"use client";

import { CheckCircle2, CircleAlertIcon, Eye, MailOpenIcon, Plus, Search, SearchIcon, Trash2, User, UserPenIcon, UserStarIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "../../../../../styles/businessMembers.scss";
import { userService } from "@/services/userService";
import { GetUserResponse } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { OrganizationInvitationResponse, SendInvitationResult } from "@/types/organizeInvitation";
import { organizeInvitationService } from "@/services/organizeInvitationService";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useMemberLimitationCheck } from "@/hooks/useLimitationCheck";
import { Card, CardContent } from "@/components/ui/card";

const MembersRolesPage = () => {
  const { user } = useAuth();
  const currentSubscription = useSubscription();
  const { checkMemberLimitation } = useMemberLimitationCheck();
  const searchParams = useSearchParams();

  // States
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [memberToEditRole, setMemberToEditRole] = useState<GetUserResponse | null>(null);
  const [showViewMemberModal, setShowViewMemberModal] = useState(false);
  const [memberToView, setMemberToView] = useState<GetUserResponse | null>(null);
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
      setError("Member information not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const result = await userService.getMembersByBO(user.userId);

    if (result.success && result.data) {
      setMembers(result.data);
    } else {
      setError(result.error || "Unable to load the list");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [user?.userId]);

  // Handle URL query params for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'join-requests') {
      setActiveTab('requests');
    } else if (tab === 'invites') {
      setActiveTab('invites');
    } else if (tab === 'members') {
      setActiveTab('members');
    }
  }, [searchParams]);

  // Handlers
  const handleDeleteMember = async (memberId: string) => {
    setLoadingDeleteMember(memberId);
    const result = await userService.removeMemberFromOrganization(memberId);
    setLoadingDeleteMember(null);
    setConfirmDeleteMemberId(null);
    if (result.success) {
      setMembers(members.filter((m) => m.id !== memberId));
      toast.success("Member removed successfully");
    } else {
      toast.error(result.error || "Unable to remove member");
    }
  };

  const handleEditRole = (member: GetUserResponse) => {
    setMemberToEditRole(member);
    setShowEditRoleModal(true);
  };

  const handleViewMember = (member: GetUserResponse) => {
    setMemberToView(member);
    setShowViewMemberModal(true);
  };

  const handleUpdateRole = async () => {
    if (!memberToEditRole || !user?.userId) {
      toast.error("Missing required information");
      return;
    }

    const originalMember = members.find(m => m.id === memberToEditRole.id);
    if (originalMember?.roleName === memberToEditRole.roleName) {
      toast.info("Role has not changed");
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

        toast.success(`Role updated to ${result.data.newRole}`);
        setShowEditRoleModal(false);
        setMemberToEditRole(null);
      } else {
        toast.error(result.error || "Unable to update role");
      }
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Error updating role");
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
      toast.warning("You can only invite up to 5 people at a time");
      return;
    }
    if (email && !inviteEmails.includes(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteEmails([...inviteEmails, email]);
      setInviteInput("");
    } else if (inviteEmails.includes(email)) {
      toast.warning("This user has already been added");
    } else {
      toast.error("Invalid email format");
    }
  };

  const removeInviteEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email));
  };

  // Check member limitation before opening invite modal
  const handleOpenInviteModal = () => {
    if (!checkMemberLimitation()) {
      return; // Limit reached, prevent opening modal
    }

    // Mở modal nếu chưa đạt giới hạn
    setShowInviteModal(true);
  };

  // Check member limitation before sending invites
  const handleSendInvites = async () => {
    if (inviteEmails.length === 0) return;

    // Check basic limitation
    if (!checkMemberLimitation()) {
      return; // Limit reached
    }

    // Check if inviting multiple members would exceed limit
    if (currentSubscription?.package?.limitations) {
      const memberLimitation = currentSubscription.package.limitations.find(
        (lim: any) => lim.limitationType === 'NumberMemberInOrganization'
      );

      if (memberLimitation) {
        const { limitValue, usedValue, limitUnit } = memberLimitation;
        const currentUsed = usedValue ?? 0;
        const maxAllowed = limitValue ?? 0;
        const remainingSlots = maxAllowed - currentUsed;

        // Check if number of emails exceeds remaining slots
        if (inviteEmails.length > remainingSlots) {
          toast.error(
            `Cannot invite ${inviteEmails.length} members. ` +
            `You only have ${remainingSlots} slots left in your current plan (${currentUsed}/${maxAllowed} ${limitUnit || 'members'} used).`,
            {
              autoClose: 6000,
              position: 'top-center',
            }
          );
          return;
        }

        // Warning if approaching limit after inviting
        const futureUsed = currentUsed + inviteEmails.length;
        const futurePercent = (futureUsed / maxAllowed) * 100;
        if (futurePercent >= 90 && futurePercent < 100) {
          toast.warning(
            `After inviting, you will have ${futureUsed}/${maxAllowed} members. Approaching the limit!`,
            {
              autoClose: 4000,
              position: 'top-center',
            }
          );
        }
      }
    }

    // Proceed with sending invites
    setLoadingInvite(true);
    setInviteResult(null);
    try {
      const res = await organizeInvitationService.sendInvitations(inviteEmails);
      if (res.success && res.data) {
        setInviteResult(res.data);
        setSentInvites([
          ...sentInvites,
          ...res.data.filter(r => r.success).map(r => r.email)
        ]);
        setInviteEmails([]);
      } else {
        toast.error(res.error || "Unable to send invitations");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitations");
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
      toast.error(res.error || "Unable to fetch join requests");
    }
    setLoadingRequests(false);
  };
  const fetchSentInvitations = async () => {
    setLoadingSentInvitations(true);
    const res = await organizeInvitationService.getSentInvitationsByBusinessOwnerId();
    if (res.success && res.data) {
      setSentInvitations(res.data);
    } else {
      toast.error(res.error || "Unable to load the list of sent invitations");
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
      toast.success("Join request approved successfully!");
      fetchJoinRequests();
    } else {
      toast.error(res.error || "Unable to approve join request");
    }
  };

  // Reject join request
  const handleRejectJoinRequest = async (invitationId: string) => {
    setLoadingRejectRequest(invitationId);
    const res = await organizeInvitationService.businessOwnerRejectRequest(invitationId);
    setLoadingRejectRequest(null);
    setConfirmRejectId(null); // <-- Đảm bảo đóng modal sau khi xong
    if (res.success) {
      toast.success("Join request rejected successfully!");
      fetchJoinRequests();
    } else {
      toast.error(res.error || "Unable to reject join request");
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "ProjectManager" ? "PM" : "Member";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="members-roles-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading members list...</p>
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
          <p className="error-text">Unable to load members list</p>
          <p className="error-description">{error}</p>
          <button
            className="add-member-btn"
            onClick={fetchMembers}
            style={{ marginTop: '16px' }}
          >
            Retry
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
          Members List
        </button>
        <button
          className={activeTab === "requests" ? "tab active" : "tab"}
          onClick={() => setActiveTab("requests")}
        >
          Join Requests ({joinRequests.length})
        </button>
        <button
          className={activeTab === "invites" ? "tab active" : "tab"}
          onClick={() => setActiveTab("invites")}
        >
          Sent Invitations ({sentInvitations.length})
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="role-filter">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
                <option value="all">All</option>
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
                <h3>Total Members</h3>
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
                <h3>Active Members</h3>
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
                <h3>Members List</h3>
                <span className="member-count">{filteredMembers.length} members</span>
              </div>
              <div className="header-actions">
                <button className="add-member-btn" onClick={handleOpenInviteModal}>
                  <Plus size={22} strokeWidth={2} />
                  Invite Members
                </button>
              </div>
            </div>

            <div className="members-table">
              <div className="table-header-row">
                <div className="col-name">Name</div>
                <div className="col-email">Email</div>
                <div className="col-role">Role</div>
                <div className="col-status">Status</div>
                {/* <div className="col-projects">Projects</div> */}
                <div className="col-actions">Actions</div>
              </div>

              {/* ✅ EMPTY STATE */}
              {filteredMembers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <User size={40} strokeWidth={1.5} />
                  </div>
                  <p className="empty-text">
                    {searchTerm || roleFilter !== 'all'
                      ? 'No matching members found'
                      : 'No members yet'}
                  </p>
                  <p className="empty-description">
                    {searchTerm || roleFilter !== 'all'
                      ? 'Try changing the filter or search'
                      : 'Invite the first member to the organization'}
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



                    <div className="col-actions">
                      <span className="action-icon view" onClick={() => handleViewMember(member)} title="View Details">
                        <Eye size={18} strokeWidth={1.7} />
                      </span>
                      <span className="action-icon edit" onClick={() => handleEditRole(member)} title="Edit Role">
                        <UserPenIcon size={18} strokeWidth={1.7} />
                      </span>
                      <span
                        className="action-icon delete"
                        onClick={() => setConfirmDeleteMemberId(member.id)}
                        title="Remove Member"
                        style={{ opacity: loadingDeleteMember === member.id ? 0.5 : 1, pointerEvents: loadingDeleteMember === member.id ? 'none' : 'auto' }}
                      >
                        <Trash2 size={18} strokeWidth={1.7} />
                      </span>
                    </div>
                  </div>
                ))
              )
              }
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
              <p className="text-muted-foreground">Loading Join Request...</p>
            </div>
          ) : joinRequests.length === 0 ? (
            // <div className="empty-state py-8 text-center">
            //   <User size={40} strokeWidth={1.5} className="mb-2" />
            //   <p className="empty-text">No join requests</p>
            // </div>
            <Card className="card card--dashed">
              <CardContent className="padded-xxl text-center">
                <User className="icon-xl muted-foreground centered mb-4 opacity-50" />
                <p className="text-lg muted-foreground">
                  You have no join requests at the moment.
                </p>
              </CardContent>
            </Card>
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
                    {req.statusDisplay === "Pending" && "Pending"}
                    {req.statusDisplay === "Accepted" && "Accepted"}
                    {req.statusDisplay === "Rejected" && "Rejected"}
                    {req.statusDisplay === "Canceled" && "Canceled"}
                  </span>
                  <div className="created-date text-center">Sent: {new Date(req.createdAt).toLocaleDateString("en-US")}<br /></div>
                </div>

                {/* RIGHT: Nút */}
                <div className="request-actions-group">
                  <button className="action-btn accept"
                    onClick={() => handleAcceptJoinRequest(req.id)}
                    disabled={loadingAcceptRequest === req.id || loadingRejectRequest === req.id}
                  >
                    {loadingAcceptRequest === req.id ? "Approving..." : "Approve"}
                  </button>
                  <button className="action-btn reject"
                    onClick={() => setConfirmRejectId(req.id)}
                    disabled={loadingRejectRequest === req.id}
                  >
                    {loadingRejectRequest === req.id ? "Rejecting..." : "Reject"}
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
            <h3 className="text-lg font-semibold"></h3>
            <div className="filter-control">
              <span className="text-muted-foreground">Filter by: </span>
              <select
                className="invite-status-filter"
                value={inviteStatusFilter}
                onChange={e => setInviteStatusFilter(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </div>
          {loadingSentInvitations ? (
            <div className="loading-request py-8 text-center">
              <div className="loading-spinner mb-2"></div>
              <div>Loading sent invitations...</div>
            </div>
          ) : filteredSentInvitations.length === 0 ? (
            // <div className="empty-state py-10 text-center">
            //   <MailOpenIcon size={40} strokeWidth={1.5} className="mb-2" />
            //   <p className="empty-text">No invitations match the selected status.</p>
            // </div>
            <Card className="card card--dashed">
              <CardContent className="padded-xxl text-center">
                <MailOpenIcon className="icon-xl muted-foreground centered mb-4 opacity-50" />
                <p className="text-lg muted-foreground">
                  {inviteStatusFilter !== 'all' ?
                    ' No invitations match the selected status.' :
                    'You have no sent invitations yet.'}
                </p>
              </CardContent>
            </Card>
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
                    {invite.statusDisplay === "Pending" && "Pending"}
                    {invite.statusDisplay === "Accepted" && "Accepted"}
                    {invite.statusDisplay === "Rejected" && "Rejected"}
                    {invite.statusDisplay === "Canceled" && "Canceled"}
                    {!["Pending", "Accepted", "Rejected", "Canceled"].includes(invite.statusDisplay) && invite.statusDisplay}
                  </span>
                  <div className="created-date">
                    Sent: {new Date(invite.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View Member Detail Modal */}
      {showViewMemberModal && memberToView && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Member Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowViewMemberModal(false)}
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="member-info-section">
                <div className="member-avatar" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                  {memberToView.fullName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="info-name" style={{ fontSize: '24px', marginBottom: '8px' }}>{memberToView.fullName}</div>
                  <div className="info-email" style={{ fontSize: '16px', marginBottom: '12px' }}>{memberToView.email}</div>
                  <span className={`status-badge ${memberToView.isActive ? 'active' : 'inactive'}`}>
                    {getStatusText(memberToView.isActive)}
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Role</label>
                <span className="role-badge" style={{ fontSize: '14px', padding: '8px 16px' }}>
                  {getRoleBadge(memberToView.roleName)}
                </span>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Phone Number</label>
                <p style={{ margin: 0, color: '#6b7280' }}>{memberToView.phoneNumber || 'Not provided'}</p>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Projects</label>
                <p style={{ margin: 0, color: '#6b7280' }}>{memberToView.projects || 0} projects</p>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Joined Date</label>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  {memberToView.createdAt ? new Date(memberToView.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowViewMemberModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal - ✅ VỚI LOADING STATE */}
      {showEditRoleModal && memberToEditRole && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Role</h3>
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
                  Current role: <strong>{getRoleBadge(memberToEditRole.roleName)}</strong>
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
                  <strong>Note:</strong> Changing the role will affect the member's access permissions.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditRoleModal(false)} disabled={updatingRole}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleUpdateRole} disabled={updatingRole}>
                {updatingRole ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : (
                  'Update Role'
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
              <h3>Invite New Member</h3>
              <button className="close-btn" onClick={() => setShowInviteModal(false)}>
                <XIcon size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="invite-email-input">
                Enter the email of the member to invite (up to 5 at a time):
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
                  Add
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
                  Reached the maximum of 5 emails per send.
                </div>
              )}


              {inviteResult && (
                <div className="invite-results mt-4 space-y-2">
                  <h4 className="font-semibold mb-2">Invite Results:</h4>
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
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleSendInvites}
                disabled={inviteEmails.length === 0 || loadingInvite}
              >
                {loadingInvite ? "Sending..." : `Send Invites (${inviteEmails.length})`}
              </button>
            </div>

          </div>
        </div>
      )}
      <ConfirmModal
        open={!!confirmRejectId}
        title="Reject this request?"
        content="You will reject this join request. This action cannot be undone."
        loading={loadingRejectRequest === confirmRejectId}
        onCancel={() => setConfirmRejectId(null)}
        onConfirm={() => {
          if (confirmRejectId) handleRejectJoinRequest(confirmRejectId);
        }}
        confirmText="Reject"
        cancelText="Cancel"
        destructive
      />

      <ConfirmModal
        open={!!confirmDeleteMemberId}
        title="Delete member from organization?"
        content="You will delete this member from the organization. This action cannot be undone!"
        loading={loadingDeleteMember === confirmDeleteMemberId}
        onCancel={() => setConfirmDeleteMemberId(null)}
        onConfirm={() => {
          if (confirmDeleteMemberId) handleDeleteMember(confirmDeleteMemberId);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
      />
    </div>
  );
};

export default MembersRolesPage;
