'use client';

import { mockTasks, mockMeetings, mockProject, mockMembers } from '@/constants/mockData';

export const PMOverviewCards = () => {
  // Tính toán số liệu cho PM dashboard từ mockData.ts
  const totalProjects = 1; // Chỉ có 1 dự án chính từ mockData.ts
  const activeProjects = mockProject.status === 'active' ? 1 : 0; // Dự án chính
  
  // Tính số cuộc họp hôm nay
  const today = new Date().toISOString().split('T')[0];
  const todayMeetings = mockMeetings.filter(meeting => 
    meeting.startTime.startsWith(today)
  ).length;
  
  // Tính số công việc đang làm
  const inProgressTasks = mockTasks.filter(task => 
    task.status === 'in-progress'
  ).length;

  const overviewData = [
    {
      id: 'total-projects',
      title: `${totalProjects}`,
      subtitle: 'Tổng dự án đang quản lý',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#fb923c'
    },
    {
      id: 'active-projects',
      title: `${activeProjects}`,
      subtitle: 'Số dự án đang thực hiện',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#10b981'
    },
    {
      id: 'today-meetings',
      title: `${todayMeetings}`,
      subtitle: 'Số cuộc họp hôm nay',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#fbbf24'
    },
    {
      id: 'in-progress-tasks',
      title: `${inProgressTasks}`,
      subtitle: 'Số công việc đang làm',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#fb923c'
    }
  ];

  return (
    <div className="overview-cards">
      {overviewData.map((card) => (
        <div key={card.id} className="overview-card">
          <div className="card-icon" style={{ color: card.color }}>
            {card.icon}
          </div>
          <div className="card-content">
            <h3 className="card-title">{card.title}</h3>
            <p className="card-subtitle">{card.subtitle}</p>
          </div>
        </div>
      ))}

      <style jsx>{`
        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .overview-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .overview-card:hover {
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .card-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .card-content {
          flex: 1;
        }

        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 3px 0;
          line-height: 1.2;
        }

        .card-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.3;
        }

        @media (max-width: 768px) {
          .overview-cards {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .overview-card {
            padding: 16px;
          }

          .card-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};
