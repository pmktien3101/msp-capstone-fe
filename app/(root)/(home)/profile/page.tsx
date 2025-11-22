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
  const {
    userId = "",
    email = "",
    role = "",
    avatarUrl = "",
    fullName = "",
  } = useUser();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    avatarUrl
  );

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
    // Return semantic class names so styling can be moved to external CSS
    const roleConfig: Record<string, { label: string; className: string }> = {
      member: {
        label: "Thành Viên",
        className: "role-badge member",
      },
      admin: {
        label: "Quản Trị Viên",
        className: "role-badge admin",
      },
      business_owner: {
        label: "Chủ Doanh Nghiệp",
        className: "role-badge owner",
      },
      project_manager: {
        label: "Quản Lý Dự Án",
        className: "role-badge manager",
      },
    };
    return (
      roleConfig[role] || {
        label: role,
        className: "role-badge default",
      }
    );
  };

  if (!profile) {
    return <div>Đang tải thông tin...</div>;
  }

  const roleInfo = getRoleBadge(profile.role);

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1 className="profile-title">Profile</h1>
            <p className="profile-subtitle">Manage your personal information</p>
          </div>

          <div className="profile-sections">
            {/* Profile Header Card */}
            <Card className="card profile-header-card">
              <CardContent className="card-content">
                <div
                  className={`profile-header-inner ${
                    isEditing ? "editing" : ""
                  }`}
                >
                  <div className="profile-avatar-wrap">
                    <Avatar className="profile-avatar">
                      <AvatarImage
                        src={avatarPreview || "/placeholder.svg"}
                        alt={profile.name || "avatar"}
                      />
                      <AvatarFallback className="avatar-fallback">
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
                        className="avatar-upload-label"
                      >
                        <Camera className="icon camera-icon" />
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

                  <div className="profile-info">
                    <div className="profile-name-row">
                      <h2 className="profile-name">
                        {profile.name || "(No name)"}
                      </h2>
                      <span className={roleInfo.className}>
                        {roleInfo.label}
                      </span>
                    </div>
                    <p className="profile-email">
                      {profile.email || "(No email)"}
                    </p>
                    {profile.businessName && (
                      <div className="business-info">
                        <Building2 className="icon building-icon" />
                        <span>{profile.businessName}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() =>
                      isEditing ? handleSave() : setIsEditing(true)
                    }
                    className={`profile-action-button ${
                      isEditing ? "editing" : ""
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Save className="icon save-icon" />
                        Save Changes
                      </>
                    ) : (
                      "Edit Profile"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="card profile-basic-card">
              <CardHeader>
                <CardTitle className="card-title">Basic Information</CardTitle>
                <CardDescription>
                  Your personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="card-body">
                <div className="profile-grid">
                  <div className="field-group">
                    <Label htmlFor="name" className="profile-label">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      disabled={!isEditing}
                      className="profile-input"
                      placeholder="(No name provided)"
                    />
                  </div>

                  <div className="field-group">
                    <Label htmlFor="email" className="profile-label">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="profile-input disabled"
                      placeholder="(No email provided)"
                    />
                  </div>

                  <div className="field-group">
                    <Label htmlFor="phone" className="profile-label">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      className="profile-input"
                      placeholder="(No phone number provided)"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <Label htmlFor="bio" className="profile-label">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Write a few lines about yourself..."
                    className="profile-textarea"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Page and container */
        .profile-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #fffaf0 0%, #fff7ed 100%);
          padding-bottom: 3rem;
        }

        .profile-container {
          max-width: 72rem; /* a little wider */
          margin: 2.5rem auto;
          padding: 2rem;
        }

        .profile-header {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .profile-title {
          font-size: 2.125rem;
          line-height: 1.05;
          font-weight: 800;
          color: #9a3412; /* deep orange */
          letter-spacing: -0.02em;
        }

        .profile-subtitle {
          font-size: 1rem;
          color: #92400e;
        }

        /* Sections & cards */
        .profile-sections {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 1024px) {
          .profile-sections {
            gap: 1.75rem;
          }
        }

        .card {
          border-radius: 0.75rem;
          overflow: hidden;
          background: linear-gradient(180deg, #ffffff 0%, #fffcfb 100%);
          border: 1px solid rgba(249, 115, 22, 0.08);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
        }

        .card .card-content {
          padding: 1.25rem;
        }

        /* Header inner layout */
        .profile-header-inner {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }

        @media (min-width: 640px) {
          .profile-header-inner {
            flex-direction: row;
            align-items: center;
          }
          .profile-info {
            flex: 1;
          }
        }

        /* Avatar */
        .profile-avatar-wrap {
          position: relative;
        }

        /* Avatar sizes: mobile-friendly default, larger on desktop */
        .profile-avatar {
          width: 140px;
          height: 140px;
          border-radius: 9999px;
          overflow: hidden;
          display: inline-block;
          border: 6px solid rgba(253, 186, 116, 0.95);
          box-shadow: 0 10px 26px rgba(34, 11, 0, 0.08);
        }

        .profile-avatar img,
        .profile-avatar > div {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.25rem;
          font-weight: 700;
          background: rgba(255, 247, 237, 0.95);
          color: #9a3412;
        }

        .avatar-upload-label {
          position: absolute;
          right: -10px;
          bottom: -10px;
          width: 52px;
          height: 52px;
          border-radius: 9999px;
          background: #fb923c;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 3px solid #fff;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .avatar-upload-label:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(34, 11, 0, 0.14);
        }

        /* When editing, keep avatar a bit smaller so the form layout is comfortable */
        .profile-header-inner.editing .profile-avatar {
          width: 96px;
          height: 96px;
          border-width: 4px;
        }
        .profile-header-inner.editing .avatar-fallback {
          font-size: 1.5rem;
        }
        .profile-header-inner.editing .avatar-upload-label {
          right: -6px;
          bottom: -6px;
          width: 36px;
          height: 36px;
        }

        @media (min-width: 640px) {
          .profile-avatar {
            width: 220px;
            height: 220px;
          }
          .avatar-fallback {
            font-size: 3rem;
          }
          .avatar-upload-label {
            right: -12px;
            bottom: -12px;
            width: 64px;
            height: 64px;
          }
          .profile-header-inner.editing .profile-avatar {
            width: 120px;
            height: 120px;
          }
          .profile-header-inner.editing .avatar-fallback {
            font-size: 1.75rem;
          }
          .profile-header-inner.editing .avatar-upload-label {
            right: -8px;
            bottom: -8px;
            width: 40px;
            height: 40px;
          }
        }

        /* Info */
        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .profile-name {
          font-size: 1.125rem;
          font-weight: 800;
          color: #92400e;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.28rem 0.7rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.8rem;
          /* Add subtle border to make the badge more defined */
          border: 1px solid rgba(42, 20, 15, 0.1);
        }
        .role-badge.member {
          background: #fff7ed;
          color: #92400e;
          border: 1px solid rgba(253, 216, 167, 0.6);
        }
        .role-badge.admin,
        .role-badge.owner,
        .role-badge.manager {
          background: #fb923c;
          color: #fff;
        }

        .profile-email {
          color: #7c2d12;
          margin-top: 0.25rem;
        }
        .business-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #c2410c;
          font-size: 0.95rem;
          margin-top: 0.5rem;
        }

        /* Action button */
        .profile-action-button {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.9rem;
          border-radius: 0.55rem;
          background: linear-gradient(180deg, #fb923c, #f97316);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          box-shadow: 0 8px 18px rgba(249, 115, 22, 0.18);
        }
        .profile-action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(249, 115, 22, 0.18);
        }
        .profile-action-button.editing {
          background: linear-gradient(180deg, #f97316, #ea580c);
        }

        /* Form grid */
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .profile-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .profile-label {
          color: #92400e;
          font-weight: 700;
          font-size: 0.9rem;
        }

        /* Inputs */
        .profile-input,
        .profile-textarea {
          padding: 0.6rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(249, 115, 22, 0.12);
          background: #fff;
          color: #111827;
          transition: box-shadow 0.12s ease, border-color 0.12s ease;
        }
        .profile-input:focus,
        .profile-textarea:focus {
          outline: none;
          border-color: rgba(249, 115, 22, 0.36);
          box-shadow: 0 6px 18px rgba(249, 115, 22, 0.08);
        }
        .profile-input.disabled {
          background: linear-gradient(180deg, #fff7ed, #fff7ed);
          color: #7c2d12;
        }

        /* Small utilities */
        .icon {
          display: inline-block;
          vertical-align: middle;
        }
        .user-icon,
        .building-icon {
          opacity: 0.9;
        }
      `}</style>
    </>
  );
}
