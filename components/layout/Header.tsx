"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/lib/rbac";
import { useAuth } from "@/hooks/useAuth";
import { useUserDetail } from "@/contexts/UserContext";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { User, LogOut, ChevronDown, Settings, LucideKeyRound } from "lucide-react";
import "@/app/styles/header.scss";
import { MdOutlinePassword, MdPassword } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { email, fullName, role, logout } = useUser();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { userDetail } = useUserDetail();
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.fullName) {
      return user.fullName;
    }
    if (email) {
      return email.split("@")[0];
    }
    return "User";
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case UserRole.PROJECT_MANAGER:
        return "Project Manager";
      case UserRole.ADMIN:
        return "Administrator";
      case UserRole.BUSINESS_OWNER:
        return "Business Owner";
      case UserRole.MEMBER:
        return "Team Member";
      default:
        return "User";
    }
  };

  // Lấy chữ cái đầu từ tên user (email nếu không có tên)
  const getInitial = () => {
    const name = getUserDisplayName();
    return name ? name[0].toUpperCase() : "U";
  };

  return (
    <header className="header-container">
      {/* Logo and Brand */}
      <div className="header-brand" onClick={() => router.push("/")}>
        <div className="brand-logo">
          <Image src="/logo.png" alt="MSP Logo" width={42} height={38} />
        </div>
        <div className="brand-text">
          <span className="brand-name">MSP</span>
          <span className="brand-tagline">Project Hub</span>
        </div>
      </div>

      {/* Right Side - Notify, User */}
      <div className="header-right">
        {/* Notification Bell - Real-time */}
        <div className="header-actions">
          <NotificationBell />
        </div>

        {/* Divider */}
        <div className="header-divider" />

        {/* User Profile Section */}
        <div className="user-profile-section" ref={dropdownRef}>
          <div
            className={`user-profile-trigger ${showUserMenu ? "active" : ""}`}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <Avatar className="user-avatar">
              <AvatarImage
                src={userDetail?.avatarUrl || user?.avatarUrl}
                alt={getUserDisplayName()}
              />
              <AvatarFallback className="avatar-fallback">
                {getInitial()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <Avatar className="dropdown-avatar">
                  <AvatarImage
                    src={userDetail?.avatarUrl || user?.avatarUrl}
                    alt={getUserDisplayName()}
                  />
                  <AvatarFallback className="avatar-fallback">
                    {getInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="dropdown-user-info">
                  <span className="dropdown-user-name">
                    {getUserDisplayName()}
                  </span>
                  <span className="dropdown-user-email">{email}</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/profile");
                  }}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </div>
                {/* <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/settings");
                  }}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </div> */}
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/change-password");
                  }}
                >
                  <LucideKeyRound size={18} /> 
                  <span>Change Password</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-footer">
                <div
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
