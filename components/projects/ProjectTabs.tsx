'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { 
  LayoutDashboard, 
  Layers, 
  Kanban, 
  List, 
  FileText, 
  Video, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { ProjectSummary } from './ProjectSummary';
import { ProjectTimeline } from './ProjectTimeline';
import { ProjectBoard } from './ProjectBoard';
import { ProjectList } from './ProjectList';
import { ProjectReports } from './ProjectReports';
import { ProjectSettings } from './ProjectSettings';
import { MeetingTab } from './MeetingTab';
import { ProjectDocuments } from './ProjectDocuments';

interface ProjectTabsProps {
  project: Project;
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
}

export const ProjectTabs = ({ project, onTaskClick, onCreateTask }: ProjectTabsProps) => {
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = [
    {
      id: 'summary',
      label: 'Tổng quan',
      icon: <LayoutDashboard size={20} />
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <Layers size={20} />
    },
    {
      id: 'board',
      label: 'Bảng',
      icon: <Kanban size={20} />
    },
    {
      id: 'list',
      label: 'Danh sách',
      icon: <List size={20} />
    },
    {
      id: 'documents',
      label: 'Tài liệu',
      icon: <FileText size={20} />
    },
    {
      id: 'meetings',
      label: 'Cuộc họp',
      icon: <Video size={20} />
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: <BarChart3 size={20} />
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: <Settings size={20} />
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <ProjectSummary projects={[project]} />;
      case 'timeline':
        return <ProjectTimeline project={project} />;
      case 'board':
        return <ProjectBoard project={project} onTaskClick={onTaskClick} onCreateTask={onCreateTask} />;
      case 'list':
        return <ProjectList project={project} />;
      case 'documents':
        return <ProjectDocuments project={project} />;
      case 'meetings':
        return <MeetingTab project={project} />;
      case 'reports':
        return <ProjectReports project={project} />;
      case 'settings':
        return <ProjectSettings project={project} />;
      default:
        return <ProjectSummary projects={[project]} />;
    }
  };

  return (
    <div className="project-tabs">
      <div className="tabs-header">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tabs-content">
        {renderTabContent()}
      </div>

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
      `}</style>
    </div>
  );
};
