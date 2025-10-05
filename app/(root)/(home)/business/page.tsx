"use client";

import { useState } from "react";
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
  UserPlus,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data types
interface Business {
  id: string;
  name: string;
  industry: string;
  memberCount: number;
  projectManagerCount: number;
  projectCount: number;
  logo?: string;
}

interface BusinessInvitation {
  id: string;
  businessName: string;
  businessIndustry: string;
  invitedBy: string;
  invitedAt: string;
  status: "pending";
}

interface SearchResult {
  id: string;
  name: string;
  industry: string;
  memberCount: number;
  description: string;
}

interface SentInvitation {
  id: string;
  recipientName: string;
  recipientEmail: string;
  sentAt: string;
  status: "pending" | "accepted" | "rejected";
}

export default function BusinessDashboard() {
  // Mock current user's business (null if not joined any business)
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>({
    id: "1",
    name: "Tech Innovations Vietnam",
    industry: "Công nghệ thông tin",
    memberCount: 24,
    projectManagerCount: 5,
    projectCount: 12,
  });

  // Mock invitations
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([
    {
      id: "1",
      businessName: "Digital Marketing Pro",
      businessIndustry: "Marketing",
      invitedBy: "Nguyễn Văn A",
      invitedAt: "2024-01-15",
      status: "pending",
    },
    {
      id: "2",
      businessName: "E-commerce Solutions",
      businessIndustry: "Thương mại điện tử",
      invitedBy: "Trần Thị B",
      invitedAt: "2024-01-14",
      status: "pending",
    },
  ]);

  const [sentInvitations, setSentInvitations] = useState<SentInvitation[]>([
    {
      id: "1",
      recipientName: "Lê Văn C",
      recipientEmail: "levanc@example.com",
      sentAt: "2024-01-16",
      status: "pending",
    },
    {
      id: "2",
      recipientName: "Phạm Thị D",
      recipientEmail: "phamthid@example.com",
      sentAt: "2024-01-15",
      status: "accepted",
    },
  ]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  // Thêm state cho gửi yêu cầu join
  const [requestBusinessName, setRequestBusinessName] = useState("");
  const [requestBusinessIndustry, setRequestBusinessIndustry] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [sentJoinRequests, setSentJoinRequests] = useState<
    {
      id: string;
      name: string;
      industry: string;
      sentAt: string;
    }[]
  >([]);

  // Mock search function
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: "1",
        name: "Startup Hub Vietnam",
        industry: "Công nghệ",
        memberCount: 15,
        description: "Cộng đồng startup công nghệ hàng đầu Việt Nam",
      },
      {
        id: "2",
        name: "Creative Agency",
        industry: "Thiết kế & Sáng tạo",
        memberCount: 30,
        description: "Agency chuyên về thiết kế và marketing sáng tạo",
      },
      {
        id: "3",
        name: "Finance Solutions",
        industry: "Tài chính",
        memberCount: 45,
        description: "Giải pháp tài chính doanh nghiệp",
      },
    ];

    setSearchResults(mockResults);
  };

  const handleAcceptInvitation = (invitationId: string) => {
    console.log("[v0] Accepting invitation:", invitationId);
    setInvitations(invitations.filter((inv) => inv.id !== invitationId));
    // In real app, would update currentBusiness here
  };

  const handleRejectInvitation = (invitationId: string) => {
    console.log("[v0] Rejecting invitation:", invitationId);
    setInvitations(invitations.filter((inv) => inv.id !== invitationId));
  };

  const handleJoinBusiness = (businessId: string) => {
    const business = searchResults.find((b) => b.id === businessId);
    if (!business) return;

    // Thêm vào danh sách yêu cầu đã gửi
    const newRequest = {
      id: Date.now().toString(),
      name: business.name,
      industry: business.industry,
      sentAt: new Date().toISOString().split("T")[0],
    };
    setSentJoinRequests([newRequest, ...sentJoinRequests]);
    console.log("[v0] Sent join request to:", business.name);
  };

  const handleSendInvitation = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const newInvitation: SentInvitation = {
      id: Date.now().toString(),
      recipientName: inviteName,
      recipientEmail: inviteEmail,
      sentAt: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    setSentInvitations([newInvitation, ...sentInvitations]);
    setInviteEmail("");
    setInviteName("");
    console.log("[v0] Sent invitation to:", inviteEmail);
  };

  const handleSendJoinRequest = () => {
    if (!requestBusinessName.trim() || !requestBusinessIndustry.trim()) return;
    const newRequest = {
      id: Date.now().toString(),
      name: requestBusinessName,
      industry: requestBusinessIndustry,
      reason: requestReason,
      sentAt: new Date().toISOString().split("T")[0],
    };
    setSentJoinRequests([newRequest, ...sentJoinRequests]);
    setRequestBusinessName("");
    setRequestBusinessIndustry("");
    setRequestReason("");
    console.log("[v0] Sent join request to:", requestBusinessName);
  };

  // Thêm hàm xử lý rời doanh nghiệp
  const handleLeaveBusiness = () => {
    if (window.confirm("Bạn có chắc muốn rời doanh nghiệp hiện tại?")) {
      setCurrentBusiness(null);
      // Có thể reset các state liên quan nếu cần
      console.log("[v0] Đã rời doanh nghiệp hiện tại");
    }
  };

  const isMember = !currentBusiness;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">Doanh nghiệp</h1>
          <p className="text-muted-foreground text-lg">
            Thông tin doanh nghiệp đang tham gia và lời mời tham gia
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <Tabs defaultValue="my-business" className="w-full">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <TabsList>
                <TabsTrigger value="my-business" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Doanh Nghiệp
                </TabsTrigger>
                <TabsTrigger value="invitations" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Nhận Lời Mời
                </TabsTrigger>
                <TabsTrigger value="send-join-request" className="gap-2">
                  <Send className="h-4 w-4" />
                  Gửi Yêu Cầu Tham Gia
                </TabsTrigger>
              </TabsList>

              <Dialog
                open={isSearchDialogOpen}
                onOpenChange={setIsSearchDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Search className="h-4 w-4" />
                    Tìm Kiếm Business
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tìm Kiếm Business</DialogTitle>
                    <DialogDescription>
                      Tìm kiếm và xem thông tin các business khác trong hệ thống
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Tìm kiếm theo tên business, ngành nghề..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                          className="pl-9"
                        />
                      </div>
                      <Button onClick={handleSearch}>Tìm Kiếm</Button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Kết Quả Tìm Kiếm ({searchResults.length})
                        </h3>
                        {searchResults.map((business) => (
                          <Card key={business.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3 flex-1">
                                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold">
                                      {business.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {business.industry} •{" "}
                                      {business.memberCount} thành viên
                                    </p>
                                    <p className="text-sm mt-1.5">
                                      {business.description}
                                    </p>
                                  </div>
                                </div>
                                {!currentBusiness && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleJoinBusiness(business.id)
                                    }
                                    className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                                  >
                                    Gửi Yêu Cầu
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {searchQuery && searchResults.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Không tìm thấy kết quả phù hợp
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="my-business" className="space-y-6 mt-6">
              {currentBusiness ? (
                <>
                  {/* Business Info Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">
                              {currentBusiness.name}
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                              {currentBusiness.industry}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="secondary"
                            className="text-sm bg-orange-100 text-orange-700 border-orange-200"
                          >
                            Active Member
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                            onClick={handleLeaveBusiness}
                          >
                            Rời Doanh Nghiệp
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Tổng Thành Viên
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-orange-500">
                          {currentBusiness.memberCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Thành viên đang hoạt động
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Project Manager
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-orange-500">
                          {currentBusiness.projectManagerCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Người quản lý dự án
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-2">
                          <FolderKanban className="h-4 w-4" />
                          Dự Án
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-orange-500">
                          {currentBusiness.projectCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Dự án đang triển khai
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <>
                  {/* No Business - Search Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tìm Kiếm Business</CardTitle>
                      <CardDescription>
                        Bạn chưa tham gia business nào. Tìm kiếm và gửi yêu cầu
                        tham gia business phù hợp với bạn.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Tìm kiếm theo tên business, ngành nghề..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSearch()
                            }
                            className="pl-9"
                          />
                        </div>
                        <Button onClick={handleSearch}>Tìm Kiếm</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">
                        Kết Quả Tìm Kiếm
                      </h3>
                      {searchResults.map((business) => (
                        <Card key={business.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4 flex-1">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-lg">
                                    {business.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {business.industry} • {business.memberCount}{" "}
                                    thành viên
                                  </p>
                                  <p className="text-sm mt-2">
                                    {business.description}
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleJoinBusiness(business.id)}
                                className="ml-4 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                              >
                                Gửi Yêu Cầu
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4 mt-6">
              {invitations.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-orange-600">
                      Lời Mời Tham Gia Business ({invitations.length})
                    </h3>
                  </div>

                  {invitations.map((invitation) => (
                    <Card key={invitation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-lg">
                                  {invitation.businessName}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                                >
                                  Chờ phản hồi
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {invitation.businessIndustry}
                              </p>
                              <p className="text-sm mt-2">
                                Được mời bởi{" "}
                                <span className="font-medium">
                                  {invitation.invitedBy}
                                </span>{" "}
                                •{" "}
                                {new Date(
                                  invitation.invitedAt
                                ).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAcceptInvitation(invitation.id)
                              }
                              className="gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Chấp Nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRejectInvitation(invitation.id)
                              }
                              className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <X className="h-4 w-4" />
                              Từ Chối
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Không Có Lời Mời Nào
                      </h3>
                      <p className="text-muted-foreground">
                        Bạn chưa nhận được lời mời tham gia business nào
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="send-join-request" className="space-y-4 mt-6">
              {/* Bỏ form tự nhập gửi yêu cầu tham gia */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-orange-600">
                  Yêu Cầu Đã Gửi ({sentJoinRequests.length})
                </h3>
                {sentJoinRequests.length > 0 ? (
                  sentJoinRequests.map((req) => (
                    <Card key={req.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-lg">
                                  {req.name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                                >
                                  Chờ phản hồi
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {req.industry}
                              </p>
                              <p className="text-sm mt-2">
                                Gửi lúc{" "}
                                {new Date(req.sentAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Chưa có yêu cầu nào được gửi đi
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
