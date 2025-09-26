'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description: string;
  projectManager: {
    id: string;
    name: string;
    email: string;
  };
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate: string;
  endDate: string;
  progress: number;
  members: number;
  tasks: {
    total: number;
    completed: number;
    pending: number;
  };
  createdAt: string;
  lastUpdated: string;
}

const BusinessProjectsPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI/UX',
      projectManager: {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@company.com'
      },
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      progress: 65,
      members: 5,
      tasks: {
        total: 20,
        completed: 13,
        pending: 7
      },
      createdAt: '2024-01-10',
      lastUpdated: '2024-12-20'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Develop mobile application for iOS and Android',
      projectManager: {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@company.com'
      },
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-05-01',
      progress: 30,
      members: 8,
      tasks: {
        total: 35,
        completed: 10,
        pending: 25
      },
      createdAt: '2024-01-25',
      lastUpdated: '2024-12-19'
    },
    {
      id: '3',
      name: 'Database Migration',
      description: 'Migrate legacy database to new cloud infrastructure',
      projectManager: {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@company.com'
      },
      status: 'completed',
      startDate: '2024-01-01',
      endDate: '2024-02-28',
      progress: 100,
      members: 3,
      tasks: {
        total: 15,
        completed: 15,
        pending: 0
      },
      createdAt: '2023-12-15',
      lastUpdated: '2024-02-28'
    },
    {
      id: '4',
      name: 'API Integration',
      description: 'Integrate third-party APIs for payment processing',
      projectManager: {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@company.com'
      },
      status: 'on-hold',
      startDate: '2024-03-01',
      endDate: '2024-04-15',
      progress: 20,
      members: 4,
      tasks: {
        total: 12,
        completed: 2,
        pending: 10
      },
      createdAt: '2024-02-20',
      lastUpdated: '2024-12-15'
    },
    {
      id: '5',
      name: 'Security Audit',
      description: 'Comprehensive security audit and vulnerability assessment',
      projectManager: {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@company.com'
      },
      status: 'active',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      progress: 45,
      members: 2,
      tasks: {
        total: 8,
        completed: 3,
        pending: 5
      },
      createdAt: '2024-11-25',
      lastUpdated: '2024-12-18'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on-hold' | 'cancelled'>('all');
  const [pmFilter, setPmFilter] = useState<string>('all');

  // Get unique project managers for filter
  const projectManagers = Array.from(
    new Set(projects.map(p => p.projectManager.id))
  ).map(id => projects.find(p => p.projectManager.id === id)?.projectManager).filter(Boolean);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPM = pmFilter === 'all' || project.projectManager.id === pmFilter;
    
    return matchesSearch && matchesStatus && matchesPM;
  });

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#10B981', text: 'Đang thực hiện', bg: '#ECFDF5' },
      completed: { color: '#059669', text: 'Hoàn thành', bg: '#D1FAE5' },
      'on-hold': { color: '#F59E0B', text: 'Tạm dừng', bg: '#FEF3C7' },
      cancelled: { color: '#DC2626', text: 'Đã hủy', bg: '#FEE2E2' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className="status-badge"
        style={{
          color: config.color,
          backgroundColor: config.bg
        }}
      >
        {config.text}
      </span>
    );
  };


  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10B981';
    if (progress >= 60) return '#3B82F6';
    if (progress >= 40) return '#F59E0B';
    return '#DC2626';
  };

  return (
    <div className="business-projects-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Quản Lý Dự Án</h1>
          <p>Xem và quản lý tất cả dự án trong tổ chức</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tổng Dự Án</h3>
            <p className="stat-number">{projects.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Đang Thực Hiện</h3>
            <p className="stat-number">{projects.filter(p => p.status === 'active').length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Hoàn Thành</h3>
            <p className="stat-number">{projects.filter(p => p.status === 'completed').length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên dự án hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="on-hold">Tạm dừng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>


        <div className="filter-group">
          <select
            value={pmFilter}
            onChange={(e) => setPmFilter(e.target.value)}
          >
            <option value="all">Tất cả PM</option>
            {projectManagers.map((pm) => (
              <option key={pm?.id} value={pm?.id}>
                {pm?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="projects-table-container">
        <div className="table-header">
          <div className="header-left">
            <h3>Danh Sách Dự Án</h3>
            <span className="project-count">{filteredProjects.length} dự án</span>
          </div>
        </div>

        <div className="projects-table">
          <div className="table-header-row">
            <div className="col-project">Dự án</div>
            <div className="col-pm">Project Manager</div>
            <div className="col-status">Trạng thái</div>
            <div className="col-progress">Tiến độ</div>
            <div className="col-members">Thành viên</div>
            <div className="col-tasks">Tasks</div>
            <div className="col-dates">Thời gian</div>
          </div>

          {filteredProjects.map((project) => (
            <div key={project.id} className="table-row" onClick={() => handleProjectClick(project.id)}>
              <div className="col-project">
                <div className="project-info">
                  <div className="project-details">
                    <span className="project-name">{project.name}</span>
                    <span className="project-description">{project.description}</span>
                  </div>
                </div>
              </div>

              <div className="col-pm">
                <div className="pm-info">
                  <div className="pm-avatar">
                    {project.projectManager.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="pm-details">
                    <span className="pm-name">{project.projectManager.name}</span>
                    <span className="pm-email">{project.projectManager.email}</span>
                  </div>
                </div>
              </div>

              <div className="col-status">
                {getStatusBadge(project.status)}
              </div>

              <div className="col-progress">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: getProgressColor(project.progress)
                      }}
                    />
                  </div>
                  <span className="progress-text">{project.progress}%</span>
                </div>
              </div>

              <div className="col-members">
                <span className="member-count">{project.members} thành viên</span>
              </div>

              <div className="col-tasks">
                <div className="task-stats">
                  <span className="task-completed">{project.tasks.completed}</span>
                  <span className="task-separator">/</span>
                  <span className="task-total">{project.tasks.total}</span>
                </div>
              </div>

              <div className="col-dates">
                <div className="date-info">
                  <span className="start-date">Bắt đầu: {project.startDate}</span>
                  <span className="end-date">Kết thúc: {project.endDate}</span>
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
          padding: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-content h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0D062D;
          margin: 0 0 8px 0;
        }

        .header-content p {
          font-size: 16px;
          color: #787486;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: #F9F4EE;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF5E13;
        }

        .stat-content h3 {
          font-size: 12px;
          color: #787486;
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #0D062D;
          margin: 0;
        }

        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
          background: white;
          border-radius: 8px;
        }

        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #787486;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 44px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #FF5E13;
        }

        .filter-group select {
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.3s ease;
          min-width: 150px;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #FF5E13;
        }

        .projects-table-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid #F1F5F9;
          position: relative;
        }

        .projects-table-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #FF5E13, transparent);
          opacity: 0.3;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #F3F4F6;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .table-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .project-count {
          font-size: 14px;
          color: #787486;
        }

        .projects-table {
          overflow-x: auto;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1fr 1.5fr;
          gap: 16px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 2px solid #E2E8F0;
          position: relative;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .table-header-row::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FF5E13, #FF8C42, #FFA463);
          border-radius: 0 0 2px 2px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1fr 1.5fr;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #F1F5F9;
          align-items: start;
          transition: all 0.3s ease;
          background: white;
          cursor: pointer;
        }

        .table-row:hover {
          background: linear-gradient(135deg, #FEF7F0 0%, #FFF5F0 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.08);
          border-left: 3px solid #FF5E13;
        }

        .table-row:nth-child(even) {
          background: #FAFBFC;
        }

        .table-row:nth-child(even):hover {
          background: linear-gradient(135deg, #FEF7F0 0%, #FFF5F0 100%);
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
          gap: 2px;
        }

        .project-name {
          font-size: 15px;
          font-weight: 700;
          color: #0D062D;
          transition: color 0.3s ease;
        }

        .table-row:hover .project-name {
          color: #FF5E13;
        }

        .project-description {
          font-size: 12px;
          color: #64748B;
          font-weight: 500;
          line-height: 1.3;
        }

        .col-pm {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .pm-info {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .pm-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .pm-details {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .pm-name {
          font-size: 13px;
          font-weight: 600;
          color: #0D062D;
        }

        .pm-email {
          font-size: 11px;
          color: #64748B;
        }

        .col-status {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .status-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 6px;
          border-radius: 4px;
          display: inline-block;
          transition: all 0.3s ease;
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
          gap: 8px;
          width: 100%;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #E5E7EB;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          min-width: 35px;
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
          gap: 2px;
          font-size: 13px;
          font-weight: 600;
        }

        .task-completed {
          color: #10B981;
        }

        .task-separator {
          color: #6B7280;
        }

        .task-total {
          color: #475569;
        }

        .col-dates {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .date-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
        }

        .start-date, .end-date {
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
        }

        @media (max-width: 1200px) {
          .table-header-row,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
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
            padding: 8px 0;
            border-bottom: 1px solid #F3F4F6;
          }

          .col-project::before { content: "Dự án: "; font-weight: 600; }
          .col-pm::before { content: "PM: "; font-weight: 600; }
          .col-status::before { content: "Trạng thái: "; font-weight: 600; }
          .col-progress::before { content: "Tiến độ: "; font-weight: 600; }
          .col-members::before { content: "Thành viên: "; font-weight: 600; }
          .col-tasks::before { content: "Tasks: "; font-weight: 600; }
          .col-dates::before { content: "Thời gian: "; font-weight: 600; }
        }

        @media (max-width: 768px) {
          .business-projects-page {
            padding: 16px;
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
        }
      `}</style>
    </div>
  );
};

export default BusinessProjectsPage;
