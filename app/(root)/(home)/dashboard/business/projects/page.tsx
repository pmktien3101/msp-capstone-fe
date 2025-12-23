"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ProjectStatus,
  TaskStatus,
  getProjectStatusLabel,
  PROJECT_STATUS_LABELS,
} from "@/constants/status";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { useAuth } from "@/hooks/useAuth";
import type {
  Project as ProjectType,
  ProjectMemberResponse,
} from "@/types/project";
import "@/app/styles/businessProjects.scss";

interface ProjectStats {
  memberCount: number;
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

const BusinessProjectsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectManagers, setProjectManagers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [projectPMs, setProjectPMs] = useState<Map<string, string[]>>(
    new Map()
  ); // projectId -> PM userIds
  const [projectStats, setProjectStats] = useState<Map<string, ProjectStats>>(
    new Map()
  ); // projectId -> stats

  // Fetch projects and their members from API
  const fetchProjects = useCallback(async () => {
    // Wait for user to be loaded
    if (!user?.userId) {
      return;
    }

    try {
      setLoading(true);
      const result = await projectService.getProjectsByBOId(user.userId);

      if (result.success && result.data) {
        const projectList = result.data.items || [];
        setProjects(projectList);

        // Fetch members for all projects and extract ProjectManagers
        const pmMap = new Map<
          string,
          { id: string; name: string; email: string }
        >();
        const projectPMMap = new Map<string, string[]>();
        const statsMap = new Map<string, ProjectStats>();

        await Promise.all(
          projectList.map(async (project) => {
            // Fetch members
            const membersResult = await projectService.getProjectMembers(
              project.id
            );
            let memberCount = 0;

            if (membersResult.success && membersResult.data) {
              // Count only active members (without leftAt)
              const activeMembers = membersResult.data.filter((pm: any) => !pm.leftAt);
              memberCount = activeMembers.length;
              const pmUserIds: string[] = [];

              activeMembers.forEach((projectMember: any) => {
                // API returns: { userId, member: { id, role, fullName, email }, leftAt }
                if (
                  projectMember.member &&
                  projectMember.member.role === "ProjectManager"
                ) {
                  pmMap.set(projectMember.userId, {
                    id: projectMember.userId,
                    name: projectMember.member.fullName,
                    email: projectMember.member.email,
                  });
                  pmUserIds.push(projectMember.userId);
                }
              });
              projectPMMap.set(project.id, pmUserIds);
            }

            // Fetch tasks to calculate progress
            const tasksResult = await taskService.getTasksByProjectId(
              project.id
            );
            let completedTasks = 0;
            let totalTasks = 0;
            let progress = 0;

            if (tasksResult.success && tasksResult.data) {
              // API returns PagingResponse with items array
              const tasks = (tasksResult.data as any).items || tasksResult.data;
              const taskArray = Array.isArray(tasks) ? tasks : [];

              totalTasks = taskArray.length;
              completedTasks = taskArray.filter(
                (task: any) => task.status === TaskStatus.Done
              ).length;
              progress =
                totalTasks > 0
                  ? Math.round((completedTasks / totalTasks) * 100)
                  : 0;
            }

            statsMap.set(project.id, {
              memberCount,
              progress,
              completedTasks,
              totalTasks,
            });
          })
        );

        setProjectManagers(Array.from(pmMap.values()));
        setProjectPMs(projectPMMap);
        setProjectStats(statsMap);
      } else {
      }
    } catch (err) {
      console.error("[BusinessProjects] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [pmFilter, setPmFilter] = useState<string>("all");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    // Check if project has the selected PM as a member
    const matchesPM =
      pmFilter === "all" ||
      (projectPMs.get(project.id) || []).includes(pmFilter);

    return matchesSearch && matchesStatus && matchesPM;
  });

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; text: string; bg: string }
    > = {
      [ProjectStatus.NotStarted]: {
        color: "#6B7280",
        text: PROJECT_STATUS_LABELS[ProjectStatus.NotStarted],
        bg: "#F3F4F6",
      },
      [ProjectStatus.InProgress]: {
        color: "#3B82F6",
        text: PROJECT_STATUS_LABELS[ProjectStatus.InProgress],
        bg: "#DBEAFE",
      },
      [ProjectStatus.OnHold]: {
        color: "#F59E0B",
        text: PROJECT_STATUS_LABELS[ProjectStatus.OnHold],
        bg: "#FEF3C7",
      },
      [ProjectStatus.Completed]: {
        color: "#10B981",
        text: PROJECT_STATUS_LABELS[ProjectStatus.Completed],
        bg: "#ECFDF5",
      },
      [ProjectStatus.Cancelled]: {
        color: "#EF4444",
        text: PROJECT_STATUS_LABELS[ProjectStatus.Cancelled],
        bg: "#FEE2E2",
      },
    };

    const config =
      statusConfig[status] || statusConfig[ProjectStatus.NotStarted];
    return (
      <span
        className="status-badge"
        style={{
          color: config.color,
          backgroundColor: config.bg,
        }}
      >
        {config.text}
      </span>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#10B981";
    if (progress >= 60) return "#3B82F6";
    if (progress >= 40) return "#F59E0B";
    return "#DC2626";
  };

  // Loading state
  if (loading) {
    return (
      <div className="business-projects-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-projects-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Project Management</h1>
          <p>View and manage all projects in the organization</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Projects</h3>
            <p className="stat-number">{projects.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Active</h3>
            <p className="stat-number">
              {
                projects.filter((p) => p.status === ProjectStatus.InProgress)
                  .length
              }
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-number">
              {
                projects.filter((p) => p.status === ProjectStatus.Completed)
                  .length
              }
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Project Managers</h3>
            <p className="stat-number">{projectManagers.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by project name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value={ProjectStatus.NotStarted}>
              {PROJECT_STATUS_LABELS[ProjectStatus.NotStarted]}
            </option>
            <option value={ProjectStatus.InProgress}>
              {PROJECT_STATUS_LABELS[ProjectStatus.InProgress]}
            </option>
            <option value={ProjectStatus.OnHold}>
              {PROJECT_STATUS_LABELS[ProjectStatus.OnHold]}
            </option>
            <option value={ProjectStatus.Completed}>
              {PROJECT_STATUS_LABELS[ProjectStatus.Completed]}
            </option>
            <option value={ProjectStatus.Cancelled}>
              {PROJECT_STATUS_LABELS[ProjectStatus.Cancelled]}
            </option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={pmFilter}
            onChange={(e) => setPmFilter(e.target.value)}
          >
            <option value="all">All PMs</option>
            {projectManagers.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table or Empty State */}
      {filteredProjects.length === 0 && projects.length === 0 ? (
        <div className="projects-table-container">
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22V12H15V22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="empty-text">No Projects Yet</p>
            <p className="empty-description">
              Your organization hasn't created any projects yet. Get started by
              creating your first project to organize your team's work.
            </p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="projects-table-container">
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="empty-text">No Projects Found</p>
            <p className="empty-description">
              No projects match your current filters. Try adjusting your search
              criteria or clear filters to see all projects.
            </p>
            <button
              className="create-project-button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPmFilter("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="projects-table-container">
          <div className="table-header">
            <div className="header-left">
              <h3>Project List</h3>
              <span className="project-count">
                {filteredProjects.length} projects
              </span>
            </div>
          </div>

          <div className="projects-table">
            <div className="table-header-row">
              <div className="col-project">Project</div>
              <div className="col-pm">Project Managers</div>
              <div className="col-status">Status</div>
              <div className="col-progress">Progress</div>
              <div className="col-members">Members</div>
              <div className="col-tasks">Tasks</div>
              <div className="col-dates">Timeline</div>
            </div>

            {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="table-row"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="col-project">
                <div className="project-info">
                  <div className="project-details">
                    <div className="project-name">{project.name}</div>
                    <div className="project-description">
                      {project.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-pm">
                <div className="pm-list">
                  {(() => {
                    const pmIds = projectPMs.get(project.id) || [];
                    const pms = projectManagers.filter((pm) =>
                      pmIds.includes(pm.id)
                    );

                    if (pms.length === 0) {
                      return (
                        <div className="pm-item">
                          <div className="pm-details">
                            <div className="pm-name">No PM assigned</div>
                          </div>
                        </div>
                      );
                    }

                    return pms.map((pm) => (
                      <div key={pm.id} className="pm-item">
                        <div className="pm-avatar">
                          {pm.name?.charAt(0) || "P"}
                        </div>
                        <div className="pm-details">
                          <div className="pm-name">{pm.name || "N/A"}</div>
                          <div className="pm-email">{pm.email || ""}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="col-status">{getStatusBadge(project.status)}</div>

              <div className="col-progress">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          projectStats.get(project.id)?.progress || 0
                        }%`,
                        backgroundColor: getProgressColor(
                          projectStats.get(project.id)?.progress || 0
                        ),
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {projectStats.get(project.id)?.progress || 0}%
                  </span>
                </div>
              </div>

              <div className="col-members">
                <span className="member-count">
                  {projectStats.get(project.id)?.memberCount || 0} members
                </span>
              </div>

              <div className="col-tasks">
                <div className="task-stats">
                  <span className="task-completed">
                    {projectStats.get(project.id)?.completedTasks || 0}
                  </span>
                  <span className="task-separator">/</span>
                  <span className="task-total">
                    {projectStats.get(project.id)?.totalTasks || 0}
                  </span>
                </div>
              </div>

              <div className="col-dates">
                <div className="date-info">
                  <div className="start-date">
                    Start:{" "}
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </div>
                  <div className="end-date">
                    End:{" "}
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProjectsPage;
