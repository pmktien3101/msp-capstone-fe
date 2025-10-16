"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Users,
  Briefcase,
  FolderKanban,
  Mail,
  Check,
  X,
  Send,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
  Loader2,
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

interface BusinessInvitation {
  id: string;
  businessName: string;
  invitedBy: string;
  invitedAt: string;
  status: "pending";
}

interface SentJoinRequest {
  id: string;
  name: string;
  sentAt: string;
}

export default function BusinessDashboard() {
  const { userDetail, isLoading, error, refreshUserDetail } = useUserDetail();

  // States
  const [currentBusiness, setCurrentBusiness] = useState<BusinessResponse | null>(null);
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BusinessResponse[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessResponse[]>([]);
  const [sentJoinRequests, setSentJoinRequests] = useState<SentJoinRequest[]>([]);

  // Loading states
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

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
      fetchInvitations();
      fetchSentRequests();
    }
  }, [userDetail?.organization, userDetail?.managedBy]);

  const fetchInvitations = async () => {
    setIsLoadingInvitations(true);
    try {
      // TODO: Replace with actual API call
      setInvitations([]);
    } catch {
      toast.error("Không thể tải danh sách lời mời");
    }
    setIsLoadingInvitations(false);
  };

  const fetchSentRequests = async () => {
    setIsLoadingRequests(true);
    try {
      // TODO: Replace with actual API call
      setSentJoinRequests([]);
    } catch {
      toast.error("Không thể tải danh sách yêu cầu đã gửi");
    }
    setIsLoadingRequests(false);
  };

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

  const handleAcceptInvitation = async (invitationId: string) => {
    setInvitations(invitations.filter((inv) => inv.id !== invitationId));
    toast.success("Đã chấp nhận lời mời tham gia");
    await refreshUserDetail();
  };

  const handleRejectInvitation = async (invitationId: string) => {
    setInvitations(invitations.filter((inv) => inv.id !== invitationId));
    toast.success("Đã từ chối lời mời");
  };

  const handleJoinBusiness = async (businessId: string) => {
    const business = searchResults.find((b) => b.id === businessId);
    if (business) {
      // TODO: Call API to send join request
      const newRequest: SentJoinRequest = {
        id: Date.now().toString(),
        name: business.businessName,
        sentAt: new Date().toISOString(),
      };
      setSentJoinRequests([newRequest, ...sentJoinRequests]);
      toast.success("Đã gửi yêu cầu tham gia");
    }
  };

  const handleLeaveBusiness = async () => {
    if (!window.confirm("Bạn có chắc muốn rời doanh nghiệp hiện tại?")) return;
    // TODO: Call API to leave business
    setCurrentBusiness(null);
    toast.success("Đã rời doanh nghiệp");
    await refreshUserDetail();
  };

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
                {userDetail?.organization || "Tìm Kiếm Tổ Chức"}
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
                            Quản lý bởi: {currentBusiness.businessOwnerName}
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
                            onClick={handleLeaveBusiness}
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
                      Tìm Kiếm Business
                    </CardTitle>
                    <CardDescription className="text-base">
                      Bạn chưa tham gia business nào. Tìm kiếm và gửi yêu cầu tham gia.
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

                {/* All Businesses Display */}
                {!searchQuery && allBusinesses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-orange-500" />
                      Tất Cả Doanh Nghiệp ({allBusinesses.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allBusinesses.map((business, index) => (
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
                                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Gửi Yêu Cầu Tham Gia
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-500" />
                      Kết Quả Tìm Kiếm ({searchResults.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.map((business) => (
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
                                  Quản lý: {business.businessOwnerName}
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
                                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Gửi Yêu Cầu Tham Gia
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
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
                  <p className="text-lg text-muted-foreground">
                    Bạn chưa có lời mời nào
                  </p>
                </CardContent>
              </Card>
            ) : (
              invitations.map((invitation) => (
                <Card key={invitation.id} className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-1">
                            {invitation.businessName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Được mời bởi: {invitation.invitedBy}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(invitation.invitedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAcceptInvitation(invitation.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Chấp Nhận
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRejectInvitation(invitation.id)}
                          className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Từ Chối
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="send-join-request" className="space-y-4 mt-6">
            {isLoadingRequests ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải yêu cầu...</p>
              </div>
            ) : sentJoinRequests.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg text-muted-foreground">
                    Bạn chưa gửi yêu cầu nào
                  </p>
                </CardContent>
              </Card>
            ) : (
              sentJoinRequests.map((request) => (
                <Card key={request.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <Send className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{request.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Gửi ngày: {new Date(request.sentAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        Đang chờ duyệt
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
