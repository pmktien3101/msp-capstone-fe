'use client';

import { useState, useRef, useEffect } from 'react';
import { mockTasks } from '@/constants/mockData';

interface GanttChartProps {
  timeScale: string;
  selectedItems: string[];
}

export const GanttChart = ({ timeScale, selectedItems }: GanttChartProps) => {
  const [workItems, setWorkItems] = useState(mockTasks.map((task, index) => {
    // Calculate start date based on created date
    const startDate = new Date(task.createdDate);
    // Calculate end date based on estimated hours
    const endDate = new Date(startDate.getTime() + (task.estimatedHours * 24 * 60 * 60 * 1000));
    
    return {
      id: task.id,
      title: task.title,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      color: '#8b5cf6',
      rowIndex: index
    };
  }));

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; startDate: string } | null>(null);
  const [resizeType, setResizeType] = useState<'left' | 'right' | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Generate dates for the timeline based on actual task dates
  const generateDates = () => {
    const dates = [];
    // Find the earliest start date and latest end date from tasks
    const allDates = workItems.flatMap(item => [
      new Date(item.startDate),
      new Date(item.endDate)
    ]);
    const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add some padding before and after
    startDate.setDate(startDate.getDate() - 2);
    endDate.setDate(endDate.getDate() + 2);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const dates = generateDates();
  const currentDate = new Date(); // Use current date

  const getDatePosition = (date: string) => {
    const itemDate = new Date(date);
    const timelineStart = dates[0];
    const diffTime = itemDate.getTime() - timelineStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays * 40) + 20; // 40px per day + 20px offset
  };

  const getItemWidth = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays * 40; // 40px per day
  };

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setDraggedItem(itemId);
    const rect = chartRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        startDate: workItems.find(item => item.id === itemId)?.startDate || ''
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, itemId: string, type: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedItem(itemId);
    setResizeType(type);
    const rect = chartRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        startDate: workItems.find(item => item.id === itemId)?.startDate || ''
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || !dragStart || !chartRef.current) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dayWidth = 40;
    const daysDiff = Math.round((x - dragStart.x) / dayWidth);
    
    const currentItem = workItems.find(item => item.id === draggedItem);
    if (!currentItem) return;

    if (resizeType === 'left') {
      // Resize from left (change start date)
      const newStartDate = new Date(currentItem.startDate);
      newStartDate.setDate(newStartDate.getDate() + daysDiff);
      
      // Don't allow start date to be after end date
      const endDate = new Date(currentItem.endDate);
      if (newStartDate >= endDate) return;

      setWorkItems(prev => prev.map(item => 
        item.id === draggedItem 
          ? { ...item, startDate: newStartDate.toISOString().split('T')[0] }
          : item
      ));
    } else if (resizeType === 'right') {
      // Resize from right (change end date)
      const newEndDate = new Date(currentItem.endDate);
      newEndDate.setDate(newEndDate.getDate() + daysDiff);
      
      // Don't allow end date to be before start date
      const startDate = new Date(currentItem.startDate);
      if (newEndDate <= startDate) return;

      setWorkItems(prev => prev.map(item => 
        item.id === draggedItem 
          ? { ...item, endDate: newEndDate.toISOString().split('T')[0] }
          : item
      ));
    } else {
      // Move entire task
      const newStartDate = new Date(dragStart.startDate);
      newStartDate.setDate(newStartDate.getDate() + daysDiff);
      
      const newEndDate = new Date(newStartDate);
      const originalDuration = new Date(currentItem.endDate).getTime() - 
                             new Date(currentItem.startDate).getTime();
      newEndDate.setTime(newEndDate.getTime() + originalDuration);

      setWorkItems(prev => prev.map(item => 
        item.id === draggedItem 
          ? { 
              ...item, 
              startDate: newStartDate.toISOString().split('T')[0],
              endDate: newEndDate.toISOString().split('T')[0]
            }
          : item
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
    setDragStart(null);
    setResizeType(null);
  };

  useEffect(() => {
    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, dragStart]);

  return (
    <div className="gantt-chart" ref={chartRef}>
      <div className="chart-container">
        <div className="chart-header">
          <div className="header-spacer"></div>
          <div className="timeline-header">
            <div className="month-label">
              {dates.length > 0 ? `Tháng ${dates[0].getMonth() + 1}` : 'Timeline'}
            </div>
            <div className="dates-row">
              {dates.map((date, index) => (
                <div key={index} className="date-cell">
                  {date.getDate()}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-body">
          <div className="current-date-line" style={{ left: getDatePosition(currentDate.toISOString().split('T')[0]) }}>
            <div className="date-indicator">{currentDate.getDate()}</div>
          </div>

          <div className="timeline-grid">
            {dates.map((_, index) => (
              <div 
                key={index} 
                className="grid-line"
                style={{ left: (index * 40) + 20 }}
              ></div>
            ))}
          </div>

          <div className="work-items">
            {workItems.map((item) => (
              <div 
                key={item.id}
                className={`work-item-row`}
                style={{ top: item.rowIndex * 60 + 20 }}
              >
                <div 
                  className={`work-item-bar ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                  style={{
                    left: getDatePosition(item.startDate),
                    width: getItemWidth(item.startDate, item.endDate),
                    backgroundColor: item.color
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                >
                  <div className="bar-content">
                    <div className="bar-title">{item.title}</div>
                    <div className="bar-dates">
                      {new Date(item.startDate).toLocaleDateString('vi-VN')} - {new Date(item.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  
                  {/* Resize handles */}
                  <div 
                    className="resize-handle left" 
                    onMouseDown={(e) => handleResizeMouseDown(e, item.id, 'left')}
                  ></div>
                  <div 
                    className="resize-handle right" 
                    onMouseDown={(e) => handleResizeMouseDown(e, item.id, 'right')}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .gantt-chart {
          position: relative;
          height: 100%;
          overflow: hidden;
        }

        .chart-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .chart-header {
          display: flex;
          height: 60px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
          z-index: 10;
          flex-shrink: 0;
        }

        .header-spacer {
          width: 200px;
          background: #f9fafb;
          border-right: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          padding: 0 16px;
          font-weight: 600;
          color: #374151;
          flex-shrink: 0;
        }

        .timeline-header {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .month-label {
          height: 30px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          font-weight: 600;
          color: #374151;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .dates-row {
          height: 30px;
          display: flex;
          position: relative;
          width: ${dates.length * 40}px;
        }

        .date-cell {
          width: 40px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #6b7280;
          border-right: 1px solid #f3f4f6;
          flex-shrink: 0;
        }

        .chart-body {
          position: relative;
          flex: 1;
          overflow: auto;
        }

        .current-date-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #3b82f6;
          z-index: 5;
        }

        .date-indicator {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 18px;
          height: 18px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .timeline-grid {
          position: absolute;
          top: 0;
          left: 200px;
          right: 0;
          height: 100%;
        }

        .grid-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #f3f4f6;
        }

        .work-items {
          position: relative;
          padding: 20px 0;
          margin-left: 200px;
          height: 200px;
        }

        .work-item-row {
          position: absolute;
          height: 40px;
          width: 100%;
        }

        .work-item-bar {
          position: absolute;
          height: 40px;
          border-radius: 6px;
          cursor: move;
          user-select: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .work-item-bar:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .work-item-bar.selected {
          box-shadow: 0 0 0 2px #3b82f6;
        }

        .bar-content {
          padding: 8px 12px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: white;
        }

        .bar-title {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bar-dates {
          font-size: 10px;
          opacity: 0.9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .resize-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 8px;
          cursor: ew-resize;
          opacity: 0;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 4px;
        }

        .resize-handle.left {
          left: 0;
          border-radius: 6px 0 0 6px;
        }

        .resize-handle.right {
          right: 0;
          border-radius: 0 6px 6px 0;
        }

        .work-item-bar:hover .resize-handle {
          opacity: 1;
          background: rgba(255, 255, 255, 0.8);
        }

        .resize-handle:hover {
          background: rgba(255, 255, 255, 1) !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
