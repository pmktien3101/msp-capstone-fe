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
import "../../../styles/business.scss";
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

  // Status options (use semantic class names instead of Tailwind utility tokens)
  const statusOptions = [
    {
      value: "All",
      label: "Tất cả",
      icon: <MinusCircle className="icon-xs icon-gray mr-1" />,
      colorClass: "status-all",
    },
    {
      value: "Pending",
      label: "Đang chờ duyệt",
      icon: <Hourglass className="icon-xs icon-yellow mr-1" />,
      colorClass: "status-pending",
    },
    {
      value: "Accepted",
      label: "Đã chấp nhận",
      icon: <BadgeCheck className="icon-xs icon-green mr-1" />,
      colorClass: "status-accepted",
    },
    {
      value: "Rejected",
      label: "Đã từ chối",
      icon: <XCircle className="icon-xs icon-red mr-1" />,
      colorClass: "status-rejected",
    },
    {
      value: "Canceled",
      label: "Đã hủy",
      icon: <MinusCircle className="icon-xs icon-gray mr-1" />,
      colorClass: "status-canceled",
    },
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
        toast.error(result.error || "Không thể tải thông tin doanh nghiệp");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tải thông tin doanh nghiệp");
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
        toast.error(result.error || "Không thể tải danh sách doanh nghiệp");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tải danh sách doanh nghiệp");
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
        toast.error(res.error || "Không thể tải lời mời");
        setInvitations([]);
      }
    } catch {
      toast.error("Không thể tải lời mời");
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
        toast.error(res.error || "Không thể tải yêu cầu đã gửi");
        setSentJoinRequests([]);
      }
    } catch {
      toast.error("Không thể tải yêu cầu đã gửi");
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
      toast.info("Không tìm thấy kết quả phù hợp");
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
      toast.success("Chúc mừng! Bạn đã gia nhập tổ chức 🎉");
      // reload đúng tab: invitations và userDetail (để cập nhật trạng thái đã join org)
      if (userDetail?.id) {
        fetchReceivedInvitations(userDetail.id);
        fetchSentRequests(userDetail.id);
        await refreshUserDetail();
      }
    } else {
      toast.error(res.error || "Không thể chấp nhận lời mời");
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
      toast.success("Đã từ chối lời mời!");
      if (userDetail?.id) fetchReceivedInvitations(userDetail.id);
    } else {
      toast.error(res.error || "Không thể từ chối lời mời");
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
      toast.success("Đã gửi yêu cầu tham gia!");
      // Lấy lại danh sách request mới cho tab update luôn trạng thái
      fetchSentRequests(userDetail.id);
    } else {
      toast.error(result.error || "Không gửi được yêu cầu tham gia");
    }
  };

  const handleLeaveBusiness = async () => {
    setLeavingLoading(true);
    const res = await organizeInvitationService.leaveOrganization();
    setLeavingLoading(false);
    setShowLeaveModal(false);
    if (res.success) {
      toast.success("Đã rời doanh nghiệp!");
      setCurrentBusiness(null);
      await refreshUserDetail();
    } else {
      toast.error(res.error || "Không thể rời doanh nghiệp");
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
          <p className="muted-foreground">Đang tải thông tin...</p>
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
                {userDetail?.organization || "Tìm Kiếm Doanh Nghiệp"}
              </h1>
              <p className="business-subtitle">
                {currentBusiness
                  ? "Thông tin doanh nghiệp"
                  : "Khám phá và tham gia doanh nghiệp"}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="my-business" className="tabs-root">
          <div className="tabs-header">
            <TabsList className="tabs-list">
              <TabsTrigger value="my-business" className="tabs-trigger">
                <Building2 className="icon-xs" />
                {currentBusiness ? "Doanh Nghiệp" : "Tìm Kiếm"}
              </TabsTrigger>
              <TabsTrigger value="invitations" className="tabs-trigger">
                <Mail className="icon-xs" />
                Lời Mời ({invitations.length})
              </TabsTrigger>
              <TabsTrigger value="send-join-request" className="tabs-trigger">
                <Send className="icon-xs" />
                Yêu Cầu Đã Gửi ({sentJoinRequests.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-business" className="tabs-section stack-lg">
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
                            Chủ doanh nghiệp:{" "}
                            <strong>{currentBusiness.businessOwnerName}</strong>
                          </p>
                          <p className="small-info">
                            <Calendar className="icon-xs" />
                            Tạo ngày:{" "}
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
                            ? "Thành Viên"
                            : userDetail?.roleName === "ProjectManager"
                            ? "Quản Lý Dự Án"
                            : userDetail?.roleName === "BusinessOwner"
                            ? "Chủ Doanh Nghiệp"
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
                            Rời Doanh Nghiệp
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
                        Tổng Thành Viên
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="stat-number">
                        {currentBusiness.memberCount}
                      </div>
                      <p className="small-info muted-foreground">
                        <TrendingUp className="icon-xs icon-green" /> Đang hoạt
                        động
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
                        Dự Án
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="stat-number">
                        {currentBusiness.projectCount}
                      </div>
                      <p className="small-info muted-foreground">
                        Đang triển khai
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
                      <Search className="icon-sm icon-orange" /> Tìm Kiếm Doanh
                      Nghiệp
                    </CardTitle>
                    <CardDescription className="text-base">
                      Bạn chưa tham gia doanh nghiệp nào. Tìm kiếm và gửi yêu
                      cầu tham gia.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="search-row">
                      <div className="search-input-wrap">
                        <Search className="search-icon" />
                        <Input
                          placeholder="Nhập tên business để tìm kiếm..."
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
                            Đang tìm...
                          </>
                        ) : (
                          <>
                            <Search className="icon-sm mr-1" />
                            Tìm Kiếm
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
                      ? "Kết Quả Tìm Kiếm"
                      : "Tất Cả Doanh Nghiệp") +
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
                                  Chủ doanh nghiệp: {business.businessOwnerName}
                                </p>
                                <div className="list-stats muted-foreground">
                                  <span className="stat-item">
                                    <Users className="icon-sm" />
                                    {business.memberCount} thành viên
                                  </span>
                                  <span className="stat-item">
                                    <FolderKanban className="icon-sm" />
                                    {business.projectCount} dự án
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
                                    ? "Không thể gửi yêu cầu"
                                    : "Gửi Yêu Cầu Tham Gia"}
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
          </TabsContent>

          <TabsContent value="invitations" className="stack-md mt-lg">
            {isLoadingInvitations ? (
              <div className="text-center padded-xxl">
                <Loader2 className="loader-medium spinner centered mb-4" />
                <p className="muted-foreground">Đang tải lời mời...</p>
              </div>
            ) : invitations.length === 0 ? (
              <Card className="card card--dashed">
                <CardContent className="padded-xxl text-center">
                  <Mail className="icon-xl muted-foreground centered mb-4 opacity-50" />
                  <p className="text-lg muted-foreground">
                    Bạn chưa có lời mời nào
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
                          Mời bởi chủ DN:{" "}
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
                        <span className="muted-foreground mr-3">Gửi tới: </span>
                        <span className="font-semibold">
                          {invitation.memberEmail}
                        </span>
                      </div>
                      <div className="meta-row muted-foreground small-info">
                        <span>
                          Ngày mời:{" "}
                          {new Date(invitation.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        {invitation.statusDisplay === "Accepted" &&
                          invitation.respondedAt && (
                            <span>
                              - Đã duyệt ngày:{" "}
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
                          ? "Đang chờ phản hồi"
                          : invitation.statusDisplay === "Accepted"
                          ? "Đã chấp nhận"
                          : invitation.statusDisplay === "Rejected"
                          ? "Đã từ chối"
                          : "Đã được hủy tự động"}
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
                            <Check className="icon-sm mr-1" /> Chấp Nhận
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
                            <X className="icon-sm mr-1" /> Từ Chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="send-join-request" className="stack-md mt-lg">
            {/* Filter Section */}
            <div className="filter-row">
              <h3 className="text-lg font-semibold">Yêu cầu đã gửi</h3>
              <div className="filter-controls">
                <span className="text-sm text-muted-foreground">Lọc theo:</span>
                <Select
                  value={requestStatusFilter}
                  onValueChange={setRequestStatusFilter}
                >
                  <SelectTrigger
                    className={`select-trigger ${
                      statusOptions.find((o) => o.value === requestStatusFilter)
                        ?.colorClass || ""
                    }`}
                  >
                    <SelectValue
                      placeholder="Chọn trạng thái"
                      className="select-value"
                    >
                      {
                        statusOptions.find(
                          (o) => o.value === requestStatusFilter
                        )?.icon
                      }
                      {
                        statusOptions.find(
                          (o) => o.value === requestStatusFilter
                        )?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className={`select-item ${option.colorClass} ${
                          requestStatusFilter === option.value
                            ? "select-item-selected"
                            : ""
                        }`}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {requestStatusFilter === option.value && (
                          <CheckCircle className="check-icon" />
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoadingRequests ? (
              <div className="text-center padded-xxl">
                <Loader2 className="loader-medium spinner centered mb-4" />
                <p className="muted-foreground">Đang tải yêu cầu...</p>
              </div>
            ) : filteredSentRequests.length === 0 ? (
              <Card className="card card--dashed">
                <CardContent className="padded-xxl text-center">
                  <Send className="icon-xl muted-foreground centered mb-4 opacity-50" />
                  <p className="text-lg muted-foreground">
                    {requestStatusFilter === "All"
                      ? "Bạn chưa gửi yêu cầu nào"
                      : `Không có yêu cầu nào với trạng thái "${
                          statusOptions.find(
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
                          Chủ DN:{" "}
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
                        Gửi ngày:{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                      {request.statusDisplay === "Accepted" && (
                        <div className="text-xs text-success">
                          Đã được duyệt:{" "}
                          {request.respondedAt
                            ? new Date(request.respondedAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : null}
                        </div>
                      )}
                      {request.statusDisplay === "Rejected" && (
                        <div className="text-xs text-error">Bị từ chối</div>
                      )}
                      {request.statusDisplay === "Canceled" && (
                        <div className="text-xs text-muted">Đã hủy</div>
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
                        ? "Đang chờ duyệt"
                        : request.statusDisplay === "Accepted"
                        ? "Đã chấp nhận"
                        : request.statusDisplay === "Rejected"
                        ? "Đã từ chối"
                        : request.statusDisplay === "Canceled"
                        ? "Đã được hủy tự động"
                        : request.statusDisplay}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmModal
        open={showLeaveModal}
        title="Bạn có chắc muốn rời doanh nghiệp?"
        content="Sau khi rời khỏi, bạn sẽ mất quyền truy cập các tài nguyên, dự án của doanh nghiệp."
        loading={leavingLoading}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveBusiness}
        confirmText="Rời Doanh Nghiệp"
        cancelText="Hủy"
        destructive
      />

      <ConfirmModal
        open={showRejectModal}
        title="Bạn chắc chắn muốn từ chối lời mời?"
        content="Sau khi từ chối bạn sẽ không thể tham gia doanh nghiệp này nếu không được mời lại."
        loading={loadingReject}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectingId(null);
        }}
        onConfirm={handleRejectInvitation}
        confirmText="Từ Chối"
        cancelText="Hủy"
        destructive
      />
    </div>
  );
}
