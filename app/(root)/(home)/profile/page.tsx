"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { User, Building2, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";

type UserRole = "member" | "admin" | "business_owner" | "project_manager";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio: string;
  role: UserRole | string;
  businessName?: string;
  businessIndustry?: string;
  businessSize?: string;
  department?: string;
  projectCount?: number;
}

export default function ProfilePage() {
  const { userId = "", email = "", role = "", avatarUrl = "", fullName = "" } = useUser();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(avatarUrl);

  useEffect(() => {
    setProfile({
      id: userId,
      name: fullName,
      email: email,
      phone: user?.phoneNumber || "",
      avatar: avatarUrl,
      bio: "",
      role: role,
      businessName: "",
      businessIndustry: "",
      businessSize: "",
      department: "",
      projectCount: undefined,
    });
    setAvatarPreview(avatarUrl);
  }, [userId, email, role, avatarUrl, fullName]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (profile) {
      setProfile({ ...profile, avatar: avatarPreview });
      setIsEditing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; color: string }> = {
      member: {
        label: "Thành Viên",
        color: "bg-orange-100 text-orange-700 border-orange-200",
      },
      admin: {
        label: "Quản Trị Viên",
        color: "bg-orange-500 text-white border-orange-500",
      },
      business_owner: {
        label: "Chủ Doanh Nghiệp",
        color: "bg-orange-500 text-white border-orange-500",
      },
      project_manager: {
        label: "Quản Lý Dự Án",
        color: "bg-orange-500 text-white border-orange-500",
      },
    };
    return (
      roleConfig[role] || {
        label: role,
        color: "bg-gray-200 text-gray-700 border-gray-300",
      }
    );
  };

  if (!profile) {
    return <div>Đang tải thông tin...</div>;
  }

  const roleInfo = getRoleBadge(profile.role);

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hồ Sơ Cá Nhân</h1>
          <p className="text-lg">Quản lý thông tin cá nhân</p>
        </div>

        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="border-orange-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-orange-300">
                    <AvatarImage
                      src={avatarPreview || "/placeholder.svg"}
                      alt={profile.name || "avatar"}
                    />
                    <AvatarFallback className="text-2xl bg-orange-100 text-orange-700">
                      {profile.name
                        ? profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors border-2 border-white"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-orange-700">
                      {profile.name || "(Chưa có tên)"}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full border text-sm font-semibold ${roleInfo.color}`}
                    >
                      {roleInfo.label}
                    </span>
                  </div>
                  <p className="text-orange-700">
                    {profile.email || "(Chưa có email)"}
                  </p>
                  {profile.businessName && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                      <Building2 className="h-4 w-4 text-orange-500" />
                      <span>{profile.businessName}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  className={`gap-2 ${
                    isEditing
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-orange-400 hover:bg-orange-500"
                  } text-white`}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu Thay Đổi
                    </>
                  ) : (
                    "Chỉnh Sửa"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông Tin Cơ Bản
              </CardTitle>
              <CardDescription className="">
                Thông tin cá nhân và liên hệ của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-orange-700">
                    Họ và Tên
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="focus:border-orange-500"
                    placeholder="(Chưa có tên)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-orange-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-orange-100 text-orange-700"
                    placeholder="(Chưa có email)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-orange-700">
                    Số Điện Thoại
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="focus:border-orange-500"
                    placeholder="(Chưa có số điện thoại)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-orange-700">
                  Giới Thiệu
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                  className="focus:border-orange-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
