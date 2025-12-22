"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { ProjectPortfolioOverview } from "@/components/dashboard/ProjectPortfolioOverview";
import { ProjectHighlights } from "@/components/dashboard/ProjectHighlights";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { milestoneService } from "@/services/milestoneService";
import { useUser } from "@/hooks/useUser";
import { TaskStatus, ProjectStatus } from "@/constants/status";
import { FolderKanban, CheckCircle2, ListTodo, Target, AlertCircle, TrendingUp } from "lucide-react";
import "@/app/styles/dashboard.scss";
import "@/app/styles/pm-dashboard.scss";
import "@/app/styles/pm-dashboard-new.scss";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [allMilestones, setAllMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId, fullName } = useUser();

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
                const [tasksRes, milestonesRes, membersRes] = await Promise.all(
                  [
                    taskService.getTasksByProjectId(project.id),
                    milestoneService.getMilestonesByProjectId(project.id),
                    projectService.getProjectMembers(project.id),
                  ]
                );

                const tasks =
                  tasksRes.success && tasksRes.data
                    ? tasksRes.data.items || []
                    : [];
                const milestones =
                  milestonesRes.success && milestonesRes.data
                    ? milestonesRes.data
                    : [];
                const members =
                  membersRes.success && membersRes.data ? membersRes.data : [];

                // Add to aggregate arrays
                tasksArray.push(
                  ...tasks.map((task: any) => ({
                    ...task,
                    projectId: project.id,
                    projectName: project.name,
                  }))
                );
                milestonesArray.push(
                  ...milestones.map((milestone: any) => ({
                    ...milestone,
                    projectName: project.name,
                  }))
                );

                // Calculate progress from tasks
                const completedTasks = tasks.filter(
                  (task: any) => task.status === TaskStatus.Done
                ).length;
                const totalTasks = tasks.length;
                const progress =
                  totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0;

                return {
                  ...project,
                  progress,
                  milestones: milestones.map((m: any) => m.id),
                  members: members
                    .filter((pm: any) => pm.member)
                    .map((pm: any) => ({
                      id: pm.member.id,
                      name: pm.member.fullName || "Unknown",
                      role: pm.member.role || "Member",
                      email: pm.member.email || "",
                      avatar:
                        pm.member.fullName?.charAt(0).toUpperCase() || "U",
                      avatarUrl: pm.member.avatarUrl || null,
                    })),
                };
              } catch (error) {
                return {
                  ...project,
                  progress: 0,
                  milestones: [],
                  members: [],
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

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(
      (p) => p.status === ProjectStatus.InProgress
    ).length,
    completedProjects: projects.filter(
      (p) => p.status === ProjectStatus.Completed
    ).length,
    pendingProjects: projects.filter(
      (p) => p.status === ProjectStatus.NotStarted
    ).length,
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((t) => t.status === TaskStatus.Done).length,
    inProgressTasks: allTasks.filter((t) => t.status === TaskStatus.InProgress)
      .length,
    pendingTasks: allTasks.filter((t) => t.status === TaskStatus.Todo).length,
    overdueTasks: allTasks.filter((t) => {
      if (!t.dueDate || t.status === TaskStatus.Done) return false;
      return new Date(t.dueDate) < new Date();
    }).length,
    totalMilestones: allMilestones.length,
    completedMilestones: allMilestones.filter((m) => m.status === "Completed").length,
    upcomingMilestones: allMilestones.filter((m) => {
      if (!m.dueDate || m.status === "Completed") return false;
      const dueDate = new Date(m.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue > 0 && daysUntilDue <= 7;
    }).length,
    teamMembers: new Set(
      projects.flatMap((p) => p.members?.map((m) => m.id) || [])
    ).size,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const taskCompletionPercent =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  const projectCompletionPercent =
    stats.totalProjects > 0
      ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
      : 0;

  const milestoneCompletionPercent =
    stats.totalMilestones > 0
      ? Math.round((stats.completedMilestones / stats.totalMilestones) * 100)
      : 0;

  if (loading) {
    return (
      <div className="pm-dash-container">
        <div className="pm-dash-loading-state">
          <div className="pm-dash-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-dash-container">
      {/* Welcome Header */}
      <div className="pm-dash-welcome-header">
        <div className="pm-dash-welcome-content">
          <h1 className="pm-dash-welcome-title">
            {getGreeting()}, {fullName || "Project Manager"}!
          </h1>
          <p className="pm-dash-welcome-subtitle">
            Here's your project portfolio overview.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="pm-dash-content">
        <section className="pm-dash-content-section">
          <ProjectPortfolioOverview projects={projects} tasks={allTasks} />
        </section>

        <div className="pm-dash-content-grid">
          <section className="pm-dash-content-section">
            <ProjectHighlights
              projects={projects}
              tasks={allTasks}
              milestones={allMilestones}
            />
          </section>
          <section className="pm-dash-content-section">
            <QuickActions projects={projects} />
          </section>
        </div>
      </div>
    </div>
  );
}
