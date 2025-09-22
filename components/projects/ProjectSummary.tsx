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
        {/* Left Column - Milestone (65-70%) */}
        <div className="summary-left">
          <MilestoneProgress project={project} />
          <TasksList project={project} />
        </div>

        {/* Right Column - Other Cards */}
        <div className="summary-right">
          <StatusOverview project={project} stats={stats} />
          <TeamWorkload project={project} />
          <UpcomingMeetings project={project} />
        </div>
      </div>

      <style jsx>{`
        .project-summary {
          width: 100%;
        }

        .summary-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .summary-left,
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
      `}</style>
    </div>
  );
}