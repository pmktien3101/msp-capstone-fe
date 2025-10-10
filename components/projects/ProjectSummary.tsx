'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { OverviewCards } from './OverviewCards';
import { StatusOverview } from './StatusOverview';
import { MilestoneProgress } from './MilestoneProgress';
import { TeamWorkload } from './TeamWorkload';
import { TasksList } from './TasksList';
import { UpcomingMeetings } from './UpcomingMeetings';
import { mockProjects, mockTasks, mockMilestones, mockMeetings, mockMembers } from '@/constants/mockData';

interface ProjectSummaryProps {
  project: Project;
}

export function ProjectSummary({ project }: ProjectSummaryProps) {
  // Calculate stats for this specific project
  const projectMilestones = mockMilestones.filter(m => m.projectId === project.id);
  const projectTasks = mockTasks.filter(task => 
    task.milestoneIds.some(milestoneId => projectMilestones.some(m => m.id === milestoneId))
  );
  
  const stats = {
    total: projectTasks.length,
    completed: projectTasks.filter(task => task.status === 'done').length,
    inProgress: projectTasks.filter(task => task.status === 'in-progress').length,
    todo: projectTasks.filter(task => task.status === 'todo').length,
    review: projectTasks.filter(task => task.status === 'review').length,
    completionRate: projectTasks.length > 0 ? Math.round((projectTasks.filter(task => task.status === 'done').length / projectTasks.length) * 100) : 0,
  };

  return (
    <div className="project-summary">
      {/* Overview Cards */}
      <OverviewCards project={project} stats={stats} />

      {/* Main Content Grid */}
      <div className="summary-content">
        {/* Left Column */}
        <div className="summary-left">
          <MilestoneProgress project={project} />
          <TasksList project={project} />
        </div>

        {/* Right Column */}
        <div className="summary-right">
          <StatusOverview project={project} stats={stats} />
          <TeamWorkload project={project} />
          <UpcomingMeetings project={project} />
        </div>
      </div>

      <style jsx>{`
        .project-summary {
          width: 100%;
          padding: 4px;
        }

        .summary-content {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 20px;
          margin-top: 24px;
        }

        .summary-left,
        .summary-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Card styling improvements */
        .summary-left > :global(*),
        .summary-right > :global(*) {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid #F1F5F9;
          transition: box-shadow 0.2s ease;
        }

        .summary-left > :global(*):hover,
        .summary-right > :global(*):hover {
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.08);
        }

        @media (max-width: 1200px) {
          .summary-content {
            grid-template-columns: 1.5fr 1fr;
            gap: 16px;
          }
        }

        @media (max-width: 1024px) {
          .summary-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .summary-left,
          .summary-right {
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .project-summary {
            padding: 2px;
          }

          .summary-content {
            gap: 16px;
            margin-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}