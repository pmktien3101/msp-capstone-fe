'use client';

import { Milestone } from '@/types/milestone';
import { Project } from '@/types/project';

interface MilestonesProps {
  milestones: Milestone[];
  selectedProject: Project | null;
  onCreateMilestone: () => void;
}

export default function Milestones({ milestones, selectedProject, onCreateMilestone }: MilestonesProps) {
  const upcomingMilestones = milestones
    .filter(milestone => {
      const isUpcoming = milestone.status === 'pending' || milestone.status === 'in-progress';
      const matchesProject = !selectedProject || milestone.projectId === selectedProject.id;
      return isUpcoming && matchesProject;
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 3);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in-progress':
        return '#FFA463';
      case 'delayed':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'delayed':
        return 'Trễ hạn';
      default:
        return 'Chờ bắt đầu';
    }
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date() && !milestones.find(m => m.endDate === endDate)?.status.includes('completed');
  };

  return (
    <div className="milestones">
      <div className="section-header">
        <h3>Milestones</h3>
        <button 
          className="create-milestone-btn"
          onClick={onCreateMilestone}
          title="Tạo milestone mới"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="milestones-list">
        {upcomingMilestones.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="empty-icon">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Không có milestone nào</p>
            <button className="btn-primary" onClick={onCreateMilestone}>
              Tạo milestone
            </button>
          </div>
        ) : (
          upcomingMilestones.map((milestone) => (
            <div key={milestone.id} className="milestone-item">
              <div className="milestone-header">
                <h4 className="milestone-name">{milestone.name}</h4>
                <div className={`milestone-status ${milestone.status}`}>
                  <span 
                    className="status-dot" 
                    style={{ backgroundColor: getStatusColor(milestone.status) }}
                  ></span>
                  {getStatusText(milestone.status)}
                </div>
              </div>
              
              <div className="milestone-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${milestone.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{milestone.progress}%</span>
              </div>

              <div className="milestone-details">
                <p className="milestone-date">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Hạn: {formatDate(milestone.endDate)}
                  {isOverdue(milestone.endDate) && (
                    <span className="overdue-badge">Trễ hạn</span>
                  )}
                </p>
                <p className="milestone-priority">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Ưu tiên: {milestone.priority}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
