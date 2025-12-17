'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { TaskStatus } from '@/constants/status';
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
import '@/app/styles/project-summary.scss';

interface ProjectSummaryProps {
  project: Project;
  readOnly?: boolean;
}

export function ProjectSummary({ project, readOnly = false }: ProjectSummaryProps) {
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

        // Set members - filter out members who have left
        if (membersRes.success && membersRes.data) {
          const activeMembers = membersRes.data.filter((pm: any) => !pm.leftAt);
          setProjectMembers(activeMembers);
        } else {
          setProjectMembers([]);
        }
      } catch (error) {
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
    completed: projectTasks.filter(task => task.status === TaskStatus.Done).length,
    inProgress: projectTasks.filter(task => task.status === TaskStatus.InProgress).length,
    todo: projectTasks.filter(task => task.status === TaskStatus.Todo).length,
    onHold: projectTasks.filter(task => task.status === TaskStatus.ReadyToReview).length,
    readyToReview: projectTasks.filter(task => task.status === TaskStatus.ReadyToReview).length,
    reOpened: projectTasks.filter(task => task.status === TaskStatus.ReOpened).length,
    cancelled: projectTasks.filter(task => task.status === TaskStatus.Cancelled).length,
    completionRate: projectTasks.length > 0 
      ? Math.round((projectTasks.filter(task => task.status === TaskStatus.Done).length / projectTasks.length) * 100) 
      : 0,
  };

  if (isLoading) {
    return (
      <div className="project-summary">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading overview data...</p>
        </div>
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
    </div>
  );
}