'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { ProjectStatus, TaskStatus, getProjectStatusLabel, getProjectStatusColor } from '@/constants/status';
import { 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  Filter
} from 'lucide-react';
import '@/app/styles/project-portfolio-overview.scss';
import { formatDate } from '@/lib/formatDate';

interface ProjectPortfolioOverviewProps {
  projects: Project[];
  tasks?: any[];
}

export const ProjectPortfolioOverview = ({ projects, tasks = [] }: ProjectPortfolioOverviewProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // Calculate progress for a project
  const calculateProgress = (projectId: string) => {
    const projectTasks = tasks.filter((task: any) => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter((task: any) => task.status === TaskStatus.Done).length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  // Get member count for a project - use project.members if available, otherwise calculate from tasks
  const getMemberCount = (project: Project) => {
    // Use project.members array if available (from API)
    if (project.members && Array.isArray(project.members)) {
      return project.members.length;
    }
    
    // Fallback: calculate from tasks
    const projectTasks = tasks.filter((task: any) => task.projectId === project.id);
    const uniqueUsers = new Set(projectTasks.map((task: any) => task.userId).filter(Boolean));
    return uniqueUsers.size;
  };

  // Calculate status statistics
  const statusStats = {
    active: projects.filter(p => p.status === ProjectStatus.InProgress).length,
    completed: projects.filter(p => p.status === ProjectStatus.Completed).length,
    planning: projects.filter(p => p.status === ProjectStatus.NotStarted).length,
    'on-hold': projects.filter(p => p.status === ProjectStatus.OnHold).length,
  };

  const totalProjects = projects.length;
  
  // Calculate average progress from tasks
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + calculateProgress(p.id), 0) / projects.length)
    : 0;

  // Filter projects by status
  const filteredProjects = statusFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === statusFilter);

  const getStatusBgColor = (status: string) => {
    const color = getProjectStatusColor(status);
    // Convert hex to rgba with 0.1 opacity
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  return (
    <div className="project-portfolio-overview">
      {/* Header */}
      <div className="pm-overview-section-header">
        <div className="pm-overview-section-title">
          <h2>Project Portfolio Overview</h2>
          <p>Manage and track all your projects</p>
        </div>
        <div className="filter-controls">
          <Filter size={16} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Projects</option>
            <option value={ProjectStatus.NotStarted}>Not Started</option>
            <option value={ProjectStatus.InProgress}>In Progress</option>
            <option value={ProjectStatus.Completed}>Completed</option>
            <option value={ProjectStatus.OnHold}>On Hold</option>
            <option value={ProjectStatus.Cancelled}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FolderOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalProjects}</h3>
            <p>Total Projects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{statusStats.active}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{statusStats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{averageProgress}%</h3>
            <p>Average Progress</p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="projects-list">
        <h3>Project List ({filteredProjects.length})</h3>
        <div className="dashboard-projects-table-container">
          <table className="dashboard-projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Members</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => {
                const progress = calculateProgress(project.id);
                const memberCount = getMemberCount(project);
                
                return (
                <tr key={project.id} className="project-row" onClick={() => handleProjectClick(project.id)}>
                  <td className="project-name-cell">
                    <div className="project-name-info">
                      <h4>{project.name}</h4>
                      <p>{project.description}</p>
                    </div>
                  </td>
                  <td className="status-cell">
                    <div 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusBgColor(project.status),
                        color: getProjectStatusColor(project.status)
                      }}
                    >
                      {getProjectStatusLabel(project.status)}
                    </div>
                  </td>
                  <td className="members-cell">
                    <div className="members-info">
                      {project.members && project.members.length > 0 ? (
                        <>
                          <div className="members-avatars">
                            {project.members.slice(0, 3).map((member: any, idx: number) => (
                              <div 
                                key={member.id || idx} 
                                className="member-avatar"
                                title={member.name}
                              >
                                {member.avatarUrl ? (
                                  <img src={member.avatarUrl} alt={member.name} />
                                ) : (
                                  member.avatar || member.name?.charAt(0).toUpperCase() || '?'
                                )}
                              </div>
                            ))}
                            {project.members.length > 3 && (
                              <div className="member-more" title={`+${project.members.length - 3} more`}>
                                +{project.members.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="members-count">{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                        </>
                      ) : (
                        <>
                          <Users size={16} />
                          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-info">
                      <Calendar size={16} />
                      <span>{project.startDate ? formatDate(project.startDate) : '-'}</span>
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-info">
                      <Calendar size={16} />
                      <span>{project.endDate ? formatDate(project.endDate) : '-'}</span>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
