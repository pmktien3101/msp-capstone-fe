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
  MinusCircle,
  Hourglass,
  BadgeCheck,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import "../../../styles/business.scss";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { useUserDetail } from "@/contexts/UserContext";
import { BusinessResponse } from "@/types/user";
import { userService } from "@/services/userService";
import { OrganizationInvitationResponse } from "@/types/organizeInvitation";
import { organizeInvitationService } from "@/services/organizeInvitationService";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BusinessDashboard() {
  const { userDetail, isLoading, error, refreshUserDetail } = useUserDetail();

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
  const [requestStatusFilter, setRequestStatusFilter] =
    useState<string>("Pending");

  // Simplified status options - plain text only
  const statusOptions = [
    { value: "All", label: "All" },
    { value: "Pending", label: "Pending" },
    { value: "Accepted", label: "Accepted" },
    { value: "Rejected", label: "Rejected" },
    { value: "Canceled", label: "Canceled" },
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
      <div className="loading-state">
        <div className="text-center">
          <Loader2 className="loader-large spinner centered mb-4" />
          <p className="muted-foreground">Loading information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-page">
      <div className="business-container">
        {/* Header */}
        <div className="header-wrap">
          <div className="business-header">
            <div className="business-avatar-small">
              <Building2 className="icon-md icon-white" />
            </div>
            <div>
              <h1 className="business-title">
                {userDetail?.organization || "Search Business"}
              </h1>
              <p className="business-subtitle">
                {currentBusiness
                  ? "Business information"
                  : "Discover and join businesses"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={
              activeTab === "my-business" ? "tab active" : "tab"
            }
            onClick={() => setActiveTab("my-business")}
          >
            {/* <Building2 className="icon-xs" /> */}
            {currentBusiness ? "Business" : "Search"}
          </button>
          <button
            className={
              activeTab === "invitations" ? "tab active" : "tab"
            }
            onClick={() => setActiveTab("invitations")}
          >
            {/* <Mail className="icon-xs" /> */}
            Invitations ({invitations.length})
          </button>
          <button
            className={
              activeTab === "send-join-request" ? "tab active" : "tab"
            }
            onClick={() => setActiveTab("send-join-request")}
          >
            {/* <Send className="icon-xs" /> */}
            Sent Requests ({sentJoinRequests.length})
          </button>
        </div>

        {/* My Business Tab */}
        {activeTab === "my-business" && (
          <div className="tabs-section stack-lg">
            {currentBusiness ? (
              // User has organization -> Show business detail
              <>
                <Card className="card">
                  <div className="card-overlay" />
                  <CardHeader className="card-header">
                    <div className="card-top">
                      <div className="card-main-row">
                        <div className="avatar-gradient-lg">
                          <Building2 className="icon-lg icon-white" />
                        </div>
                        <div>
                          <CardTitle className="card-title">
                            {currentBusiness.businessName}
                          </CardTitle>
                          <p className="info-row">
                            <Users className="icon-xs" />
                            Business Owner:{" "}
                            <strong>{currentBusiness.businessOwnerName}</strong>
                          </p>
                          <p className="small-info">
                            <Calendar className="icon-xs" />
                            Created on:{" "}
                            {new Date(
                              currentBusiness.createdAt
                            ).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                      <div className="info-actions">
                        <Badge className="badge badge-role">
                          <div className="status-dot mr-1" />
                          {userDetail?.roleName === "Member"
                            ? "Member"
                            : userDetail?.roleName === "ProjectManager"
                              ? "Project Manager"
                              : userDetail?.roleName === "BusinessOwner"
                                ? "Business Owner"
                                : userDetail?.roleName}
                        </Badge>
                        {userDetail?.roleName !== "BusinessOwner" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="btn-outline btn-sm"
                            onClick={() => setShowLeaveModal(true)}
                          >
                            <X className="icon-xs mr-1" />
                            Leave Business
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Stats Grid */}
                <div className="grid-responsive">
                  <Card className="card card--hover-shadow">
                    <div className="card-top-bar card-top-bar--blue" />
                    <CardHeader className="card-header--pb">
                      <CardDescription className="card-description">
                        <div className="icon-wrap icon-wrap--blue">
                          <Users className="icon-sm icon-blue" />
                        </div>
                        Total Members
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="stat-number">
                        {currentBusiness.memberCount}
                      </div>
                      <p className="small-info muted-foreground">
                        <TrendingUp className="icon-xs icon-green" /> Active
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card card--hover-shadow">
                    <div className="card-top-bar card-top-bar--orange" />
                    <CardHeader className="card-header--pb">
                      <CardDescription className="card-description">
                        <div className="icon-wrap icon-wrap--orange">
                          <FolderKanban className="icon-sm icon-orange" />
                        </div>
                        Projects
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="stat-number">
                        {currentBusiness.projectCount}
                      </div>
                      <p className="small-info muted-foreground">
                        In progress
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              // User doesn't have organization -> Show search
              <>
                <Card className="card">
                  <CardHeader>
                    <CardTitle className="section-title">
                      <Search className="icon-sm icon-orange" /> Search Business
                    </CardTitle>
                    <CardDescription className="text-base">
                      You haven't joined any business yet. Search and send join requests.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="search-row">
                      <div className="search-input-wrap">
                        <Search className="search-icon" />
                        <Input
                          placeholder="Enter business name to search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                          className="input-search"
                          disabled={isSearching}
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="btn btn-gradient btn-lg"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="spinner icon-sm mr-1" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="icon-sm mr-1" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* All Businesses Display hoặc Search Results */}
                <div className="stack-md">
                  <h3 className="section-title">
                    <Building2 className="icon-sm icon-orange" />
                    {(searchQuery
                      ? "Search Results"
                      : "All Businesses") +
                      " (" +
                      (searchQuery
                        ? searchResults.length
                        : allBusinesses.length) +
                      ")"}
                  </h3>
                  <div className="grid-responsive">
                    {(searchQuery ? searchResults : allBusinesses).map(
                      (business, index) => (
                        <Card
                          key={business.id}
                          className="card card--hover-shadow"
                        >
                          <CardContent className="card-content--pt6">
                            <div className="list-row">
                              <div className="avatar-gradient-sm">
                                <Building2 className="icon-md icon-white" />
                              </div>
                              <div className="list-body">
                                <h4 className="card-item-title">
                                  {business.businessName}
                                </h4>
                                <p className="muted-foreground">
                                  Business Owner: {business.businessOwnerName}
                                </p>
                                <div className="list-stats muted-foreground">
                                  <span className="stat-item">
                                    <Users className="icon-sm" />
                                    {business.memberCount} members
                                  </span>
                                  <span className="stat-item">
                                    <FolderKanban className="icon-sm" />
                                    {business.projectCount} projects
                                  </span>
                                </div>
                                <Button
                                  onClick={() =>
                                    handleJoinBusiness(business.id)
                                  }
                                  size="sm"
                                  className={
                                    `btn btn-full btn-elevated ` +
                                    (isPendingRequestOrInvite(business)
                                      ? "btn-disabled"
                                      : "btn-gradient")
                                  }
                                  disabled={isPendingRequestOrInvite(business)}
                                >
                                  <Send className="icon-sm mr-1" />
                                  {isPendingRequestOrInvite(business)
                                    ? "Cannot send request"
                                    : "Send Join Request"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <div className="stack-md mt-lg">
            {isLoadingInvitations ? (
              <div className="text-center padded-xxl">
                <Loader2 className="loader-medium spinner centered mb-4" />
                <p className="muted-foreground">Loading invitations...</p>
              </div>
            ) : invitations.length === 0 ? (
              <Card className="card card--dashed">
                <CardContent className="padded-xxl text-center">
                  <Mail className="icon-xl muted-foreground centered mb-4 opacity-50" />
                  <p className="text-lg muted-foreground">
                    You have no invitations yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              invitations.map((invitation) => (
                <Card key={invitation.id} className="card card--hover-shadow">
                  <CardContent className="invite-row">
                    {/* Tổ chức + Avatar chủ doanh nghiệp */}
                    <div className="invite-left">
                      <div className="invite-avatar">
                        {invitation.businessOwnerAvatar ? (
                          <img
                            src={invitation.businessOwnerAvatar}
                            alt="avatar"
                            className="avatar-img"
                          />
                        ) : (
                          <Mail className="icon-md icon-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">
                          {invitation.organizationName}
                        </h4>
                        <div className="meta-row">
                          Invited by Business Owner:{" "}
                          <span className="font-semibold ml-1">
                            {invitation.businessOwnerName}
                          </span>
                        </div>
                        <div className="meta-row muted-foreground">
                          {invitation.businessOwnerEmail}
                        </div>
                      </div>
                    </div>
                    {/* Thông tin chi tiết và trạng thái */}
                    <div className="invite-body">
                      <div className="meta-row small-info">
                        <span className="muted-foreground mr-3">Sent to: </span>
                        <span className="font-semibold">
                          {invitation.memberEmail}
                        </span>
                      </div>
                      <div className="meta-row muted-foreground small-info">
                        <span>
                          Invitation date:{" "}
                          {new Date(invitation.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        {invitation.statusDisplay === "Accepted" &&
                          invitation.respondedAt && (
                            <span>
                              - Accepted on:{" "}
                              {new Date(
                                invitation.respondedAt
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                      </div>
                    </div>
                    {/* Phản hồi */}
                    <div className="response-col">
                      <Badge
                        className={
                          invitation.statusDisplay === "Pending"
                            ? "badge badge-pending"
                            : invitation.statusDisplay === "Accepted"
                              ? "badge badge-accepted"
                              : "badge badge-rejected"
                        }
                      >
                        {invitation.statusDisplay === "Pending"
                          ? "Awaiting response"
                          : invitation.statusDisplay === "Accepted"
                            ? "Accepted"
                            : invitation.statusDisplay === "Rejected"
                              ? "Rejected"
                              : "Auto-canceled"}
                      </Badge>
                      {/* Chỉ show button khi đang chờ, có thể tuỳ chỉnh logic */}
                      {invitation.statusDisplay === "Pending" && (
                        <div className="action-row">
                          <Button
                            onClick={() =>
                              handleAcceptInvitation(invitation.id)
                            }
                            className="btn btn-accept btn-sm"
                            size="sm"
                          >
                            <Check className="icon-sm mr-1" /> Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRejectingId(invitation.id);
                              setShowRejectModal(true);
                            }}
                            size="sm"
                            className="btn btn-outline-danger btn-sm"
                          >
                            <X className="icon-sm mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === "send-join-request" && (
          <div className="stack-md mt-lg">
            {/* Filter Section */}
            <div className="filter-row">
              <h3 className="text-lg font-semibold"></h3>
              <div className="filter-controls">
                <span className="text-sm text-muted-foreground">Filter by:</span>
                <Select
                  value={requestStatusFilter}
                  onValueChange={setRequestStatusFilter}
                >
                  <SelectTrigger className="select-trigger">
                    <SelectValue placeholder="Select status">
                      {statusOptions.find((o) => o.value === requestStatusFilter)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="select-item"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoadingRequests ? (
              <div className="text-center padded-xxl">
                <Loader2 className="loader-medium spinner centered mb-4" />
                <p className="muted-foreground">Loading requests...</p>
              </div>
            ) : filteredSentRequests.length === 0 ? (
              <Card className="card card--dashed">
                <CardContent className="padded-xxl text-center">
                  <Send className="icon-xl muted-foreground centered mb-4 opacity-50" />
                  <p className="text-lg muted-foreground">
                    {requestStatusFilter === "All"
                      ? "You haven't sent any requests yet"
                      : `No requests with status "${statusOptions.find(
                        (o) => o.value === requestStatusFilter
                      )?.label || requestStatusFilter
                      }"`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSentRequests.map((request) => (
                <Card key={request.id} className="card card--hover-shadow">
                  <CardContent className="card-content list-row-compact">
                    {/* Avatar, tên tổ chức */}
                    <div className="list-left">
                      <div className="avatar-gradient-lg">
                        {request.businessOwnerAvatar ? (
                          <img
                            src={request.businessOwnerAvatar}
                            alt="avatar"
                            className="avatar-img"
                          />
                        ) : (
                          <Send className="icon-md icon-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">
                          {request.organizationName}
                        </h4>
                        <div className="meta-row">
                          Business Owner:{" "}
                          <span className="font-semibold ml-1">
                            {request.businessOwnerName}
                          </span>
                        </div>
                        <div className="meta-row muted-foreground">
                          {request.businessOwnerEmail}
                        </div>
                      </div>
                    </div>
                    {/* trạng thái */}
                    <div className="list-body-compact">
                      <div className="meta-row muted-foreground">
                        Sent on:{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                      {request.statusDisplay === "Accepted" && (
                        <div className="text-xs text-success">
                          Approved on:{" "}
                          {request.respondedAt
                            ? new Date(request.respondedAt).toLocaleDateString(
                              "vi-VN"
                            )
                            : null}
                        </div>
                      )}
                      {request.statusDisplay === "Rejected" && (
                        <div className="text-xs text-error">Rejected</div>
                      )}
                      {request.statusDisplay === "Canceled" && (
                        <div className="text-xs text-muted">Canceled</div>
                      )}
                    </div>
                    <Badge
                      className={
                        request.statusDisplay === "Pending"
                          ? "badge badge-pending"
                          : request.statusDisplay === "Accepted"
                            ? "badge badge-accepted"
                            : request.statusDisplay === "Rejected"
                              ? "badge badge-rejected"
                              : "badge badge-canceled"
                      }
                    >
                      {request.statusDisplay === "Pending"
                        ? "Pending approval"
                        : request.statusDisplay === "Accepted"
                          ? "Accepted"
                          : request.statusDisplay === "Rejected"
                            ? "Rejected"
                            : request.statusDisplay === "Canceled"
                              ? "Auto-canceled"
                              : request.statusDisplay}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={showLeaveModal}
        title="Are you sure you want to leave the business?"
        content="After leaving, you will lose access to the business's resources and projects."
        loading={leavingLoading}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveBusiness}
        confirmText="Leave Business"
        cancelText="Cancel"
        destructive
      />

      <ConfirmModal
        open={showRejectModal}
        title="Are you sure you want to reject this invitation?"
        content="After rejecting, you won't be able to join this business unless invited again."
        loading={loadingReject}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectingId(null);
        }}
        onConfirm={handleRejectInvitation}
        confirmText="Reject"
        cancelText="Cancel"
        destructive
      />
    </div>
  );
}
