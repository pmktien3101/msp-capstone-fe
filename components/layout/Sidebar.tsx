"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ProjectSection } from "./ProjectSection";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/lib/rbac";
import { MdMoney } from "react-icons/md";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  badge?: boolean;
}

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isProjectSectionExpanded, setIsProjectSectionExpanded] =
    useState(false);

  const { logout, role } = useUser();

  // Admin menu items
  const adminSidebarItems: SidebarItem[] = [
    {
      id: "admin-dashboard",
      label: "Tổng quan",
      route: "/dashboard/admin/dashboard",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "revenue",
      label: "Doanh thu",
      route: "/dashboard/admin/revenue",
      icon: <MdMoney size={24} color="currentColor" />,
    },
    {
      id: "business-owners",
      label: "Business Owners",
      route: "/dashboard/admin/business",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 3.13C7.13959 3.35031 6.37698 3.85071 5.83236 4.55232C5.28774 5.25392 4.99219 6.11683 4.99219 7.005C4.99219 7.89318 5.28774 8.75608 5.83236 9.45769C6.37698 10.1593 7.13959 10.6597 8 10.88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "features",
      label: "Chức năng chính",
      route: "/dashboard/admin/features",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12L11 14L15 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "plans",
      label: "Gói dịch vụ",
      route: "/dashboard/admin/plans",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 7L9 12L20 17V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 5H16V19H4V5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  // Business Owner menu items
  const businessOwnerSidebarItems: SidebarItem[] = [
    {
      id: "business-dashboard",
      label: "Tổng quan",
      route: "/dashboard/business",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "members-roles",
      label: "Thành viên",
      route: "/dashboard/business/members",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 3.13C7.13959 3.35031 6.37698 3.85071 5.83236 4.55232C5.28774 5.25392 4.99219 6.11683 4.99219 7.005C4.99219 7.89318 5.28774 8.75608 5.83236 9.45769C6.37698 10.1593 7.13959 10.6597 8 10.88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "projects",
      label: "Dự án",
      route: "/dashboard/business/projects",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "subscription-billing",
      label: "Gói & Thanh toán",
      route: "/dashboard/business/subscription",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 7L9 12L20 17V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 5H16V19H4V5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  // PM menu items
  const pmSidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Tổng Quan Dự Án",
      route: "/dashboard/pm",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "meetings",
      label: "Cuộc Họp",
      route: "/meetings",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 16.92V7.08C21.9996 6.74864 21.9071 6.42412 21.7315 6.14424C21.556 5.86436 21.3037 5.63932 21 5.49L13 1.49C12.696 1.34028 12.3511 1.26758 12 1.26758C11.6489 1.26758 11.304 1.34028 11 1.49L3 5.49C2.69626 5.63932 2.44398 5.86436 2.26846 6.14424C2.09294 6.42412 2.00036 6.74864 2 7.08V16.92C2.00036 17.2514 2.09294 17.5759 2.26846 17.8558C2.44398 18.1356 2.69626 18.3607 3 18.51L11 22.51C11.304 22.6597 11.6489 22.7324 12 22.7324C12.3511 22.7324 12.696 22.6597 13 22.51L21 18.51C21.3037 18.3607 21.556 18.1356 21.7315 17.8558C21.9071 17.5759 21.9996 17.2514 22 16.92Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 4.21L12 6.33L16.5 4.21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 19.79V14.6L3 12.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12.5L16.5 14.6V19.79"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.27 6.96L12 12.01L20.73 6.96"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22.08V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  // Member menu items
  const memberSidebarItems: SidebarItem[] = [
    {
      id: "member-dashboard",
      label: "Tổng quan",
      route: "/dashboard/member",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "calendar",
      label: "Lịch",
      route: "/calendar",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="3"
            y1="10"
            x2="21"
            y2="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "business",
      label: "Doanh Nghiệp",
      route: "/business",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="3"
            y1="10"
            x2="21"
            y2="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
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

  // Auto-detect active item based on current pathname
  useEffect(() => {
    const currentPath = pathname;

    // Check if we're on a project page
    if (
      currentPath.includes("/projects/") &&
      !currentPath.endsWith("/projects")
    ) {
      setActiveItem("projects");
      setIsProjectSectionExpanded(true);
      return;
    }

    const currentItem = sidebarItems.find((item) => item.route === currentPath);
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
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

  return (
    <div className="sidebar-container">
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
                <div className="item-label">{item.label}</div>
              </div>
              {item.badge && (
                <div className="item-badge">
                  <div className="badge-dot"></div>
                </div>
              )}
            </div>
          ))}

          {/* Project Section - Only show for ProjectManager and Member (not admin or business owner) */}
          {(role === UserRole.PROJECT_MANAGER || role === UserRole.MEMBER) && (
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17L21 12L16 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="item-label">Đăng Xuất</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar-container {
          width: 100%;
          height: 100%;
          padding: 12px;
          background: #f8f9fa;
          border-right: 1px solid #e1e5e9;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
        }

        .sidebar-content {
          width: 100%;
        }

        .sidebar-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-item {
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          position: relative;
        }

        .sidebar-item:hover {
          background: #e9ecef;
        }

        .sidebar-item.active {
          background: #fff3cd;
          color: #856404;
        }

        .sidebar-item.has-badge {
          background: #fff3cd;
        }

        .item-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .item-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          transition: color 0.2s ease;
        }

        .sidebar-item.active .item-icon {
          color: #856404;
        }

        .sidebar-item:hover .item-icon {
          color: #495057;
        }

        .item-label {
          color: #495057;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .sidebar-item.active .item-label {
          color: #856404;
          font-weight: 600;
        }

        .sidebar-item:hover .item-label {
          color: #212529;
        }

        .item-badge {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #ffc107;
          border-radius: 50%;
        }

        .logout-section {
          margin-top: auto;
          padding-top: 20px;
        }

        .logout-divider {
          width: 100%;
          height: 1px;
          background: #e5e7eb;
          margin-bottom: 16px;
        }

        .logout-item {
          width: 100%;
          padding: 7.32px;
          background: white;
          border-radius: 3.66px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .logout-item:hover {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .logout-item .item-icon {
          color: #ef4444;
        }

        .logout-item .item-label {
          color: #ef4444;
          font-weight: 500;
        }

        .logout-item:hover .item-icon {
          color: #dc2626;
        }

        .logout-item:hover .item-label {
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
