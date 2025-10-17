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
import "../../../styles/member-roles-page.scss";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { useUserDetail } from "@/contexts/UserContext";
import { BusinessResponse } from "@/types/user";
import { userService } from "@/services/userService";
import { OrganizationInvitationResponse } from "@/types/organizeInvitation";
import { organizeInvitationService } from "@/services/organizeInvitationService";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BusinessDashboard() {
  const { userDetail, isLoading, error, refreshUserDetail } = useUserDetail();

  // States
  const [currentBusiness, setCurrentBusiness] = useState<BusinessResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BusinessResponse[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessResponse[]>([]);

  // Loading states
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Invitations and Requests States
  const [invitations, setInvitations] = useState<OrganizationInvitationResponse[]>([]);
  const [sentJoinRequests, setSentJoinRequests] = useState<OrganizationInvitationResponse[]>([]);

  // Reject invitation modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [loadingReject, setLoadingReject] = useState(false);

  // Leave organization modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leavingLoading, setLeavingLoading] = useState(false);

  // Filter for sent requests States
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("Pending");

  // Status options
  const statusOptions = [
    {
      value: "All",
      label: "Tất cả",
      icon: <MinusCircle className="h-4 w-4 text-gray-400 mr-1" />,
      color: "text-gray-700 bg-gray-100"
    },
    {
      value: "Pending",
      label: "Đang chờ duyệt",
      icon: <Hourglass className="h-4 w-4 text-yellow-400 mr-1" />,
      color: "text-yellow-700 bg-yellow-50"
    },
    {
      value: "Accepted",
      label: "Đã chấp nhận",
      icon: <BadgeCheck className="h-4 w-4 text-green-500 mr-1" />,
      color: "text-green-700 bg-green-50"
    },
    {
      value: "Rejected",
      label: "Đã từ chối",
      icon: <XCircle className="h-4 w-4 text-red-500 mr-1" />,
      color: "text-red-700 bg-red-50"
    },
    {
      value: "Canceled",
      label: "Đã hủy",
      icon: <MinusCircle className="h-4 w-4 text-gray-400 mr-1" />,
      color: "text-gray-700 bg-gray-100"
    }
  ];

  // Filtered requests based on status
  const filteredSentRequests = sentJoinRequests.filter((request) =>
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
      const res = await organizeInvitationService.getReceivedInvitationsByMemberId(memberId);
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
      const res = await organizeInvitationService.getSentRequestsByMemberId(memberId);
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
    const filtered = allBusinesses.filter(business =>
      business.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.businessOwnerName.toLowerCase().includes(searchQuery.toLowerCase())
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
    const filtered = allBusinesses.filter(business =>
      business.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.businessOwnerName.toLowerCase().includes(searchQuery.toLowerCase())
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
    const business = allBusinesses.find(b => b.id === businessId);
    if (!business || !userDetail?.id || !business.id) return;

    const result = await organizeInvitationService.requestJoinOrganization(userDetail.id, business.id);
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
          i.organizationName.trim().toLowerCase() === business.businessName.trim().toLowerCase() &&
          i.statusDisplay === "Pending"
      ) ||
      sentJoinRequests.some(
        (r) =>
          r.organizationName &&
          business.businessName &&
          business.id == r.businessOwnerId &&
          r.organizationName.trim().toLowerCase() === business.businessName.trim().toLowerCase() &&
          r.statusDisplay === "Pending"
      )
    );
  }

  if (isLoadingBusiness || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-clip-text text-transparent">
                {userDetail?.organization || "Tìm Kiếm Doanh Nghiệp"}
              </h1>
              <p className="text-muted-foreground text-base flex items-center gap-2">
                {currentBusiness ? "Thông tin doanh nghiệp" : "Khám phá và tham gia doanh nghiệp"}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="my-business" className="w-full">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
            <TabsList className="bg-white shadow-md border">
              <TabsTrigger value="my-business" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                <Building2 className="h-4 w-4" />
                {currentBusiness ? "Doanh Nghiệp" : "Tìm Kiếm"}
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                <Mail className="h-4 w-4" />
                Lời Mời ({invitations.length})
              </TabsTrigger>
              <TabsTrigger value="send-join-request" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                <Send className="h-4 w-4" />
                Yêu Cầu Đã Gửi ({sentJoinRequests.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-business" className="space-y-6 mt-6">
            {currentBusiness ? (
              // User has organization -> Show business detail
              <>
                <Card className="border-2 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-orange-50/30 pointer-events-none" />
                  <CardHeader className="relative">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/40 transform hover:scale-105 transition-transform">
                          <Building2 className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl mb-2">
                            {currentBusiness.businessName}
                          </CardTitle>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Chủ doanh nghiệp: <strong>{currentBusiness.businessOwnerName}</strong>
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            Tạo ngày: {new Date(currentBusiness.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <Badge className="text-sm px-4 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse mr-2" />
                          {userDetail?.roleName === "Member" ? "Thành Viên" :
                            userDetail?.roleName === "ProjectManager" ? "Quản Lý Dự Án" :
                              userDetail?.roleName === "BusinessOwner" ? "Chủ Doanh Nghiệp" :
                                userDetail?.roleName}
                        </Badge>
                        {userDetail?.roleName !== "BusinessOwner" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 transition-all"
                            onClick={() => setShowLeaveModal(true)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rời Doanh Nghiệp
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2 font-semibold">
                        <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        Tổng Thành Viên
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        {currentBusiness.memberCount}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        Đang hoạt động
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2 font-semibold">
                        <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                          <FolderKanban className="h-5 w-5 text-orange-600" />
                        </div>
                        Dự Án
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                        {currentBusiness.projectCount}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Đang triển khai
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              // User doesn't have organization -> Show search
              <>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-orange-500" />
                      Tìm Kiếm Doanh Nghiệp
                    </CardTitle>
                    <CardDescription className="text-base">
                      Bạn chưa tham gia doanh nghiệp nào. Tìm kiếm và gửi yêu cầu tham gia.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Nhập tên business để tìm kiếm..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                          className="pl-10 h-12 border-2 focus:border-orange-500"
                          disabled={isSearching}
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="h-12 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang tìm...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Tìm Kiếm
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* All Businesses Display hoặc Search Results */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-orange-500" />
                    {(searchQuery ? "Kết Quả Tìm Kiếm" : "Tất Cả Doanh Nghiệp") +
                      " (" + (searchQuery ? searchResults.length : allBusinesses.length) + ")"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(searchQuery ? searchResults : allBusinesses).map((business, index) => (
                      <Card key={business.id} className="border-2 hover:shadow-xl transition-all group">
                        <CardContent className="pt-6">
                          <div className="flex gap-4 items-start">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                              <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg mb-1 group-hover:text-orange-600 transition-colors truncate">
                                {business.businessName}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                Chủ doanh nghiệp: {business.businessOwnerName}
                              </p>
                              <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {business.memberCount} thành viên
                                </span>
                                <span className="flex items-center gap-1">
                                  <FolderKanban className="h-4 w-4" />
                                  {business.projectCount} dự án
                                </span>
                              </div>
                              <Button
                                onClick={() => handleJoinBusiness(business.id)}
                                size="sm"
                                className={
                                  `w-full shadow-lg shadow-orange-500/30 ` +
                                  (isPendingRequestOrInvite(business)
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-80"
                                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700")
                                }
                                disabled={isPendingRequestOrInvite(business)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {isPendingRequestOrInvite(business)
                                  ? "Không thể gửi yêu cầu"
                                  : "Gửi Yêu Cầu Tham Gia"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4 mt-6">
            {isLoadingInvitations ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải lời mời...</p>
              </div>
            ) : invitations.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg text-muted-foreground">Bạn chưa có lời mời nào</p>
                </CardContent>
              </Card>
            ) : (
              invitations.map((invitation) => (
                <Card key={invitation.id} className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="py-5 flex flex-col md:flex-row items-center gap-4">
                    {/* Tổ chức + Avatar chủ doanh nghiệp */}
                    <div className="flex gap-4 items-center w-full md:w-1/3">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                        {invitation.businessOwnerAvatar ? (
                          <img src={invitation.businessOwnerAvatar} alt="avatar" className="w-12 h-12 object-cover rounded-full" />
                        ) : (
                          <Mail className="h-7 w-7 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{invitation.organizationName}</h4>
                        <div className="text-xs text-gray-500 flex whitespace-nowrap">
                          Mời bởi chủ DN: <span className="font-semibold ml-1">{invitation.businessOwnerName}</span>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {invitation.businessOwnerEmail}
                        </div>
                      </div>
                    </div>
                    {/* Thông tin chi tiết và trạng thái */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center text-sm mb-0.5">
                        <span className="text-muted-foreground mr-3">Gửi tới: </span>
                        <span className="font-semibold">{invitation.memberEmail}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>Ngày mời: {new Date(invitation.createdAt).toLocaleDateString("vi-VN")}</span>
                        {invitation.statusDisplay === "Accepted" && invitation.respondedAt && (
                          <span>- Đã duyệt ngày: {new Date(invitation.respondedAt).toLocaleDateString("vi-VN")}</span>
                        )}
                      </div>
                    </div>
                    {/* Phản hồi */}
                    <div className="flex flex-col-reverse md:flex-col items-center gap-2 md:gap-0 min-w-[120px]">
                      <Badge
                        className={
                          invitation.statusDisplay === "Pending"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : invitation.statusDisplay === "Accepted"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-red-100 text-red-600 border-red-300"
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
                        <div className="flex gap-2 mt-1">
                          <Button
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Chấp Nhận
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRejectingId(invitation.id);
                              setShowRejectModal(true);
                            }}
                            size="sm"
                            className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Từ Chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="send-join-request" className="space-y-4 mt-6">
            {/* Filter Section */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Yêu cầu đã gửi</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Lọc theo:</span>
                <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                  <SelectTrigger className={`w-[160px] ${statusOptions.find(o => o.value === requestStatusFilter)?.color || ""}`}>
                    <SelectValue
                      placeholder="Chọn trạng thái"
                      className="flex items-center gap-1"
                    >
                      {statusOptions.find(o => o.value === requestStatusFilter)?.icon}
                      {statusOptions.find(o => o.value === requestStatusFilter)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className={`flex items-center gap-1 px-2 py-2 my-3 rounded-md cursor-pointer 
                          ${option.color}
                          ${requestStatusFilter === option.value ? "ring-2 ring-orange-500 font-bold shadow" : ""}`
                        }
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {requestStatusFilter === option.value && (
                          <CheckCircle className="ml-auto h-4 w-4 text-orange-600" />
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoadingRequests ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải yêu cầu...</p>
              </div>
            ) : filteredSentRequests.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg text-muted-foreground">
                    {requestStatusFilter === "All"
                      ? "Bạn chưa gửi yêu cầu nào"
                      : `Không có yêu cầu nào với trạng thái "${statusOptions.find(o => o.value === requestStatusFilter)?.label || requestStatusFilter}"`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSentRequests.map((request) => (
                <Card key={request.id} className="border-2 hover:shadow transition-all">
                  <CardContent className="py-5 flex flex-col md:flex-row items-center gap-4">
                    {/* Avatar, tên tổ chức */}
                    <div className="flex gap-4 items-center w-full md:w-1/3">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        {request.businessOwnerAvatar ? (
                          <img src={request.businessOwnerAvatar} alt="avatar" className="w-12 h-12 object-cover rounded-full" />
                        ) : (
                          <Send className="h-7 w-7 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{request.organizationName}</h4>
                        <div className="text-xs text-gray-500 flex whitespace-nowrap">
                          Chủ DN: <span className="font-semibold ml-1">{request.businessOwnerName}</span>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {request.businessOwnerEmail}
                        </div>
                      </div>
                    </div>
                    {/* trạng thái */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="text-xs text-gray-500">
                        Gửi ngày: {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                      {request.statusDisplay === "Accepted" && (
                        <div className="text-xs text-green-600">Đã được duyệt: {request.respondedAt ? new Date(request.respondedAt).toLocaleDateString("vi-VN") : null}</div>
                      )}
                      {request.statusDisplay === "Rejected" && (
                        <div className="text-xs text-red-600">Bị từ chối</div>
                      )}
                      {request.statusDisplay === "Canceled" && (
                        <div className="text-xs text-gray-400">Đã hủy</div>
                      )}
                    </div>
                    <Badge
                      className={
                        request.statusDisplay === "Pending"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : request.statusDisplay === "Accepted"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : request.statusDisplay === "Rejected"
                              ? "bg-red-100 text-red-600 border-red-300"
                              : "bg-gray-100 text-red-600 border-red-300"
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
