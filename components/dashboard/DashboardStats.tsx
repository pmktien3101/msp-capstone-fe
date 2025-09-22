'use client';

import { mockTasks, mockMeetings, mockProjects, mockMembers, mockMilestones } from '@/constants/mockData';
import { 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react';

interface DashboardStatsProps {
  projectId?: string;
}

export const DashboardStats = ({ projectId = "1" }: DashboardStatsProps) => {
  // Tính toán các số liệu từ mock data
  const totalProjects = mockProjects.length;
  const activeProjects = mockProjects.filter(p => p.status === 'active').length;
  
  // Lấy tasks của project cụ thể
  const projectMilestones = mockMilestones.filter(m => m.projectId === projectId);
  const projectTasks = mockTasks.filter(task => 
    task.milestoneIds.some(milestoneId => projectMilestones.some(m => m.id === milestoneId))
  );
  
  // Tính số liệu tasks
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(task => task.status === 'done').length;
  const inProgressTasks = projectTasks.filter(task => task.status === 'in-progress').length;
  const todoTasks = projectTasks.filter(task => task.status === 'todo').length;
  const reviewTasks = projectTasks.filter(task => task.status === 'review').length;
  
  // Tính số liệu meetings cho project cụ thể
  const projectMeetings = mockMeetings.filter(meeting => meeting.projectId === projectId);
  const totalMeetings = projectMeetings.length;
  const today = new Date().toISOString().split('T')[0];
  const todayMeetings = projectMeetings.filter(meeting => 
    meeting.startTime.startsWith(today)
  ).length;
  const upcomingMeetings = projectMeetings.filter(meeting => 
    new Date(meeting.startTime) > new Date() && meeting.status === 'Scheduled'
  ).length;
  
  // Tính số liệu team
  const totalMembers = mockMembers.length;
  const activeMembers = mockMembers.filter(member => member.tasks.length > 0).length;
  
  // Tính completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Tính overdue tasks
  const overdueTasks = projectTasks.filter(task => {
    if (!task.endDate || task.status === 'done') return false;
    return new Date(task.endDate) < new Date();
  }).length;

  const statsData = [
    {
      id: 'total-projects',
      title: 'Tổng Dự Án',
      value: totalProjects,
      icon: FolderOpen,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      change: '+1',
      changeType: 'positive' as const
    },
    {
      id: 'active-projects',
      title: 'Dự Án Đang Thực Hiện',
      value: activeProjects,
      icon: Target,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      change: '100%',
      changeType: 'positive' as const
    },
    {
      id: 'total-tasks',
      title: 'Tổng Công Việc',
      value: totalTasks,
      icon: CheckCircle,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      change: `+${totalTasks}`,
      changeType: 'positive' as const
    },
    {
      id: 'completion-rate',
      title: 'Tỷ Lệ Hoàn Thành',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      change: `${completionRate}%`,
      changeType: completionRate >= 70 ? 'positive' as const : 'neutral' as const
    },
    {
      id: 'in-progress-tasks',
      title: 'Đang Thực Hiện',
      value: inProgressTasks,
      icon: Clock,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      change: `${inProgressTasks}`,
      changeType: 'neutral' as const
    },
    {
      id: 'overdue-tasks',
      title: 'Trễ Hạn',
      value: overdueTasks,
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      change: overdueTasks > 0 ? `${overdueTasks}` : '0',
      changeType: overdueTasks > 0 ? 'negative' as const : 'positive' as const
    },
    {
      id: 'team-members',
      title: 'Thành Viên Team',
      value: totalMembers,
      icon: Users,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      change: `${activeMembers}/${totalMembers}`,
      changeType: 'neutral' as const
    },
    {
      id: 'today-meetings',
      title: 'Cuộc Họp Hôm Nay',
      value: todayMeetings,
      icon: Calendar,
      color: '#84cc16',
      bgColor: 'rgba(132, 204, 22, 0.1)',
      change: `${upcomingMeetings} sắp tới`,
      changeType: 'neutral' as const
    }
  ];

  return (
    <div className="dashboard-stats">
      <div className="stats-grid">
        {statsData.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-header">
                <div 
                  className="stat-icon"
                  style={{ 
                    backgroundColor: stat.bgColor,
                    color: stat.color 
                  }}
                >
                  <IconComponent size={20} />
                </div>
                <div className="stat-change">
                  <span 
                    className={`change-text ${stat.changeType}`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .dashboard-stats {
          margin-bottom: 32px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
          border-color: #d1d5db;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-change {
          display: flex;
          align-items: center;
        }

        .change-text {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .change-text.positive {
          color: #059669;
          background: rgba(5, 150, 105, 0.1);
        }

        .change-text.negative {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .change-text.neutral {
          color: #6b7280;
          background: rgba(107, 114, 128, 0.1);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .stat-title {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 8px;
          }

          .stat-card {
            padding: 10px;
          }

          .stat-value {
            font-size: 18px;
          }

          .stat-icon {
            width: 28px;
            height: 28px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
