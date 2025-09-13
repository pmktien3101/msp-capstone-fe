'use client';

import React, { useState } from 'react';

const BusinessDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const stats = [
    {
      title: 'Tổng Doanh Thu',
      value: '$125,430',
      change: '+12.5%',
      changeType: 'positive',
      icon: '💰'
    },
    {
      title: 'Dự Án Hoạt Động',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: '📊'
    },
    {
      title: 'Nhân Viên',
      value: '45',
      change: '+5',
      changeType: 'positive',
      icon: '👥'
    },
    {
      title: 'Khách Hàng',
      value: '156',
      change: '+23',
      changeType: 'positive',
      icon: '🏢'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Website Thương Mại Điện Tử',
      status: 'active',
      progress: 75,
      budget: '$50,000',
      deadline: '2024-06-30'
    },
    {
      id: 2,
      name: 'Ứng Dụng Mobile',
      status: 'active',
      progress: 45,
      budget: '$30,000',
      deadline: '2024-08-15'
    },
    {
      id: 3,
      name: 'Hệ Thống CRM',
      status: 'completed',
      progress: 100,
      budget: '$25,000',
      deadline: '2024-04-20'
    }
  ];

  const upcomingMeetings = [
    {
      id: 1,
      title: 'Họp Đánh Giá Tháng',
      time: '14:00 - 15:30',
      date: 'Hôm nay',
      participants: 8
    },
    {
      id: 2,
      title: 'Review Dự Án Website',
      time: '10:00 - 11:00',
      date: 'Ngày mai',
      participants: 5
    },
    {
      id: 3,
      title: 'Họp Kế Hoạch Q3',
      time: '09:00 - 10:30',
      date: 'Thứ 6',
      participants: 12
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#D1FAE5', textColor: '#065F46', text: 'Hoạt động' },
      completed: { color: '#DBEAFE', textColor: '#1E40AF', text: 'Hoàn thành' },
      pending: { color: '#FEF3C7', textColor: '#92400E', text: 'Chờ xử lý' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: config.color, 
          color: config.textColor 
        }}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="business-dashboard">
      <div className="dashboard-header">
        <h1>Business Dashboard</h1>
        <p>Quản lý và theo dõi hoạt động kinh doanh</p>
        
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Tuần
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Tháng
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'quarter' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('quarter')}
          >
            Quý
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <span className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-left">
          {/* Recent Projects */}
          <div className="section-card">
            <div className="section-header">
              <h3>Dự Án Gần Đây</h3>
              <button className="view-all-btn">Xem tất cả</button>
            </div>
            
            <div className="projects-list">
              {recentProjects.map((project) => (
                <div key={project.id} className="project-item">
                  <div className="project-info">
                    <h4>{project.name}</h4>
                    <div className="project-meta">
                      <span>Ngân sách: {project.budget}</span>
                      <span>Hạn: {project.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="project-status">
                    {getStatusBadge(project.status)}
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="content-right">
          {/* Upcoming Meetings */}
          <div className="section-card">
            <div className="section-header">
              <h3>Cuộc Họp Sắp Tới</h3>
              <button className="create-btn">+ Tạo mới</button>
            </div>
            
            <div className="meetings-list">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="meeting-item">
                  <div className="meeting-time">
                    <span className="time">{meeting.time}</span>
                    <span className="date">{meeting.date}</span>
                  </div>
                  
                  <div className="meeting-info">
                    <h4>{meeting.title}</h4>
                    <span className="participants">
                      {meeting.participants} người tham gia
                    </span>
                  </div>
                  
                  <button className="join-btn">Tham gia</button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="section-card">
            <div className="section-header">
              <h3>Thao Tác Nhanh</h3>
            </div>
            
            <div className="quick-actions">
              <button className="action-btn">
                <span className="action-icon">📊</span>
                <span>Tạo Báo Cáo</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">👥</span>
                <span>Quản Lý Nhân Viên</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">💼</span>
                <span>Dự Án Mới</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">📅</span>
                <span>Lịch Họp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .business-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .dashboard-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0D062D;
          margin: 0 0 8px 0;
        }

        .dashboard-header p {
          font-size: 16px;
          color: #787486;
          margin: 0 0 20px 0;
        }

        .period-selector {
          display: flex;
          gap: 8px;
        }

        .period-btn {
          padding: 8px 16px;
          border: 2px solid #E5E7EB;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #787486;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .period-btn:hover {
          border-color: #FFA463;
          color: #FF5E13;
        }

        .period-btn.active {
          background: #FF5E13;
          border-color: #FF5E13;
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-icon {
          font-size: 32px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h3 {
          font-size: 14px;
          color: #787486;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #0D062D;
          margin: 0 0 4px 0;
        }

        .stat-change {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .stat-change.positive {
          background: #D1FAE5;
          color: #065F46;
        }

        .main-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .section-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .view-all-btn, .create-btn {
          background: none;
          border: none;
          color: #FF5E13;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .view-all-btn:hover, .create-btn:hover {
          color: #FFA463;
        }

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .project-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid #F3F4F6;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .project-item:hover {
          border-color: #FFDBBD;
          background: #F9F4EE;
        }

        .project-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 8px 0;
        }

        .project-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #787486;
        }

        .project-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .progress-bar {
          width: 100px;
          height: 6px;
          background: #F3F4F6;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          color: #787486;
          font-weight: 500;
        }

        .meetings-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .meeting-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #F3F4F6;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .meeting-item:hover {
          border-color: #FFDBBD;
          background: #F9F4EE;
        }

        .meeting-time {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 80px;
        }

        .meeting-time .time {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
        }

        .meeting-time .date {
          font-size: 12px;
          color: #787486;
        }

        .meeting-info {
          flex: 1;
        }

        .meeting-info h4 {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 4px 0;
        }

        .participants {
          font-size: 12px;
          color: #787486;
        }

        .join-btn {
          background: #FF5E13;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .join-btn:hover {
          background: #FFA463;
          transform: translateY(-2px);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 16px;
          background: #F9F4EE;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          border-color: #FFDBBD;
          background: #FDF0D2;
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 24px;
        }

        .action-btn span:last-child {
          font-size: 12px;
          font-weight: 500;
          color: #0D062D;
          text-align: center;
        }

        @media (max-width: 768px) {
          .business-dashboard {
            padding: 16px;
          }

          .main-content {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .project-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .project-status {
            align-items: flex-start;
            width: 100%;
          }

          .meeting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BusinessDashboard;
