'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ProjectPortfolioOverview } from '@/components/dashboard/ProjectPortfolioOverview';
import { ProjectHighlights } from '@/components/dashboard/ProjectHighlights';
import { ProjectVisualization } from '@/components/dashboard/ProjectVisualization';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { mockTasks, mockMeetings, mockProjects, mockMembers } from '@/constants/mockData';
import '@/app/styles/dashboard.scss';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("1");
  const [loading, setLoading] = useState(true);

  // Calculate progress based on tasks for each project
  const calculateProjectProgress = (projectId: string) => {
    // Get tasks for this specific project based on milestoneIds
    const projectMilestones = mockProjects.find(p => p.id === projectId)?.milestones || [];
    const projectTasks = mockTasks.filter(task => 
      task.milestoneIds.some(milestoneId => projectMilestones.includes(milestoneId))
    );
    
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    const totalTasks = projectTasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Mock data - using data from constants/mockData.ts
  useEffect(() => {
    // Convert all mockProjects to Project format
    const allProjects: Project[] = mockProjects.map(mockProject => ({
      id: mockProject.id,
      name: mockProject.name,
      description: mockProject.description,
      status: mockProject.status as 'active' | 'planning' | 'completed' | 'on-hold',
      startDate: mockProject.startDate,
      endDate: mockProject.endDate,
      manager: 'Quang Long', // From mockMembers
      members: mockMembers.filter(member => 
        mockProject.members.includes(member.id)
      ).map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        email: member.email,
        avatar: `/avatars/${member.avatar.toLowerCase()}.png`
      })),
      progress: calculateProjectProgress(mockProject.id)
    }));

    setProjects(allProjects);
    setLoading(false);
  }, []);

  // Calculate statistics
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  // Ensure selectedProjectId exists in projects
  const validProjectId = projects.find(p => p.id === selectedProjectId)?.id || (projects.length > 0 ? projects[0].id : "1");

  if (loading) {
    return (
      <div className="pm-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Top Section - Portfolio Overview */}
        <div className="dashboard-section">
          <ProjectPortfolioOverview projects={projects} />
        </div>

        {/* Middle Section - Highlights and Visualization */}
        <div className="dashboard-section">
          <div className="dashboard-grid">
            <div className="grid-item">
              <ProjectHighlights projects={projects} />
            </div>
            <div className="grid-item">
              <ProjectVisualization projects={projects} />
            </div>
          </div>
        </div>


        {/* Quick Actions */}
        <div className="dashboard-section">
          <QuickActions projects={projects} />
        </div>
      </div>

      <style jsx>{`
        :global(body) {
          margin: 0;
          padding: 0;
          background: #f8fafc;
          min-height: 100vh;
        }

        .dashboard-header {
          margin-bottom: 20px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text h1 {
          margin: 0 0 6px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .header-text p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .dashboard-stats {
          display: flex;
          gap: 24px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin: 0;
        }

        .dashboard-section {
          width: 100%;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .grid-item {
          width: 100%;
        }

        .charts-section {
          margin-bottom: 20px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }

        .chart-column-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-column-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-item {
          display: flex;
          flex-direction: column;
        }

        .summary-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }

        .summary-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .summary-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-column-left {
            gap: 12px;
          }
          
          .chart-column-right {
            gap: 12px;
          }
        }

        @media (max-width: 900px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-stats {
            gap: 16px;
          }

          .dashboard-content {
            gap: 16px;
            padding: 16px;
          }

          .header-text h1 {
            font-size: 20px;
          }

          .project-selector {
            width: 100%;
          }

          .project-dropdown {
            min-width: 100%;
          }

          .charts-section {
            margin-bottom: 16px;
          }

          .charts-grid {
            gap: 12px;
          }

          .summary-content {
            gap: 12px;
          }

          .summary-left,
          .summary-right {
            gap: 12px;
          }
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          color: #6b7280;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}