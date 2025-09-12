'use client';

import { Project } from '@/types/project';

interface ProjectTimelineProps {
  project: Project;
}

export const ProjectTimeline = ({ project }: ProjectTimelineProps) => {
  // Mock timeline data
  const timelineEvents = [
    {
      id: '1',
      date: '2025-09-01',
      title: 'Dự án bắt đầu',
      description: 'Khởi tạo dự án và thiết lập team',
      type: 'milestone',
      status: 'completed'
    },
    {
      id: '2',
      date: '2025-09-15',
      title: 'Hoàn thành thiết kế UI/UX',
      description: 'Thiết kế giao diện người dùng và trải nghiệm',
      type: 'task',
      status: 'completed'
    },
    {
      id: '3',
      date: '2025-10-01',
      title: 'Bắt đầu phát triển backend',
      description: 'Xây dựng API và cơ sở dữ liệu',
      type: 'task',
      status: 'in-progress'
    },
    {
      id: '4',
      date: '2025-11-15',
      title: 'Hoàn thành phát triển frontend',
      description: 'Phát triển giao diện người dùng',
      type: 'task',
      status: 'pending'
    },
    {
      id: '5',
      date: '2025-12-01',
      title: 'Testing và QA',
      description: 'Kiểm thử và đảm bảo chất lượng',
      type: 'task',
      status: 'pending'
    },
    {
      id: '6',
      date: '2025-12-31',
      title: 'Dự án hoàn thành',
      description: 'Phát hành sản phẩm cuối cùng',
      type: 'milestone',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'milestone') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  return (
    <div className="project-timeline">
      <div className="timeline-header">
        <h3>Timeline Dự Án</h3>
        <p>Lịch trình và tiến độ thực hiện dự án {project.name}</p>
      </div>

      <div className="timeline-container">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <div 
                className="marker-icon"
                style={{ color: getStatusColor(event.status) }}
              >
                {getTypeIcon(event.type)}
              </div>
              {index < timelineEvents.length - 1 && (
                <div className="timeline-line"></div>
              )}
            </div>
            
            <div className="timeline-content">
              <div className="event-header">
                <h4 className="event-title">{event.title}</h4>
                <span 
                  className="event-status"
                  style={{ color: getStatusColor(event.status) }}
                >
                  {event.status === 'completed' && 'Hoàn thành'}
                  {event.status === 'in-progress' && 'Đang thực hiện'}
                  {event.status === 'pending' && 'Chờ thực hiện'}
                </span>
              </div>
              
              <p className="event-description">{event.description}</p>
              
              <div className="event-meta">
                <span className="event-date">
                  {new Date(event.date).toLocaleDateString('vi-VN')}
                </span>
                <span className="event-type">
                  {event.type === 'milestone' ? 'Cột mốc' : 'Công việc'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .project-timeline {
          width: 100%;
        }

        .timeline-header {
          margin-bottom: 32px;
        }

        .timeline-header h3 {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .timeline-header p {
          color: #6b7280;
          margin: 0;
        }

        .timeline-container {
          position: relative;
        }

        .timeline-item {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
        }

        .timeline-marker {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .marker-icon {
          width: 40px;
          height: 40px;
          background: white;
          border: 2px solid currentColor;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .timeline-line {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 32px;
          background: #e5e7eb;
        }

        .timeline-content {
          flex: 1;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .event-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .event-status {
          font-size: 14px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.1);
        }

        .event-description {
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .event-meta {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #9ca3af;
        }

        .event-date {
          font-weight: 500;
        }

        .event-type {
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
};
