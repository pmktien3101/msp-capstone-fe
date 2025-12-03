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
  const [error, setError] = useState<string>("");
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
      setError("");

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
              memberCount = membersResult.data.length;
              const pmUserIds: string[] = [];

              membersResult.data.forEach((projectMember: any) => {
                // API returns: { userId, member: { id, role, fullName, email } }
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
        setError(result.error || "Unable to load project list");
      }
    } catch (err) {
      console.error("[BusinessProjects] Error:", err);
      setError("An error occurred while loading data");
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

  // Error state
  if (error) {
    return (
      <div className="business-projects-page">
        <div className="error-container">
          <h2>An error occurred</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
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

      {/* Projects Table */}
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
                      ? new Date(project.startDate).toLocaleDateString("en-US")
                      : "N/A"}
                  </div>
                  <div className="end-date">
                    End:{" "}
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString("en-US")
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .business-projects-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px;
          background: #fafafa;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 24px 32px;
          background: linear-gradient(135deg, #fff4ed 0%, #ffe8d9 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #ffd4b8;
        }

        .header-content h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0d062d;
          margin: 0 0 8px 0;
        }

        .header-content p {
          font-size: 16px;
          color: #787486;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #f1f1f1;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          background: #fff4ed;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff5e13;
        }

        .stat-content h3 {
          font-size: 13px;
          color: #787486;
          margin: 0 0 6px 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 800;
          color: #ff5e13;
          margin: 0;
        }

        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .search-box:focus-within {
          box-shadow: 0 4px 16px rgba(255, 94, 19, 0.1);
        }

        .search-box svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #787486;
          transition: color 0.3s ease;
        }

        .search-box:focus-within svg {
          color: #ff5e13;
        }

        .search-box input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          background: transparent;
        }

        .search-box input:focus {
          outline: none;
          border-color: #ff5e13;
        }

        .search-box input::placeholder {
          color: #a0aec0;
        }

        .filter-group select {
          padding: 14px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          background: white;
          color: #0d062d;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .filter-group select:hover {
          border-color: #ffd4b8;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.08);
        }

        .filter-group select:focus {
          outline: none;
          border-color: #ff5e13;
          box-shadow: 0 4px 16px rgba(255, 94, 19, 0.15);
        }

        .projects-table-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          border: 1px solid #f1f1f1;
          position: relative;
        }

        .projects-table-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff5e13, #ff8c42, #ffa463);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 2px solid #f8f9fa;
          background: #fafbfc;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .table-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #0d062d;
          margin: 0;
        }

        .project-count {
          font-size: 14px;
          color: #787486;
          font-weight: 600;
        }

        .projects-table {
          overflow-x: auto;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1fr 1.5fr;
          gap: 20px;
          padding: 18px 32px;
          background: #fff4ed;
          font-size: 12px;
          font-weight: 700;
          color: #ff5e13;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 1px solid #ffe8d9;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1fr 1.5fr;
          gap: 20px;
          padding: 24px 32px;
          border-bottom: 1px solid #f8f9fa;
          align-items: start;
          transition: all 0.3s ease;
          background: white;
          cursor: pointer;
          position: relative;
        }

        .table-row::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: #ff5e13;
          transition: width 0.3s ease;
        }

        .table-row:hover {
          background: #fffbf8;
          transform: translateX(4px);
        }

        .table-row:hover::before {
          width: 3px;
        }

        .col-project {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .project-info {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .project-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .project-name {
          font-size: 15px;
          font-weight: 700;
          color: #0d062d;
          transition: color 0.3s ease;
        }

        .table-row:hover .project-name {
          color: #ff5e13;
        }

        .project-description {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          line-height: 1.4;
        }

        .col-pm {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .pm-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .pm-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pm-avatar {
          width: 32px;
          height: 32px;
          background: #fff4ed;
          color: #ff5e13;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          border: 2px solid #ffe8d9;
          flex-shrink: 0;
        }

        .pm-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .pm-name {
          font-size: 13px;
          font-weight: 600;
          color: #0d062d;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pm-email {
          font-size: 11px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pm-more {
          font-size: 11px;
          color: #ff5e13;
          font-weight: 600;
          padding: 6px 10px;
          background: #fff4ed;
          border-radius: 6px;
          display: inline-block;
          margin-top: 4px;
          border: 1px solid #ffe8d9;
        }

        .col-status {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          display: inline-block;
          white-space: nowrap;
          line-height: 1.2;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .col-progress {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          min-width: 40px;
        }

        .col-members {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .member-count {
          font-size: 13px;
          color: #475569;
          font-weight: 600;
        }

        .col-tasks {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .task-stats {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
        }

        .task-completed {
          color: #10b981;
        }

        .task-separator {
          color: #94a3b8;
        }

        .task-total {
          color: #64748b;
        }

        .col-dates {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .date-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .start-date,
        .end-date {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        @media (max-width: 1200px) {
          .table-header-row,
          .table-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .col-project,
          .col-pm,
          .col-status,
          .col-progress,
          .col-members,
          .col-tasks,
          .col-dates {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
          }

          .col-project::before {
            content: "Project: ";
            font-weight: 700;
            color: #ff5e13;
          }
          .col-pm::before {
            content: "PMs: ";
            font-weight: 700;
            color: #ff5e13;
          }
          .col-status::before {
            content: "Status: ";
            font-weight: 700;
            color: #ff5e13;
          }
          .col-progress::before {
            content: "Progress: ";
            font-weight: 700;
            color: #ff5e13;
          }
          .col-members::before {
            content: "Members: ";
            font-weight: 700;
            color: #ff5e13;
          }
          .col-tasks::before {
            content: "Tasks: ";
            font-weight: 700;
            color: #ff5e13;
          }
          .col-dates::before {
            content: "Timeline: ";
            font-weight: 700;
            color: #ff5e13;
          }
        }

        @media (max-width: 768px) {
          .business-projects-page {
            padding: 16px;
          }

          .page-header {
            padding: 20px;
          }

          .header-content h1 {
            font-size: 28px;
          }

          .filters-section {
            flex-direction: column;
          }

          .search-box {
            min-width: auto;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            padding: 16px 20px;
          }
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top-color: #ff5e13;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-container h2 {
          color: #ef4444;
          font-size: 24px;
          margin: 0;
        }

        .error-container p {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }

        .error-container button {
          padding: 10px 24px;
          background: #ff5e13;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .error-container button:hover {
          background: #e54d0f;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default BusinessProjectsPage;
