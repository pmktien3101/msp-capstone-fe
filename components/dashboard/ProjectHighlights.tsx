'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { ProjectStatus, TaskStatus, TASK_STATUS_LABELS } from '@/constants/status';
import { 
  AlertTriangle, 
  Clock, 
  Flag, 
  Users,
  Calendar,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';

interface ProjectHighlightsProps {
  projects: Project[];
  tasks: any[];
  milestones: any[];
}

export const ProjectHighlights = ({ projects, tasks, milestones }: ProjectHighlightsProps) => {
  const router = useRouter();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set(['priority', 'milestones', 'onHold', 'inProgress']));

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };
  // Tính toán các dự án ưu tiên (dự án đang thực hiện có endDate gần nhất)
  const getPriorityProjects = () => {
    return projects
      .filter(project => project.status === ProjectStatus.InProgress) // Chỉ lấy dự án đang thực hiện
      .sort((a, b) => {
        if (!a.endDate || !b.endDate) return 0;
        const aEndDate = new Date(a.endDate);
        const bEndDate = new Date(b.endDate);
        return aEndDate.getTime() - bEndDate.getTime(); // Sắp xếp theo endDate gần nhất
      })
      .slice(0, 3); // Lấy top 3 dự án có endDate gần nhất
  };

  // Top 3 milestone quan trọng sắp đến hạn
  const getUpcomingMilestones = () => {
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    return milestones
      .filter((milestone: any) => {
        const dueDate = new Date(milestone.dueDate);
        return dueDate >= now && dueDate <= fourteenDaysFromNow;
      })
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  };

  // Task tạm dừng và đang làm
  const getTasksByStatus = () => {
    // Lọc task tạm dừng
    const onHoldTasks = tasks.filter((task: any) => 
      task.status === TaskStatus.Paused
    );

    // Lọc task đang làm
    const inProgressTasks = tasks.filter((task: any) => 
      task.status === TaskStatus.InProgress
    );

    return {
      onHold: onHoldTasks.slice(0, 5),
      inProgress: inProgressTasks.slice(0, 5)
    };
  };

  const priorityProjects = getPriorityProjects();
  const upcomingMilestones = getUpcomingMilestones();
  const { onHold, inProgress } = getTasksByStatus();

  const getPriorityLevel = (project: Project) => {
    if (!project.endDate) return 'medium';
    const now = new Date();
    const endDate = new Date(project.endDate);
    const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 3) return 'critical';
    if (daysUntilDeadline <= 7) return 'high';
    return 'medium';
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#3b82f6';
    }
  };

  const getPriorityLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Cấp bách';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      default: return 'Trung bình';
    }
  };

  return (
    <div className="project-highlights">
      {/* Header */}
      <div className="section-header">
        <h2>Dự án đang theo dõi</h2>
        <p>Các dự án ưu tiên và milestone quan trọng</p>
      </div>

      <div className="highlights-grid">
        {/* Priority Projects */}
        <div className="highlight-card">
          <div className="card-header" onClick={() => toggleCard('priority')}>
            <div className="card-title">
              <AlertTriangle size={20} />
              <h3>Dự án ưu tiên (dự án đang thực hiện)</h3>
            </div>
            <div className="card-header-right">
              <span className="count-badge">{priorityProjects.length}</span>
              {expandedCards.has('priority') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          
          <div className={`card-content ${expandedCards.has('priority') ? 'expanded' : 'collapsed'}`}>
            {priorityProjects.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={32} />
                <p>Không có dự án ưu tiên</p>
              </div>
            ) : (
              priorityProjects.map(project => {
                const priority = getPriorityLevel(project);
                if (!project.endDate) return null;
                const endDate = new Date(project.endDate);
                const daysUntilDeadline = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                // Calculate progress from tasks
                const projectTasks = tasks.filter((task: any) => task.projectId === project.id);
                const completedTasks = projectTasks.filter((task: any) => task.status === TaskStatus.Completed).length;
                const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
                
                return (
                  <div key={project.id} className="priority-item" onClick={() => handleProjectClick(project.id)}>
                    <div className="priority-indicator" style={{ backgroundColor: '#f59e0b' }} />
                    <div className="item-content">
                      <h4>{project.name}</h4>
                      <div className="item-details">
                        <span className="deadline">
                          <Calendar size={14} />
                          {'Còn lại: ' + (daysUntilDeadline > 0 ? `${daysUntilDeadline} ngày` : 'Quá hạn')}
                        </span>
                        <span className="progress">{progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: progress === 100 ? '#10b981' : progress > 50 ? '#3b82f6' : '#f59e0b'
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="highlight-card">
          <div className="card-header" onClick={() => toggleCard('milestones')}>
            <div className="card-title">
              <Flag size={20} />
              <h3>Cột mốc sắp đến hạn</h3>
            </div>
            <div className="card-header-right">
              <span className="count-badge">{upcomingMilestones.length}</span>
              {expandedCards.has('milestones') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          
          <div className={`card-content ${expandedCards.has('milestones') ? 'expanded' : 'collapsed'}`}>
            {upcomingMilestones.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={32} />
                <p>Không có cột mốc sắp đến hạn</p>
              </div>
            ) : (
              upcomingMilestones.map((milestone: any) => {
                const project = projects.find((p: any) => p.id === milestone.projectId);
                const dueDate = new Date(milestone.dueDate);
                const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={milestone.id} className="milestone-item">
                    <div className="milestone-info">
                      <h4>{milestone.name}</h4>
                      <p 
                        className="project-link"
                        onClick={() => project && handleProjectClick(project.id)}
                      >
                        {milestone.projectName || project?.name}
                      </p>
                    </div>
                    <div className="milestone-due">
                      <Clock size={14} />
                      <span>{daysUntilDue} ngày</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* On Hold Tasks */}
        <div className="highlight-card">
          <div className="card-header" onClick={() => toggleCard('onHold')}>
            <div className="card-title">
              <AlertTriangle size={20} />
              <h3>Công việc tạm dừng</h3>
            </div>
            <div className="card-header-right">
              <span className="count-badge">{onHold.length}</span>
              {expandedCards.has('onHold') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          
          <div className={`card-content ${expandedCards.has('onHold') ? 'expanded' : 'collapsed'}`}>
            {onHold.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={32} />
                <p>Không có công việc tạm dừng</p>
              </div>
            ) : (
              onHold.map((task: any) => {
                const project = projects.find((p: any) => p.id === task.projectId);
                return (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <h4>{task.name}</h4>
                      <div className="task-meta">
                        <p className="assignee">{task.user?.fullName || 'Chưa phân công'}</p>
                        <p 
                          className="project project-link"
                          onClick={() => project && handleProjectClick(project.id)}
                        >
                          {task.projectName || project?.name}
                        </p>
                      </div>
                    </div>
                    <div className="task-status on-hold">
                      <AlertCircle size={14} />
                      <span>{TASK_STATUS_LABELS[TaskStatus.Paused]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="highlight-card">
          <div className="card-header" onClick={() => toggleCard('inProgress')}>
            <div className="card-title">
              <Activity size={20} />
              <h3>Công việc đang làm</h3>
            </div>
            <div className="card-header-right">
              <span className="count-badge">{inProgress.length}</span>
              {expandedCards.has('inProgress') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          
          <div className={`card-content ${expandedCards.has('inProgress') ? 'expanded' : 'collapsed'}`}>
            {inProgress.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={32} />
                <p>Không có công việc đang làm</p>
              </div>
            ) : (
              inProgress.map((task: any) => {
                const project = projects.find((p: any) => p.id === task.projectId);
                return (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <h4>{task.name}</h4>
                      <div className="task-meta">
                        <p className="assignee">{task.user?.fullName || 'Chưa phân công'}</p>
                        <p 
                          className="project project-link"
                          onClick={() => project && handleProjectClick(project.id)}
                        >
                          {task.projectName || project?.name}
                        </p>
                      </div>
                    </div>
                    <div className="task-status in-progress">
                      <Activity size={14} />
                      <span>{TASK_STATUS_LABELS[TaskStatus.InProgress]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .project-highlights {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-header h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .section-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .highlight-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .card-header:hover {
          background: #f3f4f6;
        }

        .card-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .count-badge {
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .card-content {
          padding: 16px;
          max-height: 300px;
          overflow-y: auto;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .card-content.collapsed {
          max-height: 0;
          padding: 0 16px;
          opacity: 0;
        }

        .card-content.expanded {
          max-height: 300px;
          padding: 16px;
          opacity: 1;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          color: #6b7280;
          text-align: center;
        }

        .empty-state p {
          margin: 8px 0 0 0;
          font-size: 14px;
        }

        .priority-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .priority-item:hover {
          background-color: #f9fafb;
        }

        .priority-item:last-child {
          border-bottom: none;
        }

        .priority-indicator {
          width: 4px;
          height: 40px;
          border-radius: 2px;
        }

        .item-content {
          flex: 1;
        }

        .item-content h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .item-details {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #6b7280;
        }

        .item-details span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 8px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }


        .milestone-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .milestone-item:last-child {
          border-bottom: none;
        }

        .milestone-info h4 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .milestone-info p {
          margin: 0;
          font-size: 12px;
          color: #3b82f6;
          font-weight: 500;
        }

        .project-link {
          cursor: pointer;
          transition: color 0.2s;
        }

        .project-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .milestone-due {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #f59e0b;
          font-weight: 500;
        }

        .task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .task-item:last-child {
          border-bottom: none;
        }

        .task-info h4 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .task-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .task-meta p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .task-meta .project {
          font-weight: 500;
          color: #3b82f6;
        }

        .task-status {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .task-status.overdue {
          background: #fef2f2;
          color: #ef4444;
        }

        .task-status.on-hold {
          background: #fef3c7;
          color: #f59e0b;
        }

        .task-status.in-progress {
          background: #dbeafe;
          color: #3b82f6;
        }

        .task-status.review {
          background: #dbeafe;
          color: #3b82f6;
        }

        @media (max-width: 768px) {
          .highlights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
