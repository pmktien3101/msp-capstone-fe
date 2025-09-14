'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { mockTasks } from '@/constants/mockData';

interface GanttChartProps {
  timeScale: string;
  selectedItems: string[];
}

interface WorkItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  rowIndex: number;
  progress?: number;
  assignee?: string;
  status?: string;
}

export const GanttChart = forwardRef<any, GanttChartProps>(({ timeScale, selectedItems }, ref) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(mockTasks.map((task, index) => {
    // Use actual due date as end date, or calculate from created date + estimated hours
    const startDate = new Date(task.createdDate);
    const dueDate = new Date(task.dueDate);
    const endDate = dueDate > startDate ? dueDate : new Date(startDate.getTime() + (task.estimatedHours * 24 * 60 * 60 * 1000));
    
    return {
      id: task.id,
      title: task.title,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      color: getStatusColor(task.status),
      rowIndex: index,
      progress: task.actualHours > 0 ? Math.round((task.actualHours / task.estimatedHours) * 100) : 0,
      assignee: task.assignee || 'Unassigned',
      status: task.status
    };
  }));

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; startDate: string } | null>(null);
  const [resizeType, setResizeType] = useState<'left' | 'right' | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Expose scrollToToday function to parent component
  useImperativeHandle(ref, () => ({
    scrollToToday: () => {
      if (bodyRef.current) {
        const currentDate = new Date();
        const currentDatePosition = getDatePosition(currentDate.toISOString().split('T')[0]);
        
        // Calculate scroll position to center the current date
        const containerWidth = bodyRef.current.clientWidth;
        const scrollLeft = currentDatePosition - (containerWidth / 2);
        
        // Smooth scroll to current date
        bodyRef.current.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        });
      }
    }
  }));

  // Get color based on status
  function getStatusColor(status: string): string {
    switch (status) {
      case 'done': return '#10b981'; // Completed
      case 'in-progress': return '#3b82f6'; // In Progress
      case 'todo': return '#f59e0b'; // To Do
      case 'review': return '#8b5cf6'; // Review
      case 'blocked': return '#ef4444'; // Blocked
      default: return '#6b7280'; // Unknown
    }
  }

  // Generate timeline based on timeScale
  const generateTimeline = () => {
    const dates = [];
    const today = new Date();
    let startDate, endDate, step;
    
    switch (timeScale) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        step = 1; // hours
        break;
      case 'weeks':
        // Start from 2 months before current month
        startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        // Go to beginning of first week (Monday)
        const firstDayOfMonth = new Date(startDate);
        const dayOfWeek = firstDayOfMonth.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + daysToMonday);
        
        // Show 6 months total (about 26 weeks = 182 days) for much better horizontal scrolling
        endDate = new Date(today.getFullYear(), today.getMonth() + 4, 1);
        // Go to end of last week (Sunday)
        const lastDayOfMonth = new Date(endDate);
        const lastDayOfWeek = lastDayOfMonth.getDay();
        const daysToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
        endDate.setDate(endDate.getDate() + daysToSunday);
        step = 1; // days
        break;
      case 'months':
        // Show 8 months for much better horizontal scrolling
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1); // 3 months before current
        endDate = new Date(today.getFullYear(), today.getMonth() + 5, 1); // 5 months after current
        step = 1; // days
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 14);
        step = 1;
    }
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + step)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const timelineDates = generateTimeline();
  const currentDate = new Date();
  
  // Debug: Log current date info
  console.log('Current date:', currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear());
  console.log('Timeline dates range:', timelineDates[0]?.getDate(), 'to', timelineDates[timelineDates.length - 1]?.getDate());

  const getDatePosition = (date: string) => {
    const itemDate = new Date(date);
    
    if (timeScale === 'months') {
      // For months view, calculate position based on month
      const itemMonth = itemDate.getMonth();
      const timelineStartMonth = timelineDates[0].getMonth();
      const monthDiff = itemMonth - timelineStartMonth;
      const monthWidth = 100 / 4; // 4 months: August, September, October, November
      return (monthDiff * monthWidth) + (monthWidth / 2); // Center in month
    } else {
      // For other views, find the exact date in timelineDates using local date comparison
      const dateIndex = timelineDates.findIndex(d => 
        d.getDate() === itemDate.getDate() && 
        d.getMonth() === itemDate.getMonth() && 
        d.getFullYear() === itemDate.getFullYear()
      );
      
      if (dateIndex !== -1) {
        return (dateIndex * 40) + 20; // 40px per day + 20px offset to match grid
      } else {
        // Fallback to calculation if date not found
        const timelineStart = timelineDates[0];
        const diffTime = itemDate.getTime() - timelineStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return (diffDays * 40) + 20;
      }
    }
  };

  const getItemWidth = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (timeScale === 'months') {
      // For months view, calculate width based on months
      const startMonth = start.getMonth();
      const endMonth = end.getMonth();
      const monthDiff = endMonth - startMonth + 1;
      const monthWidth = 100 / 4; // 4 months total
      return monthDiff * monthWidth;
    } else {
      // For other views, calculate width based on days
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays * 40; // 40px per day
    }
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

  // No longer needed - single scroll container

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

  // No longer needed - single scroll container

  // Group dates by month or week for better display
  const groupDatesByPeriod = () => {
    const groups: { [key: string]: Date[] } = {};
    
    if (timeScale === 'weeks') {
      // Group by weeks (7 days each)
      for (let i = 0; i < timelineDates.length; i += 7) {
        const weekDates = timelineDates.slice(i, i + 7);
        if (weekDates.length > 0) {
          const weekKey = `week-${Math.floor(i / 7)}`;
          groups[weekKey] = weekDates;
        }
      }
    } else if (timeScale === 'months') {
      // Group by month for month view
      timelineDates.forEach(date => {
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(date);
      });
    } else {
      // Group by month for other views
      timelineDates.forEach(date => {
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(date);
      });
    }
    return groups;
  };

  const periodGroups = groupDatesByPeriod();

  return (
    <div className="gantt-chart" ref={chartRef}>
      <div className="chart-container">
        {/* Single Scrollable Container */}
        <div className="chart-scrollable" ref={bodyRef}>
          {/* Fixed Header */}
          <div className="chart-header">
            <div className="timeline-header">
              <div className="timeline-periods">
                {Object.entries(periodGroups).map(([periodKey, dates]) => (
                  <div key={periodKey} className="period-group">
                    <div className="period-label">
                      {timeScale === 'weeks' 
                        ? (() => {
                            const firstDate = dates[0];
                            const lastDate = dates[dates.length - 1];
                            const firstMonth = firstDate.getMonth();
                            const lastMonth = lastDate.getMonth();
                            
                            if (firstMonth === lastMonth) {
                              // Same month
                              const monthName = firstDate.toLocaleDateString('vi-VN', { month: 'long' });
                              return `${monthName} (${firstDate.getDate()} - ${lastDate.getDate()})`;
                            } else {
                              // Different months
                              const firstMonthName = firstDate.toLocaleDateString('vi-VN', { month: 'short' });
                              const lastMonthName = lastDate.toLocaleDateString('vi-VN', { month: 'short' });
                              return `${firstMonthName} ${firstDate.getDate()} - ${lastMonthName} ${lastDate.getDate()}`;
                            }
                          })()
                        : timeScale === 'months'
                        ? new Date(dates[0]).toLocaleDateString('vi-VN', { month: 'long' })
                        : new Date(dates[0]).toLocaleDateString('vi-VN', { month: 'long' })
                      }
                    </div>
                  {timeScale === 'months' ? (
                    <div className="month-indicator">
                      <div className="current-date-triangle"></div>
                    </div>
                  ) : (
                    <div className="period-dates">
                      {dates.map((date, index) => {
                        const today = new Date();
                        // Use local date comparison to avoid timezone issues
                        const isToday = date.getDate() === today.getDate() && 
                                       date.getMonth() === today.getMonth() && 
                                       date.getFullYear() === today.getFullYear();
                        return (
                          <div key={index} className={`date-cell ${isToday ? 'current-date' : ''}`}>
                            {date.getDate()}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="chart-body">
          {/* Current Date Line */}
          <div className="current-date-line" style={{ left: getDatePosition(currentDate.toISOString().split('T')[0]) }}>
          </div>

          {/* Timeline Grid */}
          <div className="timeline-grid">
            {timeScale === 'months' ? (
              // For months view, show vertical lines between months
              Object.entries(periodGroups).map(([periodKey, dates], index) => (
                <div 
                  key={periodKey} 
                  className="grid-line month-separator"
                  style={{ left: `${(index + 1) * (100 / Object.keys(periodGroups).length)}%` }}
                ></div>
              ))
            ) : (
              // For other views, show day-based grid
              timelineDates.map((_, index) => (
                <div 
                  key={index} 
                  className={`grid-line ${
                    timeScale === 'weeks' 
                      ? (index % 7 === 6 ? 'week-separator' : '') // Last day of week (index 6)
                      : (index % 7 === 0 ? 'week-line' : '')
                  }`}
                  style={{ left: (index * 40) + 20 }}
                ></div>
              ))
            )}
          </div>

          {/* Work Items */}
          <div className="work-items">
            {workItems.map((item) => (
              <div 
                key={item.id}
                className={`work-item-row ${selectedItems.includes(item.id) ? 'selected-row' : ''}`}
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
                  {/* Resize Handles */}
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
    </div>

      <style jsx>{`
        .gantt-chart {
          position: relative;
          height: 100%;
          overflow: hidden;
          background: white;
          display: flex;
          flex-direction: column;
        }

        .chart-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .chart-scrollable {
          flex: 1;
          overflow: auto;
          position: relative;
          height: 100%;
        }

        .chart-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .timeline-header {
          position: relative;
          height: 60px;
        }

        .timeline-periods {
          display: flex;
          height: 100%;
          width: ${timeScale === 'months' ? '100%' : `${timelineDates.length * 40}px`};
          min-width: 100%;
        }

        .period-group {
          display: flex;
          flex-direction: column;
          ${timeScale === 'months' ? 'flex: 1;' : ''}
          ${timeScale === 'weeks' ? 'width: 280px; flex-shrink: 0;' : ''} /* 7 days * 40px */
          position: relative;
        }

        .period-label {
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          font-weight: 600;
          color: #1f2937;
          background: #f8f9fa;
          border-right: 1px solid #e5e7eb;
          font-size: ${timeScale === 'weeks' ? '11px' : '12px'};
          text-transform: capitalize;
          ${timeScale === 'months' ? 'position: relative;' : ''}
          ${timeScale === 'weeks' ? 'text-align: center; line-height: 1.2;' : ''}
        }

        .month-indicator {
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-right: 1px solid #e5e7eb;
          position: relative;
        }

        .current-date-triangle {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #3b82f6;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }


        .period-dates {
          height: 30px;
          display: flex;
          background: white;
          width: ${timeScale === 'weeks' ? '280px' : 'auto'}; /* 7 days * 40px for weeks, auto for months */
          flex-shrink: 0;
          position: relative;
          box-sizing: border-box;
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
          position: relative;
          box-sizing: border-box;
          min-width: 40px;
          max-width: 40px;
        }

        .date-cell:last-child {
          border-right: none;
        }


        /* Week separator line in header - position exactly at grid lines */
        .period-dates:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e5e7eb;
        }

        .date-cell.current-date {
          background: #3b82f6;
          color: white;
          font-weight: 600;
          box-shadow: 0 0 4px rgba(59, 130, 246, 0.3);
        }

        .chart-body {
          position: relative;
          background: white;
          flex: 1;
          min-height: 400px;
          height: 100%;
        }

        .current-date-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #3b82f6;
          z-index: 10;
          box-shadow: 0 0 4px rgba(59, 130, 246, 0.3);
          transform: translateX(-1px); /* Center the 2px line */
        }

        .timeline-grid {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: ${timeScale === 'months' ? '100%' : `${timelineDates.length * 40}px`};
          min-width: 100%;
          box-sizing: border-box;
        }

        .grid-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #f3f4f6;
        }

        .grid-line.week-line {
          background: #e5e7eb;
          width: 2px;
        }

        .grid-line.week-separator {
          background: #e5e7eb;
          width: 2px;
        }

        .grid-line.month-separator {
          background: #e5e7eb;
          width: 2px;
        }

        .work-items {
          position: relative;
          padding: 20px 0;
          min-height: ${workItems.length * 60 + 40}px;
          height: 100%;
          width: ${timeScale === 'months' ? '100%' : `${timelineDates.length * 40}px`};
          min-width: 100%;
          box-sizing: border-box;
        }

        .work-item-row {
          position: absolute;
          height: 40px;
          width: 100%;
          margin-bottom: 10px;
        }

        .work-item-row.selected-row {
          background: rgba(59, 130, 246, 0.05);
          border-radius: 4px;
        }

        .work-item-bar {
          position: absolute;
          height: 40px;
          border-radius: 4px;
          cursor: move;
          user-select: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .work-item-bar:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .work-item-bar.selected {
          box-shadow: 0 0 0 2px #3b82f6;
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
          border-radius: 4px 0 0 4px;
        }

        .resize-handle.right {
          right: 0;
          border-radius: 0 4px 4px 0;
        }

        .work-item-bar:hover .resize-handle {
          opacity: 1;
          background: rgba(255, 255, 255, 0.8);
        }

        .resize-handle:hover {
          background: rgba(255, 255, 255, 1) !important;
          opacity: 1 !important;
        }

        /* Scrollbar styling */
        .chart-scrollable::-webkit-scrollbar {
          height: 12px;
          width: 12px;
        }

        .chart-scrollable::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }

        .chart-scrollable::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }

        .chart-scrollable::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Smooth scrolling */
        .chart-scrollable {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
});
