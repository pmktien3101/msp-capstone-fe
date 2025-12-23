"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Users,
  FolderKanban,
  Mail,
  Check,
  X,
  Send,
  TrendingUp,
  Calendar,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import "../../../styles/memberBusiness.scss";
import { toast } from "react-toastify";
import { useUserDetail } from "@/contexts/UserContext";
import { BusinessResponse } from "@/types/user";
import { userService } from "@/services/userService";
import { OrganizationInvitationResponse } from "@/types/organizeInvitation";
import { organizeInvitationService } from "@/services/organizeInvitationService";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { useSearchParams } from "next/navigation";

export default function BusinessDashboard() {
  const { userDetail, isLoading, error, refreshUserDetail } = useUserDetail();
  const searchParams = useSearchParams();

  // States
  const [currentBusiness, setCurrentBusiness] =
    useState<BusinessResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BusinessResponse[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessResponse[]>([]);
  const [activeTab, setActiveTab] = useState<
    "my-business" | "invitations" | "send-join-request"
  >("my-business");

  // Loading states
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Invitations and Requests States
  const [invitations, setInvitations] = useState<
    OrganizationInvitationResponse[]
  >([]);
  const [sentJoinRequests, setSentJoinRequests] = useState<
    OrganizationInvitationResponse[]
  >([]);

  // Reject invitation modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [loadingReject, setLoadingReject] = useState(false);

  // Leave organization modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leavingLoading, setLeavingLoading] = useState(false);

  // Filter for sent requests States
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("All");

  // Simplified status options - plain text only
  const statusOptions = [
    { value: "All", label: "All", icon: null },
    { value: "Pending", label: "Pending", icon: Clock },
    { value: "Accepted", label: "Accepted", icon: CheckCircle2 },
    { value: "Rejected", label: "Rejected", icon: XCircle },
    { value: "Canceled", label: "Canceled", icon: AlertCircle },
  ];

  // Filtered requests based on status
  const filteredSentRequests = sentJoinRequests.filter(
    (request) =>
      requestStatusFilter === "All" ||
      request.statusDisplay?.toLowerCase() === requestStatusFilter.toLowerCase()
  );

  // Fetch business detail when user has organization
  const fetchBusinessDetail = async (ownerId: string) => {
    setIsLoadingBusiness(true);
    try {
      const result = await userService.getBusinessDetail(ownerId);
      if (result.success && result.data) {
        setCurrentBusiness(result.data);
      } else {
        toast.error(result.error || "Unable to load business information");
      }
    } catch (err) {
      toast.error("An error occurred while loading business information");
    }
    setIsLoadingBusiness(false);
  };

  // Fetch business list when user doesn't have organization
  const fetchBusinessList = async () => {
    setIsLoadingBusiness(true);
    try {
      const result = await userService.getBusinessList();
      if (result.success && result.data) {
        setAllBusinesses(result.data);
      } else {
        toast.error(result.error || "Unable to load business list");
      }
    } catch (err) {
      toast.error("An error occurred while loading business list");
    }
    setIsLoadingBusiness(false);
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'invitations') {
      setActiveTab('invitations');
    } else if (tab === 'requests') {
      setActiveTab('send-join-request');
    } else if (tab === 'my-business') {
      setActiveTab('my-business');
    }
  }, [searchParams]);

  // Main effect - fetch data based on organization status
  useEffect(() => {
    if (userDetail?.organization) {
      // User has organization -> fetch business detail
      // Assuming you need ownerId from userDetail.managedBy or similar
      if (userDetail.managedBy) {
        fetchBusinessDetail(userDetail.managedBy);
      } else {
        setIsLoadingBusiness(false);
      }
    } else {
      // User doesn't have organization -> fetch business list
      fetchBusinessList();
    }
  }, [userDetail?.organization, userDetail?.managedBy]);

  const fetchReceivedInvitations = async (memberId: string) => {
    setIsLoadingInvitations(true);
    try {
      const res =
        await organizeInvitationService.getReceivedInvitationsByMemberId(
          memberId
        );
      if (res.success) {
        setInvitations(res.data ?? []);
      } else {
        toast.error(res.error || "Unable to load invitations");
        setInvitations([]);
      }
    } catch {
      toast.error("Unable to load invitations");
      setInvitations([]);
    }
    setIsLoadingInvitations(false);
  };

  const fetchSentRequests = async (memberId: string) => {
    setIsLoadingRequests(true);
    try {
      const res = await organizeInvitationService.getSentRequestsByMemberId(
        memberId
      );
      if (res.success) {
        setSentJoinRequests(res.data ?? []);
      } else {
        toast.error(res.error || "Unable to load sent requests");
        setSentJoinRequests([]);
      }
    } catch {
      toast.error("Unable to load sent requests");
      setSentJoinRequests([]);
    }
    setIsLoadingRequests(false);
  };

  // Lấy memberId từ userDetail.id
  useEffect(() => {
    if (userDetail?.id) {
      fetchReceivedInvitations(userDetail.id);
      fetchSentRequests(userDetail.id);
    }
  }, [userDetail?.id]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Filter from allBusinesses
    const filtered = allBusinesses.filter(
      (business) =>
        business.businessName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        business.businessOwnerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);

    if (filtered.length === 0) {
      toast.info("No matching results found");
    }

    setIsSearching(false);
  };

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
    }
    const filtered = allBusinesses.filter(
      (business) =>
        business.businessName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        business.businessOwnerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  const handleAcceptInvitation = async (invitationId: string) => {
    const res = await organizeInvitationService.acceptInvitation(invitationId);
    if (res.success) {
      toast.success("Congratulations! You have joined the organization 🎉");
      // reload đúng tab: invitations và userDetail (để cập nhật trạng thái đã join org)
      if (userDetail?.id) {
        fetchReceivedInvitations(userDetail.id);
        fetchSentRequests(userDetail.id);
        await refreshUserDetail();
      }
    } else {
      toast.error(res.error || "Unable to accept invitation");
    }
  };

  const handleRejectInvitation = async () => {
    if (!rejectingId) return;
    setLoadingReject(true);
    const res = await organizeInvitationService.rejectInvitation(rejectingId);
    setLoadingReject(false);
    setShowRejectModal(false);
    setRejectingId(null);
    if (res.success) {
      toast.success("Invitation rejected!");
      if (userDetail?.id) fetchReceivedInvitations(userDetail.id);
    } else {
      toast.error(res.error || "Unable to reject invitation");
    }
  };

  const handleJoinBusiness = async (businessId: string) => {
    const business = allBusinesses.find((b) => b.id === businessId);
    if (!business || !userDetail?.id || !business.id) return;

    const result = await organizeInvitationService.requestJoinOrganization(
      userDetail.id,
      business.id
    );
    if (result.success) {
      toast.success("Join request sent!");
      // Lấy lại danh sách request mới cho tab update luôn trạng thái
      fetchSentRequests(userDetail.id);
    } else {
      toast.error(result.error || "Unable to send join request");
    }
  };

  const handleLeaveBusiness = async () => {
    setLeavingLoading(true);
    const res = await organizeInvitationService.leaveOrganization();
    setLeavingLoading(false);
    setShowLeaveModal(false);
    if (res.success) {
      toast.success("Left business!");
      setCurrentBusiness(null);
      await refreshUserDetail();
    } else {
      toast.error(res.error || "Unable to leave business");
    }
  };

  function isPendingRequestOrInvite(business: BusinessResponse) {
    return (
      invitations.some(
        (i) =>
          i.organizationName &&
          business.businessName &&
          business.id == i.businessOwnerId &&
          i.organizationName.trim().toLowerCase() ===
            business.businessName.trim().toLowerCase() &&
          i.statusDisplay === "Pending"
      ) ||
      sentJoinRequests.some(
        (r) =>
          r.organizationName &&
          business.businessName &&
          business.id == r.businessOwnerId &&
          r.organizationName.trim().toLowerCase() ===
            business.businessName.trim().toLowerCase() &&
          r.statusDisplay === "Pending"
      )
    );
  }

  if (isLoadingBusiness || isLoading) {
    return (
      <div className="biz-loading">
        <div className="biz-loading__content">
          <div className="biz-loading__spinner">
            <Loader2 className="biz-loading__icon" />
          </div>
          <p className="biz-loading__text">Loading information...</p>
        </div>
      </div>
    );
  }

  const getRoleDisplay = (role: string | undefined) => {
    switch (role) {
      case "Member":
        return "Member";
      case "ProjectManager":
        return "Project Manager";
      case "BusinessOwner":
        return "Business Owner";
      default:
        return role || "";
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "Pending":
        return <Clock size={14} />;
      case "Accepted":
        return <CheckCircle2 size={14} />;
      case "Rejected":
        return <XCircle size={14} />;
      case "Canceled":
        return <AlertCircle size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="biz-page">
      {/* Page Header */}
      <div className="biz-header">
        <div className="biz-header__icon">
          <Building2 size={24} />
        </div>
        <div className="biz-header__text">
          <h1 className="biz-header__title">
            {userDetail?.organization || "Business Hub"}
          </h1>
          <p className="biz-header__subtitle">
            {currentBusiness
              ? "Manage your business membership"
              : "Discover and connect with businesses"}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="biz-tabs">
        <button
          className={`biz-tabs__item ${
            activeTab === "my-business" ? "biz-tabs__item--active" : ""
          }`}
          onClick={() => setActiveTab("my-business")}
        >
          <Building2 size={18} />
          <span>{currentBusiness ? "My Business" : "Explore"}</span>
        </button>
        <button
          className={`biz-tabs__item ${
            activeTab === "invitations" ? "biz-tabs__item--active" : ""
          }`}
          onClick={() => setActiveTab("invitations")}
        >
          <Mail size={18} />
          <span>Invitations</span>
          {invitations.length > 0 && (
            <span className="biz-tabs__badge">{invitations.length}</span>
          )}
        </button>
        <button
          className={`biz-tabs__item ${
            activeTab === "send-join-request" ? "biz-tabs__item--active" : ""
          }`}
          onClick={() => setActiveTab("send-join-request")}
        >
          <Send size={18} />
          <span>Requests</span>
          {sentJoinRequests.filter(r => r.statusDisplay === "Pending").length > 0 && (
            <span className="biz-tabs__badge">
              {sentJoinRequests.filter(r => r.statusDisplay === "Pending").length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="biz-content">
        {/* My Business Tab */}
        {activeTab === "my-business" && (
          <div className="biz-section">
            {currentBusiness ? (
              <>
                {/* Business Card */}
                <div className="biz-card biz-card--featured">
                  <div className="biz-card__ribbon"></div>
                  <div className="biz-card__header">
                    <div className="biz-card__avatar">
                      <Building2 size={32} />
                    </div>
                    <div className="biz-card__info">
                      <h2 className="biz-card__name">
                        {currentBusiness.businessName}
                      </h2>
                      <div className="biz-card__meta">
                        <Users size={14} />
                        <span>
                          Owner:{" "}
                          <strong>{currentBusiness.businessOwnerName}</strong>
                        </span>
                      </div>
                      <div className="biz-card__meta">
                        <Calendar size={14} />
                        <span>
                          Created{" "}
                          {new Date(
                            currentBusiness.createdAt
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="biz-card__actions">
                      <span className="biz-role-badge">
                        <span className="biz-role-badge__dot"></span>
                        {getRoleDisplay(userDetail?.roleName)}
                      </span>
                      {userDetail?.roleName !== "BusinessOwner" && 
                       userDetail?.roleName !== "ProjectManager" && (
                        <button
                          className="biz-btn biz-btn--outline-danger"
                          onClick={() => setShowLeaveModal(true)}
                        >
                          <LogOut size={16} />
                          Leave
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="biz-stats">
                  <div className="biz-stat biz-stat--blue">
                    <div className="biz-stat__icon">
                      <Users size={22} />
                    </div>
                    <div className="biz-stat__content">
                      <span className="biz-stat__value">
                        {currentBusiness.memberCount}
                      </span>
                      <span className="biz-stat__label">Team Members</span>
                    </div>
                    <div className="biz-stat__trend">
                      <TrendingUp size={14} />
                      <span>Active</span>
                    </div>
                  </div>
                  <div className="biz-stat biz-stat--orange">
                    <div className="biz-stat__icon">
                      <FolderKanban size={22} />
                    </div>
                    <div className="biz-stat__content">
                      <span className="biz-stat__value">
                        {currentBusiness.projectCount}
                      </span>
                      <span className="biz-stat__label">Projects</span>
                    </div>
                    <div className="biz-stat__trend biz-stat__trend--muted">
                      <span>In progress</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Search Section */}
                <div className="biz-search-card">
                  <div className="biz-search-card__header">
                    <Search className="biz-search-card__icon" size={20} />
                    <h3 className="biz-search-card__title">
                      Find Your Business
                    </h3>
                  </div>
                  <p className="biz-search-card__desc">
                    You haven't joined any business yet. Search and send join
                    requests to get started.
                  </p>
                  <div className="biz-search">
                    <div className="biz-search__input-wrap">
                      <Search className="biz-search__icon" size={18} />
                      <input
                        type="text"
                        placeholder="Search by business name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="biz-search__input"
                        disabled={isSearching}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="biz-btn biz-btn--primary"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="biz-btn__spinner" size={18} />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search size={18} />
                          <span>Search</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Business List */}
                <div className="biz-list-section">
                  <h3 className="biz-list-section__title">
                    <Building2 size={18} />
                    {searchQuery ? "Search Results" : "Available Businesses"}
                    <span className="biz-list-section__count">
                      {searchQuery
                        ? searchResults.length
                        : allBusinesses.length}
                    </span>
                  </h3>

                  <div className="biz-grid">
                    {(searchQuery ? searchResults : allBusinesses).map(
                      (business) => (
                        <div key={business.id} className="biz-item">
                          <div className="biz-item__avatar">
                            <Building2 size={24} />
                          </div>
                          <div className="biz-item__content">
                            <h4 className="biz-item__name">
                              {business.businessName}
                            </h4>
                            <p className="biz-item__owner">
                              Owner: {business.businessOwnerName}
                            </p>
                            <div className="biz-item__stats">
                              <span className="biz-item__stat">
                                <Users size={14} />
                                {business.memberCount} members
                              </span>
                              <span className="biz-item__stat">
                                <FolderKanban size={14} />
                                {business.projectCount} projects
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleJoinBusiness(business.id)}
                            className={`biz-btn biz-btn--full ${
                              isPendingRequestOrInvite(business)
                                ? "biz-btn--disabled"
                                : "biz-btn--gradient"
                            }`}
                            disabled={isPendingRequestOrInvite(business)}
                          >
                            {isPendingRequestOrInvite(business) ? (
                              <>
                                <Clock size={16} />
                                <span>Pending</span>
                              </>
                            ) : (
                              <>
                                <Send size={16} />
                                <span>Request to Join</span>
                                <ArrowRight
                                  size={16}
                                  className="biz-btn__arrow"
                                />
                              </>
                            )}
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {(searchQuery ? searchResults : allBusinesses).length ===
                    0 && (
                    <div className="biz-empty">
                      <Building2 size={48} className="biz-empty__icon" />
                      <p className="biz-empty__text">No businesses found</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <div className="biz-section">
            {isLoadingInvitations ? (
              <div className="biz-loading biz-loading--inline">
                <Loader2 className="biz-loading__icon" />
                <p>Loading invitations...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="biz-empty-state">
                <div className="biz-empty-state__icon">
                  <Mail size={40} />
                </div>
                <h3 className="biz-empty-state__title">No Invitations</h3>
                <p className="biz-empty-state__desc">
                  You don't have any pending invitations at the moment.
                </p>
              </div>
            ) : (
              <div className="biz-invitations">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="biz-invite">
                    <div className="biz-invite__avatar">
                      {invitation.businessOwnerAvatar ? (
                        <img src={invitation.businessOwnerAvatar} alt="" />
                      ) : (
                        <Mail size={22} />
                      )}
                    </div>
                    <div className="biz-invite__content">
                      <h4 className="biz-invite__org">
                        {invitation.organizationName}
                      </h4>
                      <p className="biz-invite__from">
                        From: <strong>{invitation.businessOwnerName}</strong>
                      </p>
                      <p className="biz-invite__email">
                        {invitation.businessOwnerEmail}
                      </p>
                      <p className="biz-invite__date">
                        <Calendar size={12} />
                        {new Date(invitation.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div className="biz-invite__actions">
                      <span
                        className={`biz-status biz-status--${invitation.statusDisplay?.toLowerCase()}`}
                      >
                        {getStatusIcon(invitation.statusDisplay)}
                        {invitation.statusDisplay === "Pending"
                          ? "Awaiting Response"
                          : invitation.statusDisplay}
                      </span>
                      {invitation.statusDisplay === "Pending" && (
                        <div className="biz-invite__buttons">
                          <button
                            onClick={() =>
                              handleAcceptInvitation(invitation.id)
                            }
                            className="biz-btn biz-btn--success"
                          >
                            <Check size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(invitation.id);
                              setShowRejectModal(true);
                            }}
                            className="biz-btn biz-btn--outline-danger"
                          >
                            <X size={16} />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === "send-join-request" && (
          <div className="biz-section">
            {/* Filter */}
            <div className="biz-filter">
              <span className="biz-filter__label">Filter by status:</span>
              <div className="biz-filter__tabs">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`biz-filter__tab ${
                      requestStatusFilter === option.value
                        ? "biz-filter__tab--active"
                        : ""
                    }`}
                    onClick={() => setRequestStatusFilter(option.value)}
                  >
                    {option.icon && <option.icon size={14} />}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingRequests ? (
              <div className="biz-loading biz-loading--inline">
                <Loader2 className="biz-loading__icon" />
                <p>Loading requests...</p>
              </div>
            ) : filteredSentRequests.length === 0 ? (
              <div className="biz-empty-state">
                <div className="biz-empty-state__icon">
                  <Send size={40} />
                </div>
                <h3 className="biz-empty-state__title">No Requests</h3>
                <p className="biz-empty-state__desc">
                  {requestStatusFilter === "All"
                    ? "You haven't sent any join requests yet."
                    : `No requests with status "${requestStatusFilter}".`}
                </p>
              </div>
            ) : (
              <div className="biz-requests">
                {filteredSentRequests.map((request) => (
                  <div key={request.id} className="biz-request">
                    <div className="biz-request__avatar">
                      {request.businessOwnerAvatar ? (
                        <img src={request.businessOwnerAvatar} alt="" />
                      ) : (
                        <Send size={22} />
                      )}
                    </div>
                    <div className="biz-request__content">
                      <h4 className="biz-request__org">
                        {request.organizationName}
                      </h4>
                      <p className="biz-request__owner">
                        Owner: <strong>{request.businessOwnerName}</strong>
                      </p>
                      <p className="biz-request__email">
                        {request.businessOwnerEmail}
                      </p>
                      <p className="biz-request__date">
                        <Calendar size={12} />
                        Sent on{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <span
                      className={`biz-status biz-status--${request.statusDisplay?.toLowerCase()}`}
                    >
                      {getStatusIcon(request.statusDisplay)}
                      {request.statusDisplay === "Pending"
                        ? "Pending Approval"
                        : request.statusDisplay === "Canceled"
                        ? "Auto-canceled"
                        : request.statusDisplay}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={showLeaveModal}
        title="Leave this business?"
        content="You will lose access to all business resources and projects. This action cannot be undone."
        loading={leavingLoading}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveBusiness}
        confirmText="Leave Business"
        cancelText="Cancel"
        destructive
      />

      <ConfirmModal
        open={showRejectModal}
        title="Decline invitation?"
        content="You won't be able to join this business unless you receive a new invitation."
        loading={loadingReject}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectingId(null);
        }}
        onConfirm={handleRejectInvitation}
        confirmText="Decline"
        cancelText="Cancel"
        destructive
      />
    </div>
  );
}
