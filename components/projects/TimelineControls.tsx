'use client';

interface TimelineControlsProps {
  timeScale: string;
  onTimeScaleChange: (scale: string) => void;
  onScrollToToday?: () => void;
}

export const TimelineControls = ({ timeScale, onTimeScaleChange, onScrollToToday }: TimelineControlsProps) => {
  const timeScales = [
    { id: 'today', label: 'Hôm nay' },
    { id: 'weeks', label: 'Tuần' },
    { id: 'months', label: 'Tháng' }
  ];

  const handleTodayClick = () => {
    if (onScrollToToday) {
      onScrollToToday();
    }
  };

  const handleMonthsClick = () => {
    alert('Chức năng đang được cập nhật');
  };

  return (
    <div className="timeline-controls">
      <div className="controls-content">
        <div className="time-scale-buttons">
          {timeScales.map((scale) => (
            <button
              key={scale.id}
              className={`scale-btn ${timeScale === scale.id ? 'active' : ''}`}
              onClick={
                scale.id === 'today' 
                  ? handleTodayClick 
                  : scale.id === 'months' 
                    ? handleMonthsClick 
                    : () => onTimeScaleChange(scale.id)
              }
            >
              {scale.label}
            </button>
          ))}
        </div>

        <div className="control-actions">
          <button className="action-btn" title="Thông tin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button className="action-btn" title="Tiếp theo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .timeline-controls {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
        }

        .controls-content {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 8px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .time-scale-buttons {
          display: flex;
          background: #f3f4f6;
          border-radius: 4px;
          padding: 2px;
        }

        .scale-btn {
          padding: 6px 12px;
          border: none;
          background: none;
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s ease;
        }

        .scale-btn:hover {
          color: #374151;
        }

        .scale-btn.active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .control-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        @media (max-width: 768px) {
          .timeline-controls {
            bottom: 16px;
            right: 16px;
            left: 16px;
          }

          .controls-content {
            justify-content: space-between;
            padding: 6px;
            gap: 12px;
          }

          .time-scale-buttons {
            flex: 1;
          }

          .scale-btn {
            flex: 1;
            font-size: 11px;
            padding: 6px 8px;
          }
        }
      `}</style>
    </div>
  );
};
