'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { useUser } from '@/hooks/useUser';
import { Eye, Edit, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { getProjectStatusColor, getProjectStatusLabel } from '@/constants/status';
import { formatDate } from '@/lib/formatDate';

interface ProjectsTableProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
  onAddMeeting: (project: Project) => void;
  onViewProject: (projectId: string) => void;
}

export function ProjectsTable({ projects, onEditProject, onAddMeeting, onViewProject }: ProjectsTableProps) {
  const [sortField, setSortField] = useState<keyof Project>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { role } = useUser();

  // Check if user can edit projects (not a member)
  const canEditProject = role !== 'Member';

  const getStatusBackgroundColor = (status: string) => {
    const baseColor = getProjectStatusColor(status);
    
    const bgMap: Record<string, string> = {
      '#f59e0b': '#fef3c7',   // amber - Scheduled
      '#10b981': '#dcfce7',   // green - InProgress/Completed
      '#ef4444': '#fee2e2',   // red - Paused
      '#6b7280': '#f3f4f6'    // gray - default
    };
    
    return bgMap[baseColor] || '#f3f4f6';
  };

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // use shared formatDate helper (dd/mm/yyyy)

  return (
    <div className="projects-table-container">
      <div className="table-wrapper">
        <table className="projects-table">
          <thead>
            <tr>
              <th 
                className="sortable"
                onClick={() => handleSort('name')}
              >
                <div className="th-content">
                  <span>Project Name</span>
                  <div className="sort-indicator">
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </div>
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('status')}
              >
                <div className="th-content">
                  <span>Status</span>
                  <div className="sort-indicator">
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </div>
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('startDate')}
              >
                <div className="th-content">
                  <span>Start Date</span>
                  <div className="sort-indicator">
                    {sortField === 'startDate' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </div>
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('endDate')}
              >
                <div className="th-content">
                  <span>End Date</span>
                  <div className="sort-indicator">
                    {sortField === 'endDate' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((project) => (
              <tr key={project.id} className="project-row">
                <td className="project-name-cell">
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    {/* <div className="project-key">PMS-{project.id}</div> */}
                    <div className="project-description">{project.description}</div>
                  </div>
                </td>
                <td className="status-cell">
                  <div 
                    className="status-badge" 
                    style={{ 
                      color: getProjectStatusColor(project.status),
                      backgroundColor: getStatusBackgroundColor(project.status),
                      borderColor: getProjectStatusColor(project.status)
                    }}
                  >
                    {getProjectStatusLabel(project.status)}
                  </div>
                </td>
                <td className="date-cell">
                  {project.startDate ? formatDate(project.startDate) : '-'}
                </td>
                <td className="date-cell">
                  {project.endDate ? formatDate(project.endDate) : '-'}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => onViewProject(project.id)}
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    {canEditProject && (
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => onEditProject(project)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
