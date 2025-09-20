'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Eye, Edit, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface ProjectsTableProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
  onAddMeeting: (project: Project) => void;
  onViewProject: (projectId: string) => void;
}

export function ProjectsTable({ projects, onEditProject, onAddMeeting, onViewProject }: ProjectsTableProps) {
  const [sortField, setSortField] = useState<keyof Project>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'planning':
        return '#f59e0b';
      case 'on-hold':
        return '#ef4444';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#dcfce7';
      case 'planning':
        return '#fef3c7';
      case 'on-hold':
        return '#fee2e2';
      case 'completed':
        return '#f3f4f6';
      default:
        return '#f3f4f6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'planning':
        return 'Lên kế hoạch';
      case 'on-hold':
        return 'Tạm dừng';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
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
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

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
                  <span>Tên dự án</span>
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
                  <span>Trạng thái</span>
                  <div className="sort-indicator">
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </div>
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('progress')}
              >
                <div className="th-content">
                  <span>Tiến độ</span>
                  <div className="sort-indicator">
                    {sortField === 'progress' && (
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
                  <span>Ngày bắt đầu</span>
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
                  <span>Ngày kết thúc</span>
                  <div className="sort-indicator">
                    {sortField === 'endDate' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </div>
              </th>
              <th>Thành viên</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((project) => (
              <tr key={project.id} className="project-row">
                <td className="project-name-cell">
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-key">PMS-{project.id}</div>
                    <div className="project-description">{project.description}</div>
                  </div>
                </td>
                <td className="status-cell">
                  <div 
                    className="status-badge" 
                    style={{ 
                      color: getStatusColor(project.status),
                      backgroundColor: getStatusBackgroundColor(project.status),
                      borderColor: getStatusColor(project.status)
                    }}
                  >
                    {getStatusText(project.status)}
                  </div>
                </td>
                <td className="progress-cell">
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{project.progress}%</span>
                  </div>
                </td>
                <td className="date-cell">
                  {formatDate(project.startDate)}
                </td>
                <td className="date-cell">
                  {formatDate(project.endDate)}
                </td>
                <td className="members-cell">
                  <div className="members-list">
                    {project.members.slice(0, 3).map((member) => (
                      <div key={member.id} className="member-avatar" title={member.name}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          <span>{member.name.charAt(0)}</span>
                        )}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="member-count">+{project.members.length - 3}</div>
                    )}
                  </div>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => onViewProject(project.id)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => onEditProject(project)}
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn meeting-btn"
                      onClick={() => onAddMeeting(project)}
                      title="Thêm cuộc họp"
                    >
                      <Calendar size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .projects-table-container {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .projects-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .projects-table thead {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .projects-table th {
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .projects-table th.sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .projects-table th.sortable:hover {
          background: #f1f5f9;
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-indicator {
          display: flex;
          align-items: center;
        }

        .sort-indicator {
          color: #6b7280;
          transition: transform 0.2s ease;
        }

        .projects-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }

        .projects-table tbody tr:hover {
          background: #f8fafc;
        }

        .projects-table tbody tr:last-child {
          border-bottom: none;
        }

        .projects-table td {
          padding: 16px 12px;
          vertical-align: top;
        }

        .project-name-cell {
          min-width: 250px;
        }

        .project-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .project-name {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .project-key {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }

        .project-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
          margin-top: 2px;
        }

        .status-cell {
          min-width: 120px;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          border: 1px solid;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }


        .progress-cell {
          min-width: 120px;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #FF5E13;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          min-width: 35px;
        }

        .date-cell {
          min-width: 100px;
          font-size: 12px;
          color: #6b7280;
        }

        .members-cell {
          min-width: 100px;
        }

        .members-list {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .member-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          color: #374151;
          overflow: hidden;
        }

        .member-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .member-count {
          font-size: 10px;
          color: #6b7280;
          font-weight: 500;
        }

        .actions-cell {
          min-width: 120px;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn {
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
        }

        .view-btn:hover {
          background: #FF5E13;
          color: white;
        }

        .edit-btn {
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
        }

        .edit-btn:hover {
          background: #FF5E13;
          color: white;
        }

        .meeting-btn {
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
        }

        .meeting-btn:hover {
          background: #FF5E13;
          color: white;
        }

        @media (max-width: 768px) {
          .projects-table-container {
            border-radius: 8px;
          }
          
          .projects-table th,
          .projects-table td {
            padding: 12px 8px;
          }
          
          .project-name-cell {
            min-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}

