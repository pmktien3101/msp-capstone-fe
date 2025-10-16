'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { OverviewCards } from './OverviewCards';
import { StatusOverview } from './StatusOverview';
import { MilestoneProgress } from './MilestoneProgress';
import { TeamWorkload } from './TeamWorkload';
import { TasksList } from './TasksList';
import { UpcomingMeetings } from './UpcomingMeetings';
import { milestoneService } from '@/services/milestoneService';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { GetTaskResponse } from '@/types/task';
import { MilestoneBackend } from '@/types/milestone';

interface ProjectSummaryProps {
  project: Project;
}

export function ProjectSummary({ project }: ProjectSummaryProps) {
  const [projectMilestones, setProjectMilestones] = useState<MilestoneBackend[]>([]);
  const [projectTasks, setProjectTasks] = useState<GetTaskResponse[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const projectId = project?.id?.toString();

  // Fetch all data for the project
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch milestones, tasks, and members in parallel
        const [milestonesRes, tasksRes, membersRes] = await Promise.all([
          milestoneService.getMilestonesByProjectId(projectId),
          taskService.getTasksByProjectId(projectId),
          projectService.getProjectMembers(projectId)
        ]);

        // Set milestones
        if (milestonesRes.success && milestonesRes.data) {
          setProjectMilestones(milestonesRes.data);
        } else {
          setProjectMilestones([]);
        }

        // Set tasks
        if (tasksRes.success && tasksRes.data) {
          setProjectTasks(tasksRes.data.items || []);
        } else {
          setProjectTasks([]);
        }

        // Set members
        if (membersRes.success && membersRes.data) {
          setProjectMembers(membersRes.data);
        } else {
          setProjectMembers([]);
        }
      } catch (error) {
        console.error('[ProjectSummary] Error fetching project data:', error);
        setProjectMilestones([]);
        setProjectTasks([]);
        setProjectMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);
  
  // Calculate stats from API data
  const stats = {
    total: projectTasks.length,
    completed: projectTasks.filter(task => task.status === 'Hoàn thành').length,
    inProgress: projectTasks.filter(task => task.status === 'Đang làm').length,
    todo: projectTasks.filter(task => task.status === 'Chưa bắt đầu').length,
    review: 0, // Backend không có status "review", set về 0
    completionRate: projectTasks.length > 0 
      ? Math.round((projectTasks.filter(task => task.status === 'Hoàn thành').length / projectTasks.length) * 100) 
      : 0,
  };

  if (isLoading) {
    return (
      <div className="project-summary">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu tổng quan...</p>
        </div>
        <style jsx>{`
          .project-summary {
            width: 100%;
            padding: 24px;
          }
          
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
            color: #64748b;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #FF5E13;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .loading-state p {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="project-summary">
      {/* Overview Cards */}
      <OverviewCards 
        project={project} 
        stats={stats}
      />

      {/* Main Content Grid */}
      <div className="summary-content">
        {/* Left Column */}
        <div className="summary-left">
          <MilestoneProgress 
            project={project}
          />
          <TasksList 
            project={project}
          />
        </div>

        {/* Right Column */}
        <div className="summary-right">
          <StatusOverview 
            project={project} 
            stats={stats}
          />
          <TeamWorkload 
            project={project}
          />
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