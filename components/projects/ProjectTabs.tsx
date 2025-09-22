"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import {
  LayoutDashboard,
  Kanban,
  List,
  FileText,
  Video,
  BarChart3,
  Settings,
} from "lucide-react";
import { ProjectSummary } from "./ProjectSummary";
import { ProjectBoard } from "./ProjectBoard";
import { ProjectList } from "./ProjectList";
// import { ProjectReports } from "./ProjectReports";
import { ProjectSettings } from "./ProjectSettings";
import { MeetingTab } from "./MeetingTab";
import { ProjectDocuments } from "./ProjectDocuments";

interface ProjectTabsProps {
  project: Project;
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
  onTabChange?: (activeTab: string) => void;
  initialActiveTab?: string;
}

export const ProjectTabs = ({
  project,
  onTaskClick,
  onCreateTask,
  onTabChange,
  initialActiveTab = "summary",
}: ProjectTabsProps) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  // Listen for navigation events from "Xem tất cả" buttons
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      const { tab } = event.detail;
      setActiveTab(tab);
      if (onTabChange) {
        onTabChange(tab);
      }
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, [onTabChange]);

  const tabs = [
    {
      id: "summary",
      label: "Tổng quan",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "board",
      label: "Bảng",
      icon: <Kanban size={20} />,
    },
    {
      id: "list",
      label: "Danh sách",
      icon: <List size={20} />,
    },
    {
      id: "documents",
      label: "Tài liệu",
      icon: <FileText size={20} />,
    },
    {
      id: "meetings",
      label: "Cuộc họp",
      icon: <Video size={20} />,
    },
    // {
    //   id: "reports",
    //   label: "Báo cáo",
    //   icon: <BarChart3 size={20} />,
    // },
    {
      id: "settings",
      label: "Cài đặt",
      icon: <Settings size={20} />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <ProjectSummary project={project} />;
      case "board":
        return (
          <ProjectBoard
            project={project}
            onTaskClick={onTaskClick}
            onCreateTask={onCreateTask}
          />
        );
      case "list":
        return <ProjectList project={project} />;
      case "documents":
        return <ProjectDocuments project={project} />;
      case "meetings":
        return <MeetingTab project={project} />;
      // case "reports":
      //   return <ProjectReports project={project} />;
      case "settings":
        return <ProjectSettings project={project} />;
      default:
        return <ProjectSummary project={project} />;
    }
  };

  return (
    <div className="project-tabs">
      <div className="tabs-header">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                onTabChange?.(tab.id);
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tabs-content">{renderTabContent()}</div>

      <style jsx>{`
        .project-tabs {
          width: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tabs-header {
          border-bottom: 1px solid #e5e7eb;
          padding: 0 24px;
        }

        .tabs-list {
          display: flex;
          gap: 0;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .tab-button:hover {
          color: #374151;
          background: #f9fafb;
        }

        .tab-button.active {
          color: #ff5e13;
          border-bottom-color: #ff5e13;
          background: #fdf0d2;
        }

        .tab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tab-label {
          white-space: nowrap;
        }

        .tabs-content {
          padding: 24px;
          min-height: 400px;
        }

        /* Responsive Design */
        
        /* Large Desktop (1200px+) */
        @media (min-width: 1200px) {
          .tabs-header {
            padding: 0 32px;
          }

          .tab-button {
            padding: 18px 24px;
            font-size: 15px;
          }

          .tabs-content {
            padding: 32px;
          }
        }

        /* Desktop (1024px - 1199px) */
        @media (max-width: 1199px) and (min-width: 1024px) {
          .tabs-header {
            padding: 0 28px;
          }

          .tab-button {
            padding: 16px 20px;
            font-size: 14px;
          }

          .tabs-content {
            padding: 28px;
          }
        }

        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 769px) {
          .tabs-header {
            padding: 0 20px;
          }

          .tab-button {
            padding: 14px 16px;
            font-size: 13px;
            gap: 6px;
          }

          .tab-icon {
            transform: scale(0.9);
          }

          .tabs-content {
            padding: 20px;
            min-height: 350px;
          }
        }

        /* Mobile Large (481px - 768px) */
        @media (max-width: 768px) and (min-width: 481px) {
          .project-tabs {
            border-radius: 6px;
          }

          .tabs-header {
            padding: 0 16px;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .tabs-header::-webkit-scrollbar {
            display: none;
          }

          .tabs-list {
            min-width: max-content;
            gap: 0;
          }

          .tab-button {
            padding: 12px 14px;
            font-size: 12px;
            gap: 5px;
            flex-shrink: 0;
          }

          .tab-icon {
            transform: scale(0.8);
          }

          .tabs-content {
            padding: 16px;
            min-height: 300px;
          }
        }

        /* Mobile Small (320px - 480px) */
        @media (max-width: 480px) {
          .project-tabs {
            border-radius: 4px;
          }

          .tabs-header {
            padding: 0 12px;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .tabs-header::-webkit-scrollbar {
            display: none;
          }

          .tabs-list {
            min-width: max-content;
            gap: 0;
          }

          .tab-button {
            padding: 10px 12px;
            font-size: 11px;
            gap: 4px;
            flex-shrink: 0;
          }

          .tab-icon {
            transform: scale(0.7);
          }

          .tab-label {
            font-size: 11px;
          }

          .tabs-content {
            padding: 12px;
            min-height: 250px;
          }
        }

        /* Extra Small Mobile (max-width: 320px) */
        @media (max-width: 320px) {
          .tabs-header {
            padding: 0 8px;
          }

          .tab-button {
            padding: 8px 10px;
            font-size: 10px;
            gap: 3px;
          }

          .tab-icon {
            transform: scale(0.6);
          }

          .tab-label {
            font-size: 10px;
          }

          .tabs-content {
            padding: 8px;
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};
