"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Camera,
  Save,
  Mail,
  Phone,
  FileText,
  Pencil,
} from "lucide-react";
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
import "@/app/styles/profile.scss";

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
    const roleConfig: Record<string, { label: string; className: string }> = {
      member: {
        label: "Member",
        className: "role-badge member",
      },
      admin: {
        label: "Admin",
        className: "role-badge admin",
      },
      business_owner: {
        label: "Owner",
        className: "role-badge owner",
      },
      project_manager: {
        label: "Manager",
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
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <span>Loading profile...</span>
      </div>
    );
  }

  const roleInfo = getRoleBadge(profile.role);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>

        <div className="profile-sections">
          {/* Profile Header Card */}
          <Card className="profile-header-card">
            <CardContent className="card-content">
              <div
                className={`profile-header-inner ${isEditing ? "editing" : ""}`}
              >
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar-container">
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
                  </div>
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="avatar-upload-btn"
                    >
                      <Camera />
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
                      {profile.name || "No name"}
                    </h2>
                    <span className={roleInfo.className}>{roleInfo.label}</span>
                  </div>
                  <p className="profile-email">{profile.email || "No email"}</p>
                  {profile.businessName && (
                    <div className="business-info">
                      <Building2 />
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
                      <Save />
                      Save
                    </>
                  ) : (
                    <>
                      <Pencil />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="profile-basic-card">
            <CardHeader>
              <div className="card-title-wrapper">
                <div className="card-icon">
                  <User />
                </div>
                <CardTitle className="card-title">Basic Information</CardTitle>
              </div>
              <CardDescription className="card-description">
                Your personal details and contact info
              </CardDescription>
            </CardHeader>
            <CardContent className="card-body">
              <div className="profile-grid">
                <div className="field-group">
                  <Label htmlFor="name" className="profile-label">
                    <User /> Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="profile-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="field-group">
                  <Label htmlFor="email" className="profile-label">
                    <Mail /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="profile-input"
                    placeholder="No email"
                  />
                </div>

                <div className="field-group">
                  <Label htmlFor="phone" className="profile-label">
                    <Phone /> Phone Number
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
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="field-group full-width">
                <Label htmlFor="bio" className="profile-label">
                  <FileText /> Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us a bit about yourself..."
                  className="profile-textarea"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
