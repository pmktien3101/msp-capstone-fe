'use client';

import { Project } from '@/types/project';
import { mockTasks, mockMilestones, mockMembers } from '@/constants/mockData';

interface OverviewCardsProps {
  project: Project;
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    review: number;
    completionRate: number;
  };
}

export const OverviewCards = ({ project, stats }: OverviewCardsProps) => {
  // Filter data for this specific project
  const projectMilestones = mockMilestones.filter(m => m.projectId === project.id);
  const projectTasks = mockTasks.filter(task => 
    task.milestoneIds.some(milestoneId => projectMilestones.some(m => m.id === milestoneId))
  );
  const projectMembers = mockMembers.filter(member => 
    project.members?.some(m => m.id === member.id)
  );
  
  // Tính toán các số liệu mới
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(task => task.status === 'done').length;
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalMilestones = projectMilestones.length;
  const completedMilestones = projectMilestones.filter(milestone => 
    projectTasks.filter(task => task.milestoneIds?.includes(milestone.id))
      .every(task => task.status === 'done')
  ).length;
  
  const overviewData = [
    {
      id: 'completion-rate',
      title: `${completedPercentage}%`,
      subtitle: 'Phần trăm tổng thể',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#10b981'
    },
    {
      id: 'milestones',
      title: `${completedMilestones}/${totalMilestones}`,
      subtitle: 'Cột mốc hoàn thành',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#fb923c'
    },
    {
      id: 'completed-tasks',
      title: `${completedTasks}`,
      subtitle: 'Task hoàn thành',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#fbbf24'
    },
    {
      id: 'members',
      title: `${projectMembers.length}`,
      subtitle: 'Thành viên dự án',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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