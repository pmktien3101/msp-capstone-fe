'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { OverviewCards } from './OverviewCards';
import { StatusOverview } from './StatusOverview';
import { MilestoneProgress } from './MilestoneProgress';
import { TeamWorkload } from './TeamWorkload';
import { TasksList } from './TasksList';
import { UpcomingMeetings } from './UpcomingMeetings';
import { mockProject, mockTasks, mockMilestones, mockMeetings, getProjectStats } from '@/constants/mockData';

interface ProjectSummaryProps {
  projects: Project[];
}

export function ProjectSummary({ projects }: ProjectSummaryProps) {
  // Use mock data for consistent display
  const currentProject = mockProject;
  const stats = getProjectStats();

  return (
    <div className="project-summary">
      {/* Overview Cards */}
      <OverviewCards />

      {/* Main Content Grid */}
      <div className="summary-content">
        {/* Left Column - Milestone (65-70%) */}
        <div className="summary-left">
          <MilestoneProgress />
          <TasksList />
        </div>

        {/* Right Column - Other Cards */}
        <div className="summary-right">
          <StatusOverview />
          <TeamWorkload />
          <UpcomingMeetings />
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