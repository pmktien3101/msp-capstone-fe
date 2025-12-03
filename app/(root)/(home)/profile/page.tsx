"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Camera,
  Save,
  X,
  Mail,
  Phone,
  Edit3,
  Shield,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";
import { useUserDetail } from "@/contexts/UserContext";
import { uploadFileToCloudinary } from "@/services/uploadFileService";
import { userService } from "@/services/userService";
import { toast } from "react-toastify";
import "@/app/styles/profile.scss";

type UserRole = "member" | "admin" | "business_owner" | "project_manager";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
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
    phoneNumber = "",
  } = useUser();
  const { user } = useAuth();
  const { userDetail, refreshUserDetail } = useUserDetail();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    avatarUrl
  );
  const [isSaving, setIsSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(
    null
  );

  useEffect(() => {
    setProfile({
      id: userId,
      name: fullName,
      email: email,
      phoneNumber: userDetail?.phoneNumber || phoneNumber || "",
      avatarUrl: avatarUrl,
      bio: "",
      role: role,
      businessName: "",
      businessIndustry: "",
      businessSize: "",
      department: "",
      projectCount: undefined,
    });
    setAvatarPreview(avatarUrl);
  }, [
    userId,
    email,
    role,
    avatarUrl,
    fullName,
    userDetail?.phoneNumber,
    phoneNumber,
  ]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsSaving(true);
        const uploadedUrl = await uploadFileToCloudinary(file);
        setAvatarPreview(uploadedUrl);
        toast.success("Đã tải ảnh đại diện thành công");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Không thể tải ảnh đại diện");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEditClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      setOriginalProfile(profile);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setAvatarPreview(originalProfile?.avatarUrl);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile || !userId) return;

    try {
      setIsSaving(true);

      const result = await userService.updateUserProfile(userId, {
        fullName: profile.name,
        phoneNumber: profile.phoneNumber,
        avatarUrl: avatarPreview,
      });

      if (result.success) {
        toast.success(result.message || "Cập nhật hồ sơ thành công");
        setIsEditing(false);

        const { setUserData } = useUser.getState();
        setUserData({
          userId,
          email,
          fullName: profile.name,
          role,
          avatarUrl: avatarPreview || avatarUrl,
          phoneNumber: profile.phoneNumber,
        });

        await refreshUserDetail();
      } else {
        toast.error(result.error || "Không thể cập nhật hồ sơ");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Đã xảy ra lỗi khi lưu hồ sơ");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<
      string,
      { label: string; className: string; icon: React.ReactNode }
    > = {
      member: {
        label: "Member",
        className: "role-badge member",
        icon: <User size={12} />,
      },
      admin: {
        label: "Admin",
        className: "role-badge admin",
        icon: <Shield size={12} />,
      },
      business_owner: {
        label: "Business Owner",
        className: "role-badge owner",
        icon: <Sparkles size={12} />,
      },
      project_manager: {
        label: "Project Manager",
        className: "role-badge manager",
        icon: <CheckCircle2 size={12} />,
      },
    };
    return (
      roleConfig[role] || {
        label: role,
        className: "role-badge default",
        icon: <User size={12} />,
      }
    );
  };

  if (!profile) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <span>Loading profile...</span>
      </div>
    );
  }

  const roleInfo = getRoleBadge(profile.role);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-page">
      {/* Background decoration */}
      <div className="profile-bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-header-text">
              <h1 className="profile-title">
                <User className="title-icon" />
                My Profile
              </h1>
              <p className="profile-subtitle">
                Manage your personal information and account settings
              </p>
            </div>
            <div className="profile-header-actions">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="btn-cancel"
                    disabled={isSaving}
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditClick}
                    className="btn-save"
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEditClick} className="btn-edit">
                  <Edit3 size={16} />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card main-card">
            <div className="card-glow"></div>
            <div className={`profile-hero ${isEditing ? "editing" : ""}`}>
              {/* Avatar Section */}
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  <div className="avatar-ring">
                    <div className="avatar-container">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt={profile.name || "avatar"}
                          className="avatar-image"
                        />
                      ) : (
                        <div className="avatar-fallback">
                          {getInitials(profile.name)}
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="avatar-upload-btn"
                    >
                      <Camera size={18} />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <div className="avatar-status">
                  <span className={roleInfo.className}>
                    {roleInfo.icon}
                    {roleInfo.label}
                  </span>
                </div>
              </div>

              {/* Info Section */}
              <div className="info-section">
                <h2 className="user-name">
                  {profile.name || "No name provided"}
                </h2>
                <div className="user-meta">
                  <div className="meta-item">
                    <Mail size={14} />
                    <span>{profile.email || "No email provided"}</span>
                  </div>
                  {profile.phoneNumber && (
                    <div className="meta-item">
                      <Phone size={14} />
                      <span>{profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile.businessName && (
                    <div className="meta-item">
                      <Building2 size={14} />
                      <span>{profile.businessName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="profile-card details-card">
            <div className="card-header">
              <div className="card-icon">
                <User size={20} />
              </div>
              <div className="card-title-group">
                <h3 className="card-title">Personal Information</h3>
                <p className="card-description">Your basic profile details</p>
              </div>
            </div>

            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <Label htmlFor="name" className="form-label">
                    <User size={14} />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`form-input ${isEditing ? "editable" : ""}`}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="email" className="form-label">
                    <Mail size={14} />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="form-input locked"
                    placeholder="Email address"
                  />
                  <span className="input-hint">Email cannot be changed</span>
                </div>

                <div className="form-group">
                  <Label htmlFor="phone" className="form-label">
                    <Phone size={14} />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) =>
                      setProfile({ ...profile, phoneNumber: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`form-input ${isEditing ? "editable" : ""}`}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="role" className="form-label">
                    <Shield size={14} />
                    Account Role
                  </Label>
                  <div className="role-display">
                    <span className={roleInfo.className}>
                      {roleInfo.icon}
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
