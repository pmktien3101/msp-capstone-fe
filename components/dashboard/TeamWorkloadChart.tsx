'use client';

import { mockMembers, mockTasks, mockProjects, mockMilestones } from '@/constants/mockData';
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface TeamWorkloadChartProps {
  projectId?: string;
}

export const TeamWorkloadChart = ({ projectId = "1" }: TeamWorkloadChartProps) => {
  // Lấy project cụ thể
  const currentProject = mockProjects.find(p => p.id === projectId);
  if (!currentProject) {
    return <div>Project not found</div>;
  }

  // Lấy tasks của project cụ thể
  const projectMilestones = mockMilestones.filter(m => m.projectId === projectId);
  const projectTasks = mockTasks.filter(task => 
    task.milestoneIds.some(milestoneId => projectMilestones.some(m => m.id === milestoneId))
  );

  // Lấy chỉ những thành viên thuộc về project này
  const projectMembers = mockMembers.filter(member => 
    currentProject.members.includes(member.id)
  );

  // Tính toán workload cho từng thành viên của project
  const memberWorkload = projectMembers.map(member => {
    const memberTasks = projectTasks.filter(task => task.assignee === member.id);
    const completedTasks = memberTasks.filter(task => task.status === 'done').length;
    const inProgressTasks = memberTasks.filter(task => task.status === 'in-progress').length;
    const todoTasks = memberTasks.filter(task => task.status === 'todo').length;
    const reviewTasks = memberTasks.filter(task => task.status === 'review').length;
    
    // Tính completion rate
    const completionRate = memberTasks.length > 0 
      ? Math.round((completedTasks / memberTasks.length) * 100) 
      : 0;

    // Tính overdue tasks
    const overdueTasks = memberTasks.filter(task => {
      if (!task.endDate || task.status === 'done') return false;
      return new Date(task.endDate) < new Date();
    }).length;

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      avatar: member.avatar,
      totalTasks: memberTasks.length,
      completedTasks,
      inProgressTasks,
      todoTasks,
      reviewTasks,
      overdueTasks,
      completionRate,
      workload: memberTasks.length // Đơn giản hóa khối lượng công việc = số nhiệm vụ
    };
  });

  // Tính toán tổng quan team
  const totalTeamTasks = projectTasks.length;
  const totalCompletedTasks = projectTasks.filter(task => task.status === 'done').length;
  const totalInProgressTasks = projectTasks.filter(task => task.status === 'in-progress').length;
  const totalOverdueTasks = projectTasks.filter(task => {
    if (!task.endDate || task.status === 'done') return false;
    return new Date(task.endDate) < new Date();
  }).length;

  const teamCompletionRate = totalTeamTasks > 0 
    ? Math.round((totalCompletedTasks / totalTeamTasks) * 100) 
    : 0;

  // Sắp xếp theo khối lượng công việc (cao nhất trước)
  const sortedMembers = [...memberWorkload].sort((a, b) => b.workload - a.workload);


  return (
    <div className="team-workload-chart">
      <div className="chart-header">
        <h3>Các Thành Viên Trong Nhóm</h3>
        <div className="team-summary">
          <div className="summary-item">
            <Users size={16} />
            <span>{projectMembers.length} thành viên</span>
          </div>
          <div className="summary-item">
            <CheckCircle size={16} />
            <span>{teamCompletionRate}% hoàn thành</span>
          </div>
          <div className="summary-item">
            <AlertTriangle size={16} />
            <span>{totalOverdueTasks} trễ hạn</span>
          </div>
        </div>
      </div>

      {/* Tổng Quan Nhóm */}
      <div className="team-overview">
        <div className="overview-card">
          <div className="overview-header">
            <h4>Tổng Quan Nhóm</h4>
          </div>
          <div className="overview-stats">
            <div className="stat-row">
              <span className="stat-label">Tổng công việc:</span>
              <span className="stat-value">{totalTeamTasks}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Hoàn thành:</span>
              <span className="stat-value">{totalCompletedTasks}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Đang làm:</span>
              <span className="stat-value">{totalInProgressTasks}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Trễ hạn:</span>
              <span className="stat-value">{totalOverdueTasks}</span>
            </div>
          </div>
          <div className="team-progress">
            <div className="progress-header">
              <span>Tiến độ nhóm</span>
              <span>{teamCompletionRate}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${teamCompletionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Khối Lượng Công Việc Thành Viên */}
      <div className="members-section">
        <h4>Khối Lượng Công Việc Theo Thành Viên</h4>
        <div className="members-list">
          {sortedMembers.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-header">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.avatar}
                  </div>
                  <div className="member-details">
                    <h5 className="member-name">{member.name}</h5>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
              </div>

              <div className="member-stats">
                <div className="stats-grid">
                  <div className="stat-item">
                    <Clock size={14} />
                    <span className="stat-label">Tổng:</span>
                    <span className="stat-value">{member.totalTasks}</span>
                  </div>
                  <div className="stat-item">
                    <CheckCircle size={14} />
                    <span className="stat-label">Hoàn thành:</span>
                    <span className="stat-value">{member.completedTasks}</span>
                  </div>
                  <div className="stat-item">
                    <Clock size={14} />
                    <span className="stat-label">Đang làm:</span>
                    <span className="stat-value">{member.inProgressTasks}</span>
                  </div>
                  <div className="stat-item">
                    <AlertTriangle size={14} />
                    <span className="stat-label">Trễ hạn:</span>
                    <span className="stat-value">{member.overdueTasks}</span>
                  </div>
                </div>

                <div className="member-progress">
                  <div className="progress-info">
                    <span className="progress-label">Tiến độ cá nhân</span>
                    <span className="progress-percentage">{member.completionRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${member.completionRate}%`,
                        backgroundColor: '#3b82f6'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .team-workload-chart {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .team-summary {
          display: flex;
          gap: 12px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .team-overview {
          margin-bottom: 20px;
        }

        .overview-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
        }

        .overview-header h4 {
          margin: 0 0 10px 0;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .overview-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 11px;
          color: #6b7280;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .team-progress {
          margin-top: 10px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-header span:first-child {
          font-size: 11px;
          color: #374151;
          font-weight: 500;
        }

        .progress-header span:last-child {
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
        }

        .progress-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .members-section h4 {
          margin: 0 0 10px 0;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .members-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .member-card {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px;
          background: white;
        }

        .member-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .member-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
        }

        .member-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .member-name {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .member-role {
          font-size: 11px;
          color: #6b7280;
        }


        .member-stats {
          margin-top: 10px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stat-item svg {
          color: #6b7280;
        }

        .stat-item .stat-label {
          font-size: 10px;
          color: #6b7280;
        }

        .stat-item .stat-value {
          font-size: 11px;
          font-weight: 600;
          color: #1f2937;
        }

        .member-progress {
          margin-top: 8px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .progress-label {
          font-size: 10px;
          color: #6b7280;
          font-weight: 500;
        }

        .progress-percentage {
          font-size: 11px;
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .team-summary {
            flex-direction: column;
            gap: 8px;
          }

          .overview-stats {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .member-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
