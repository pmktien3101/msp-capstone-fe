'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { PMOverviewCards } from '@/components/dashboard/PMOverviewCards';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { UpcomingMeetings } from '@/components/projects/UpcomingMeetings';
import { mockTasks, mockMeetings, mockProject, mockMembers } from '@/constants/mockData';
import '@/app/styles/dashboard.scss';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  // Calculate progress based on tasks for each project
  const calculateProjectProgress = (projectId: string) => {
    if (projectId === '1') {
      // Main project from mockData.ts
      const completedTasks = mockTasks.filter(task => task.status === 'done').length;
      const totalTasks = mockTasks.length;
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }
    return 0;
  };

  // Mock data - using data from constants/mockData.ts
  useEffect(() => {
    // Convert mockProject to Project format
    const mainProject: Project = {
      id: mockProject.id,
      name: mockProject.name,
      description: mockProject.description,
      status: mockProject.status as 'active' | 'planning' | 'completed' | 'on-hold',
      startDate: mockProject.startDate,
      endDate: mockProject.endDate,
      manager: 'Quang Long', // From mockMembers
      members: mockMembers.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        email: member.email,
        avatar: `/avatars/${member.avatar.toLowerCase()}.png`
      })),
      progress: calculateProjectProgress(mockProject.id)
    };

    setProjects([mainProject]);
  }, []);

  // Calculate statistics
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  return (
    <div className="pm-dashboard">
      {/* PM Overview Cards */}
      <PMOverviewCards />

      {/* Summary Content */}
      <div className="summary-content">
        <div className="summary-left">
          <RecentProjects projects={projects} />
        </div>
        <div className="summary-right">
          <UpcomingMeetings />
        </div>
      </div>

      <style jsx>{`
        .pm-dashboard {
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .summary-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .summary-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .summary-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .summary-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .pm-dashboard {
            padding: 16px;
          }

          .summary-content {
            gap: 16px;
          }

          .summary-left,
          .summary-right {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}