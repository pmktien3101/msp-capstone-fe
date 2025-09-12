'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { OverviewCards } from './OverviewCards';
import { StatusOverview } from './StatusOverview';
import { RecentActivity } from './RecentActivity';
import { WorkloadBreakdown } from './WorkloadBreakdown';
import { MilestoneProgress } from './MilestoneProgress';
import { TeamWorkload } from './TeamWorkload';
import { mockProject, mockTasks, mockActivities, mockMilestones, getProjectStats } from '@/constants/mockData';

interface ProjectSummaryProps {
  projects: Project[];
}

export function ProjectSummary({ projects }: ProjectSummaryProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  // Use mock data for consistent display
  const currentProject = mockProject;
  const stats = getProjectStats();

  return (
    <div className="project-summary">
      {/* Filter Button */}
      <div className="summary-header">
        <button 
          className="filter-btn"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Filter
        </button>
      </div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Main Content Grid */}
      <div className="summary-content">
        {/* Left Column */}
        <div className="summary-left">
          <StatusOverview />
          <WorkloadBreakdown />
          <TeamWorkload />
        </div>

        {/* Right Column */}
        <div className="summary-right">
          <RecentActivity />
          <MilestoneProgress />
        </div>
      </div>

      <style jsx>{`
        .project-summary {
          width: 100%;
        }

        .summary-header {
          margin-bottom: 24px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .summary-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
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