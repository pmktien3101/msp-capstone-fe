'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ProjectPortfolioOverview } from '@/components/dashboard/ProjectPortfolioOverview';
import { ProjectHighlights } from '@/components/dashboard/ProjectHighlights';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { milestoneService } from '@/services/milestoneService';
import { useUser } from '@/hooks/useUser';
import { TaskStatus } from '@/constants/status';
import '@/app/styles/dashboard.scss';
import '@/app/styles/pm-dashboard.scss';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [allMilestones, setAllMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useUser();

  // Fetch projects and calculate progress from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch PM's projects
        const projectsRes = await projectService.getProjectsByManagerId(userId);
        
        if (projectsRes.success && projectsRes.data) {
          const projectsList = projectsRes.data.items || [];
          
          // Arrays to aggregate all tasks and milestones
          const tasksArray: any[] = [];
          const milestonesArray: any[] = [];
          
          // Fetch tasks and milestones for each project to calculate progress
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

                // Calculate progress from tasks
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
          <p>Loading data...</p>
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

        {/* Middle Section - Highlights and Quick Actions */}
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
              <QuickActions projects={projects} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}