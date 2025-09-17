'use client';

import { useState } from 'react';
import { Project } from '@/types/project';

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
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className={sortDirection === 'asc' ? 'asc' : 'desc'}
                      >
                        <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className={sortDirection === 'asc' ? 'asc' : 'desc'}
                      >
                        <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className={sortDirection === 'asc' ? 'asc' : 'desc'}
                      >
                        <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className={sortDirection === 'asc' ? 'asc' : 'desc'}
                      >
                        <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className={sortDirection === 'asc' ? 'asc' : 'desc'}
                      >
                        <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                  <div className="status-badge" style={{ backgroundColor: getStatusColor(project.status) }}>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => onEditProject(project)}
                      title="Chỉnh sửa"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="action-btn meeting-btn"
                      onClick={() => onAddMeeting(project)}
                      title="Thêm cuộc họp"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 14H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 14H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 18H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 18H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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

        .sort-indicator svg {
          color: #6b7280;
          transition: transform 0.2s ease;
        }

        .sort-indicator svg.asc {
          transform: rotate(180deg);
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
          border-radius: 20px;
          color: white;
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
          background: linear-gradient(90deg, #10b981, #059669);
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
          background: #f3f4f6;
          color: #6b7280;
        }

        .view-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .edit-btn {
          background: #fef3c7;
          color: #d97706;
        }

        .edit-btn:hover {
          background: #fde68a;
          color: #b45309;
        }

        .meeting-btn {
          background: #dbeafe;
          color: #2563eb;
        }

        .meeting-btn:hover {
          background: #bfdbfe;
          color: #1d4ed8;
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

