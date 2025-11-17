'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ProjectPortfolioOverview } from '@/components/dashboard/ProjectPortfolioOverview';
import { ProjectHighlights } from '@/components/dashboard/ProjectHighlights';
import { ProjectVisualization } from '@/components/dashboard/ProjectVisualization';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { milestoneService } from '@/services/milestoneService';
import { useUser } from '@/hooks/useUser';
import { TaskStatus } from '@/constants/status';
import '@/app/styles/dashboard.scss';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [allMilestones, setAllMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useUser();

  // Fetch projects và tính progress từ API
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch projects của PM
        const projectsRes = await projectService.getProjectsByManagerId(userId);
        
        if (projectsRes.success && projectsRes.data) {
          const projectsList = projectsRes.data.items || [];
          
          // Arrays để aggregate tất cả tasks và milestones
          const tasksArray: any[] = [];
          const milestonesArray: any[] = [];
          
          // Fetch tasks và milestones cho mỗi project để tính progress
          const projectsWithProgress = await Promise.all(
            projectsList.map(async (project: Project) => {
              try {
                const [tasksRes, milestonesRes, membersRes] = await Promise.all([
                  taskService.getTasksByProjectId(project.id),
                  milestoneService.getMilestonesByProjectId(project.id),
                  projectService.getProjectMembers(project.id)
                ]);

                const tasks = tasksRes.success && tasksRes.data ? tasksRes.data.items || [] : [];
                const milestones = milestonesRes.success && milestonesRes.data ? milestonesRes.data : [];
                const members = membersRes.success && membersRes.data ? membersRes.data : [];

                // Add to aggregate arrays
                tasksArray.push(...tasks.map((task: any) => ({ ...task, projectId: project.id, projectName: project.name })));
                milestonesArray.push(...milestones.map((milestone: any) => ({ ...milestone, projectName: project.name })));

                // Tính progress từ tasks
                const completedTasks = tasks.filter((task: any) => task.status === TaskStatus.Done).length;
                const totalTasks = tasks.length;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return {
                  ...project,
                  progress,
                  milestones: milestones.map((m: any) => m.id),
                  members: members.filter((pm: any) => pm.member).map((pm: any) => ({
                    id: pm.member.id,
                    name: pm.member.fullName || 'Unknown',
                    role: pm.member.role || 'Member',
                    email: pm.member.email || '',
                    avatar: pm.member.fullName?.charAt(0).toUpperCase() || 'U'
                  }))
                };
              } catch (error) {
                return {
                  ...project,
                  progress: 0,
                  milestones: [],
                  members: []
                };
              }
            })
          );

          setProjects(projectsWithProgress);
          setAllTasks(tasksArray);
          setAllMilestones(milestonesArray);
        } else {
          setProjects([]);
          setAllTasks([]);
          setAllMilestones([]);
        }
      } catch (error) {
        setProjects([]);
        setAllTasks([]);
        setAllMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

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
          <ProjectPortfolioOverview projects={projects} tasks={allTasks} />
        </div>

        {/* Middle Section - Highlights and Visualization */}
        <div className="dashboard-section">
          <div className="dashboard-grid">
            <div className="grid-item">
              <ProjectHighlights 
                projects={projects} 
                tasks={allTasks} 
                milestones={allMilestones} 
              />
            </div>
            <div className="grid-item">
              <ProjectVisualization 
                projects={projects} 
                tasks={allTasks} 
                milestones={allMilestones} 
              />
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