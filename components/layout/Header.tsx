"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/lib/rbac";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { User, LogOut } from "lucide-react";
import "@/app/styles/header.scss";

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { email, fullName, role, logout } = useUser();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
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
    <div className="header-container">
      <div className="header-background" />

      {/* Logo and Brand */}
      <div className="header-brand">
        <div className="brand-logo">
          <Image src="/logo.png" alt="MSP Logo" width={50} height={45} />
        </div>
        <div className="brand-name">MSP</div>
      </div>

      {/* Right Side - Notify, User */}
      <div className="header-right">
        {/* Notification Bell - Real-time */}
        <NotificationBell />

        {/* User Info */}
        <div className="user-info">
          <div className="user-name">{getUserDisplayName()}</div>
          <div className="user-location">{getRoleDisplayName()}</div>
        </div>

        {/* User Avatar with Dropdown */}
        <div className="user-avatar-container" ref={dropdownRef}>
          <div
            className="user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <Avatar>
              <AvatarImage
                src="/default-avatar.png"
                alt={getUserDisplayName()}
              />
              <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                {getInitial()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="user-dropdown">
              <div
                className="dropdown-item"
                onClick={() => {
                  setShowUserMenu(false);
                  router.push("/profile");
                }}
              >
                <div className="dropdown-icon">
                  <User size={16} />
                </div>
                <span>Profile</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout-item" onClick={handleLogout}>
                <div className="dropdown-icon">
                  <LogOut size={16} />
                </div>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
