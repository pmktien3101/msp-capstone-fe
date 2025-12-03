"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ProjectSection } from "./ProjectSection";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/lib/rbac";
import "@/app/styles/sidebar.scss";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  CheckCircle2,
  Package,
  Layers,
  CreditCard,
  CalendarDays,
  Building2,
  Presentation,
  LogOut,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  badge?: boolean;
}

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapsedChange }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isProjectSectionExpanded, setIsProjectSectionExpanded] =
    useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { logout, role } = useUser();

  // ----------------- ADMIN MENU -----------------
  const adminSidebarItems: SidebarItem[] = [
    {
      id: "admin-dashboard",
      label: "Dashboard",
      route: "/dashboard/admin/dashboard",
      icon: <LayoutDashboard size={22} />,
    },
    {
      id: "revenue",
      label: "Revenue",
      route: "/dashboard/admin/revenue",
      icon: <DollarSign size={22} />,
    },
    {
      id: "business-owners",
      label: "Business Owners",
      route: "/dashboard/admin/business",
      icon: <Users size={22} />,
    },
    {
      id: "limitations",
      label: "Limitations",
      route: "/dashboard/admin/limitations",
      icon: <CheckCircle2 size={22} />,
    },
    {
      id: "packages",
      label: "Packages",
      route: "/dashboard/admin/packages",
      icon: <Package size={22} />,
    },
  ];

  // ----------------- BUSINESS OWNER MENU -----------------
  const businessOwnerSidebarItems: SidebarItem[] = [
    {
      id: "business-dashboard",
      label: "Dashboard",
      route: "/dashboard/business",
      icon: <LayoutDashboard size={22} />,
    },
    {
      id: "members-roles",
      label: "Members & Roles",
      route: "/dashboard/business/members",
      icon: <Users size={22} />,
    },
    {
      id: "projects",
      label: "Projects",
      route: "/dashboard/business/projects",
      icon: <Layers size={22} />,
    },
    {
      id: "subscription-billing",
      label: "Subscription & Billing",
      route: "/dashboard/business/subscription",
      icon: <CreditCard size={22} />,
    },
  ];

  // ----------------- PROJECT MANAGER MENU -----------------
  const pmSidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      route: "/dashboard/pm",
      icon: <LayoutDashboard size={22} />,
    },
    {
      id: "meetings",
      label: "Meetings",
      route: "/meetings",
      icon: <Presentation size={22} />,
    },
  ];

  // ----------------- MEMBER MENU -----------------
  const memberSidebarItems: SidebarItem[] = [
    {
      id: "member-dashboard",
      label: "Dashboard",
      route: "/dashboard/member",
      icon: <LayoutDashboard size={22} />,
    },
    {
      id: "calendar",
      label: "Calendar",
      route: "/calendar",
      icon: <CalendarDays size={22} />,
    },
    {
      id: "business",
      label: "Businesses",
      route: "/business",
      icon: <Building2 size={22} />,
    },
  ];

  // Get sidebar items based on role
  const getSidebarItems = () => {
    switch (role) {
      case UserRole.ADMIN:
        return adminSidebarItems;
      case UserRole.BUSINESS_OWNER:
        return businessOwnerSidebarItems;
      case UserRole.MEMBER:
        return memberSidebarItems;
      case UserRole.PROJECT_MANAGER:
        return pmSidebarItems;
      default:
        return memberSidebarItems;
    }
  };

  const sidebarItems = getSidebarItems();
  const [activeItem, setActiveItem] = useState("dashboard");

  // Auto-detect active item
  useEffect(() => {
    const currentPath = pathname;

    // If viewing project detail, highlight Projects
    if (
      currentPath.includes("/projects/") &&
      !currentPath.endsWith("/projects")
    ) {
      setActiveItem("projects");
      return;
    }

    const currentItem = sidebarItems.find((item) => item.route === currentPath);
    if (currentItem) setActiveItem(currentItem.id);
  }, [pathname, sidebarItems]);

  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id);
    router.push(item.route);
  };

  const handleProjectSectionToggle = () => {
    setIsProjectSectionExpanded(!isProjectSectionExpanded);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsedState);
    }
  };

  return (
    <div className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      {/* Collapse Toggle Button */}
      <button
        className="collapse-toggle"
        onClick={toggleSidebar}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="sidebar-content">
        <div className="sidebar-items">
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              className={`sidebar-item ${
                activeItem === item.id ? "active" : ""
              } ${item.badge ? "has-badge" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="item-content">
                <div className="item-icon">{item.icon}</div>
                {!isCollapsed && <div className="item-label">{item.label}</div>}
              </div>

              {item.badge && !isCollapsed && (
                <div className="item-badge">
                  <div className="badge-dot"></div>
                </div>
              )}
            </div>
          ))}

          {!isCollapsed &&
            (role === UserRole.PROJECT_MANAGER || role === UserRole.MEMBER) && (
              <ProjectSection
                isExpanded={isProjectSectionExpanded}
                onToggle={handleProjectSectionToggle}
              />
            )}
        </div>

        {/* Logout Button */}
        <div className="logout-section">
          <div className="logout-divider"></div>

          <div className="logout-item" onClick={handleLogout}>
            <div className="item-content">
              <div className="item-icon">
                <LogOut size={22} />
              </div>
              {!isCollapsed && <div className="item-label">Logout</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
