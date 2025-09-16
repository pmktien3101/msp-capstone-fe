'use client';

import { useState, useRef, useEffect } from 'react';
import { mockEpics, mockTasks, mockProject } from '@/constants/mockData';

interface Task {
  id: string;
  title: string;
  description: string;
  epic: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string | null;
  dueDate: string;
  createdDate: string;
  updatedDate: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  milestoneId: string;
}

interface Epic {
  id: string;
  name: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  progress: number;
  startDate: string;
  endDate: string;
  tasks: Task[];
}

interface TimelineItem {
  id: string;
  title: string;
  type: 'epic' | 'task';
  status: string;
  priority: string;
  assignee: string | null;
  startDate: string;
  endDate: string;
  progress: number;
  epicId?: string;
  rowIndex: number;
}

interface ProjectTimelineProps {
  project: any;
}

export const ProjectTimeline = ({ project }: ProjectTimelineProps) => {
  const [timeScale, setTimeScale] = useState<'day'>('day');
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set(['epic-1']));
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; startDate: string; endDate: string; dragType: 'move' | 'resize-start' | 'resize-end' } | null>(null);
  const [timelineScroll, setTimelineScroll] = useState(0);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [timelineDragStart, setTimelineDragStart] = useState<{ x: number; scroll: number } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Reset timeline scroll when timeScale changes
  useEffect(() => {
    setTimelineScroll(0);
  }, [timeScale]);

  // Generate timeline items from epics and tasks
  useEffect(() => {
    const items: TimelineItem[] = [];
    let rowIndex = 0;

    mockEpics.forEach(epic => {
      // Add epic
      items.push({
        id: epic.id,
        title: epic.name,
        type: 'epic',
        status: epic.status,
        priority: 'high',
        assignee: null,
        startDate: epic.startDate,
        endDate: epic.endDate,
        progress: epic.progress,
        rowIndex: rowIndex++
      });

      // Add tasks if epic is expanded
      if (expandedEpics.has(epic.id)) {
        epic.tasks.forEach(task => {
          items.push({
            id: task.id,
            title: task.title,
            type: 'task',
            status: task.status,
            priority: task.priority,
            assignee: task.assignee,
            startDate: task.startDate || task.createdDate,
            endDate: task.endDate || task.dueDate,
            progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0,
            epicId: epic.id,
            rowIndex: rowIndex++
          });
        });
      }
    });

    setTimelineItems(items);
  }, [expandedEpics]);

  // Toggle epic expansion
  const toggleEpic = (epicId: string) => {
    setExpandedEpics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(epicId)) {
        newSet.delete(epicId);
      } else {
        newSet.add(epicId);
      }
      return newSet;
    });
  };

  // Generate timeline dates based on time scale using real calendar
  const generateTimelineDates = () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    
    // Set date range for week view (12 weeks from today, starting from Monday)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1, Sunday = 0
    startDate.setDate(today.getDate() + mondayOffset - 7); // Start from Monday of previous week
    endDate.setDate(today.getDate() + mondayOffset + 77); // End 11 weeks from Monday
    console.log(`📅 Timeline range: ${startDate.toDateString()} to ${endDate.toDateString()}, mondayOffset=${mondayOffset}`);

    const dates: Date[] = [];

    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    console.log(`📅 Week view: Generated ${dates.length} days from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    return dates;
  };

  const timelineDates = generateTimelineDates();

  // Calculate position and width for timeline bars using real calendar
  const calculateBarPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get timeline range from generated dates
    const timelineStart = timelineDates[0];
    const timelineEnd = timelineDates[timelineDates.length - 1];
    
    if (!timelineStart || !timelineEnd) {
      return { left: 0, width: 0 };
    }
    
    // Calculate based on time scale
    let totalUnits: number;
    let startOffset: number;
    let duration: number;
    
    totalUnits = timelineDates.length; // Number of days
    
    // Use UTC dates to avoid timezone issues
    const startUTC = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const timelineStartUTC = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), timelineStart.getDate());
    const endUTC = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    startOffset = Math.floor((startUTC.getTime() - timelineStartUTC.getTime()) / (1000 * 60 * 60 * 24));
    duration = Math.max(1, Math.floor((endUTC.getTime() - startUTC.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    console.log(`📊 Date Calculation: start=${start.toISOString().split('T')[0]}, end=${end.toISOString().split('T')[0]}, startOffset=${startOffset}, duration=${duration}`);
    
    const leftPercent = Math.max(0, (startOffset / totalUnits) * 100);
    const widthPercent = Math.max(1, (duration / totalUnits) * 100);
    
    return { left: leftPercent, width: widthPercent };
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, itemId: string, startDate: string, endDate: string, dragType: 'move' | 'resize-start' | 'resize-end' = 'move') => {
    e.preventDefault();
    console.log(`🎯 Drag Start: ${itemId}, Type: ${dragType}`);
    setDraggedItem(itemId);
    setDragStart({ x: e.clientX, startDate, endDate, dragType });
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggedItem || !dragStart) return;

    const deltaX = e.clientX - dragStart.x;
    
    // Calculate pixel width per day (64px for week view)
    const pixelWidthPerDay = 64;
    const daysToMove = Math.round(deltaX / pixelWidthPerDay);
    
    console.log(`🔄 Drag Move: deltaX=${deltaX}, daysToMove=${daysToMove}, type=${dragStart.dragType}`);
    
    if (daysToMove !== 0) {
      setTimelineItems(prev => prev.map(item => {
        if (item.id !== draggedItem) return item;
        
        const newStartDate = new Date(dragStart.startDate);
        const newEndDate = new Date(dragStart.endDate);
        
        if (dragStart.dragType === 'move') {
          newStartDate.setDate(newStartDate.getDate() + daysToMove);
          newEndDate.setDate(newEndDate.getDate() + daysToMove);
        } else if (dragStart.dragType === 'resize-start') {
          newStartDate.setDate(newStartDate.getDate() + daysToMove);
          // Ensure start date doesn't go after end date
          if (newStartDate >= newEndDate) {
            newStartDate.setDate(newEndDate.getDate() - 1);
          }
        } else if (dragStart.dragType === 'resize-end') {
          newEndDate.setDate(newEndDate.getDate() + daysToMove);
          // Ensure end date doesn't go before start date
          if (newEndDate <= newStartDate) {
            newEndDate.setDate(newStartDate.getDate() + 1);
          }
        }
        
        console.log(`📅 Updated: ${item.title} - ${newStartDate.toISOString().split('T')[0]} to ${newEndDate.toISOString().split('T')[0]}`);
        
        return {
          ...item,
          startDate: newStartDate.toISOString().split('T')[0],
          endDate: newEndDate.toISOString().split('T')[0]
        };
      }));
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragStart(null);
  };

  // Add global event listeners for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedItem && dragStart) {
        handleDragMove(e as any);
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggedItem) {
        handleDragEnd();
      }
    };

    if (draggedItem) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedItem, dragStart]);

  // Handle timeline drag start
  const handleTimelineDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingTimeline(true);
    setTimelineDragStart({ x: e.clientX, scroll: timelineScroll });
  };

  // Handle timeline drag move
  const handleTimelineDragMove = (e: React.MouseEvent) => {
    if (!isDraggingTimeline || !timelineDragStart) return;
    
    const deltaX = e.clientX - timelineDragStart.x;
    const sensitivity = 3.0; // Increase sensitivity for easier dragging
    const newScroll = Math.max(0, timelineDragStart.scroll - (deltaX * sensitivity));
    const maxScroll = Math.max(0, (timelineDates.length * 64) - (timelineRef.current?.parentElement?.clientWidth || 0));
    setTimelineScroll(Math.min(newScroll, maxScroll));
  };

  // Handle timeline drag end
  const handleTimelineDragEnd = () => {
    setIsDraggingTimeline(false);
    setTimelineDragStart(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'todo': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Get timeline bar color based on type
  const getTimelineBarColor = (item: TimelineItem) => {
    console.log(`🔍 DEBUG: ${item.title} - Type: "${item.type}", Status: "${item.status}"`);
    
    // Test với màu sắc cố định để debug
    if (item.type === 'epic') {
      console.log(`🟠 EPIC: ${item.title} - Using ORANGE`);
      return '#ff6b35'; // Bright orange để test
    } else {
      console.log(`🟣 TASK: ${item.title} - Using PURPLE`);
      return '#8b5cf6'; // Bright purple để test
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  // Get assignee initials
  const getAssigneeInitials = (assignee: string | null) => {
    if (!assignee) return '?';
    return assignee.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Timeline</h2>
              <p className="text-sm text-gray-600">Track and manage project progress</p>
          </div>
        </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">Time Scale:</span>
               <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-600">
                 Week View
          </div>
        </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Drag timeline to navigate</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
        </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
              Add Task
          </button>
        </div>
      </div>
        </div>
        
      {/* Main Content - Table Layout */}
      <div className="h-[calc(100%-80px)] overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex">
          {/* Work Items Column Header - Fixed */}
          <div className="w-[40%] border-r border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Công việc</h3>
        </div>
      </div>

          {/* Timeline Column Header - Scrollable */}
          <div className="w-[60%] overflow-hidden">
            <div 
              className={`overflow-hidden transition-all duration-200 ${isDraggingTimeline ? 'cursor-grabbing bg-blue-100' : 'cursor-grab hover:bg-blue-50 hover:shadow-md'} h-16 relative`}
              onMouseDown={handleTimelineDragStart}
              onMouseMove={handleTimelineDragMove}
              onMouseUp={handleTimelineDragEnd}
              onMouseLeave={handleTimelineDragEnd}
            >
              {/* Drag Handle Indicator */}
              <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-blue-200 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        </div>

              {/* Drag Instruction Text */}
              <div className="absolute top-1 left-2 text-xs text-blue-600 font-medium opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
                Drag to navigate
      </div>

              {/* Drag Indicator Dots */}
              <div className="absolute top-1 right-12 flex space-x-1 opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
              
              {/* Month Headers Row */}
              {timeScale === 'day' && (
                <div className="flex h-8 min-w-max transition-transform duration-100" style={{ transform: `translateX(-${timelineScroll}px)` }}>
                  {(() => {
                    const monthGroups: { [key: string]: { start: number; end: number; month: string } } = {};
                    
                    timelineDates.forEach((date, index) => {
                      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
                      
                      if (!monthGroups[monthKey]) {
                        monthGroups[monthKey] = { start: index, end: index, month: monthKey };
                      } else {
                        monthGroups[monthKey].end = index;
                      }
                    });
                    
                    console.log('📅 Month Groups:', monthGroups);
                    console.log('📅 Timeline Dates:', timelineDates.length);
                    
                    return Object.values(monthGroups).map((group, groupIndex) => {
                      const width = (group.end - group.start + 1) * 64; // 64px per day
                      return (
                        <div 
                          key={groupIndex}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-r border-blue-200 flex items-center justify-center"
                          style={{ width: `${width}px` }}
                        >
                          <span className="text-xs font-semibold text-blue-800">{group.month}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
              
              {/* Days Row */}
              <div 
                className="flex h-8 min-w-max transition-transform duration-100" 
                ref={null}
                style={{ transform: `translateX(-${timelineScroll}px)` }}
              >
                {timelineDates.map((date, index) => {
                  const today = new Date();
                  
                  // Use UTC comparison to avoid timezone issues
                  const isToday = date.getFullYear() === today.getFullYear() && 
                    date.getMonth() === today.getMonth() && 
                    date.getDate() === today.getDate();
                  
                  // Debug log for today detection
                  if (isToday && timeScale === 'day') {
                    console.log(`📅 Today detected: ${date.toDateString()} vs ${today.toDateString()}`);
                  }
                  
                  // Show detailed day info for week view
                  const showDayDetails = true;
                  
                  // Debug week boundary
                  const isWeekStart = date.getDay() === 1;
                  if (isWeekStart) {
                    console.log(`📅 haha Week boundary: ${date.toDateString()}, getDay()=${date.getDay()}`);
                  }
                  
                  return (
                    <div key={index} className={`${showDayDetails ? 'w-16' : 'w-24'} ${isWeekStart ? 'border-l-2 border-blue-400' : 'border-r border-gray-200'} p-1 text-center transition-colors flex-shrink-0 ${isToday ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50'}`}>
                      <>
                        {/* Day Info */}
                        <div className={`text-xs font-bold ${isToday ? 'text-blue-800' : 'text-gray-800'}`}>
                          {date.getDate()}
                        </div>
                        <div className={`text-xs ${isToday ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]}
                        </div>
                      </>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex">
          {/* Work Items Column - Fixed */}
          <div className="w-[40%] border-r border-gray-200 overflow-y-auto">
            {/* Task Rows */}
            {timelineItems.map((item, index) => (
              <div key={item.id} className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="h-full flex items-center px-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {item.type === 'epic' ? (
                      <>
                        <button 
                          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                          onClick={() => toggleEpic(item.id)}
                        >
                          {expandedEpics.has(item.id) ? '▼' : '▶'}
                        </button>
                            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate">{item.title}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-sm font-medium text-gray-700 truncate">{item.title}</span>
                        <span className="text-xs text-gray-500">({item.id})</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.type === 'epic' && (
                      <div className="flex items-center space-x-2">
                            <div className="w-12 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${item.progress}%`,
                                  background: 'linear-gradient(to right, #f97316, #ea580c)'
                                }}
                              />
                            </div>
                        <span className="text-xs text-gray-600 font-medium">{item.progress}%</span>
                      </div>
                    )}
                    {item.assignee && (
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                        {getAssigneeInitials(item.assignee)}
                      </div>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(item.status)} text-white`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Task Row - At the end */}
            <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors">
              <div className="h-full flex items-center px-3">
                <button 
                  className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  onClick={() => {
                    // TODO: Implement add task functionality
                    console.log('Add new task');
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Tạo Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Column - Scrollable */}
          <div className="w-[60%] overflow-hidden">
            <div 
              className={`overflow-hidden transition-all duration-200 ${isDraggingTimeline ? 'cursor-grabbing bg-blue-100' : 'cursor-grab hover:bg-blue-50 hover:shadow-md'} relative`}
              onMouseDown={handleTimelineDragStart}
              onMouseMove={handleTimelineDragMove}
              onMouseUp={handleTimelineDragEnd}
              onMouseLeave={handleTimelineDragEnd}
            >
              {/* Drag Handle Indicator */}
              <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-blue-200 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              </div>
              
              {/* Drag Instruction Text */}
              <div className="absolute top-1 left-2 text-xs text-blue-600 font-medium opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
                Drag to navigate
              </div>
              
              {/* Drag Indicator Dots */}
              <div className="absolute top-1 right-12 flex space-x-1 opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              
              
              <div 
                className="relative bg-white min-w-max transition-transform duration-100"
                style={{ transform: `translateX(-${timelineScroll}px)` }}
              >
                {/* Today Line */}
                {(() => {
                  const today = new Date();
                  let todayIndex = -1;
                  
                  // For week view, find exact day match using UTC comparison
                  todayIndex = timelineDates.findIndex(date => 
                    date.getFullYear() === today.getFullYear() && 
                    date.getMonth() === today.getMonth() && 
                    date.getDate() === today.getDate()
                  );
                  console.log(`📅 Today: ${today.toDateString()}, Found at index: ${todayIndex}`);
                  console.log(`📅 Timeline dates: ${timelineDates.slice(0, 10).map(d => d.toDateString()).join(', ')}...`);
                  
                  if (todayIndex !== -1) {
                    const columnWidth = 64;
                    const todayPosition = todayIndex * columnWidth;
                    console.log(`📅 Today Line: todayIndex=${todayIndex}, columnWidth=${columnWidth}, todayPosition=${todayPosition}px`);
                    return (
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
                        style={{ left: `${todayPosition}px` }}
                      />
                    );
                  }
                  return null;
                })()}

                {/* Task Rows */}
                {timelineItems.map((item, index) => {
                  const position = calculateBarPosition(item.startDate, item.endDate);
                  return (
                    <div key={item.id} className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {/* Timeline Bar */}
                      <div className="absolute top-2 left-0 h-8" style={{ width: `${timelineDates.length * 64}px` }}>
                        {/* Debug color test */}
                        <div 
                          className={`absolute h-8 rounded-md cursor-move group transition-all duration-200 ${draggedItem === item.id ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'}`}
                          style={{
                            left: `${position.left}%`,
                            width: `${position.width}%`,
                            minWidth: '80px', // Increased minimum width for resize handles
                            backgroundColor: item.type === 'epic' ? '#ff6b35' : '#8b5cf6',
                            border: '1px solid rgba(255,255,255,0.3)',
                            zIndex: draggedItem === item.id ? 20 : 10
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleDragStart(e, item.id, item.startDate, item.endDate, 'move');
                          }}
                          title={`${item.title} (${item.startDate} - ${item.endDate}) - Drag to move, resize handles to adjust duration`}
                        >
                          {/* Resize handles - Always visible and larger */}
                          <div 
                            className="absolute left-0 top-0 w-8 h-full  bg-opacity-30 cursor-ew-resize opacity-100 hover:bg-opacity-60 transition-all duration-200 rounded-l-md flex items-center justify-center border-r-2 border-blue-400 z-20"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleDragStart(e, item.id, item.startDate, item.endDate, 'resize-start');
                            }}
                            title="Drag to resize start date"
                          >
                            <div className="w-3 h-8 bg-blue-700 rounded-sm shadow-lg flex items-center justify-center">
                              <div className="w-1 h-6 bg-white rounded"></div>
                            </div>
                          </div>
                          <div 
                            className="absolute right-0 top-0 w-8 h-full bg-opacity-30 cursor-ew-resize opacity-100 hover:bg-opacity-60 transition-all duration-200 rounded-r-md flex items-center justify-center border-l-2 border-blue-400 z-20"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleDragStart(e, item.id, item.startDate, item.endDate, 'resize-end');
                            }}
                            title="Drag to resize end date"
                          >
                            <div className="w-3 h-8 bg-blue-700 rounded-sm shadow-lg flex items-center justify-center">
                              <div className="w-1 h-6 bg-white rounded"></div>
                            </div>
                          </div>
                          
                          <div className="h-full bg-orange-300 bg-opacity-40 rounded-md flex items-center px-12 z-10">
                            <span className="text-xs text-white font-medium truncate">
                              {item.title}
                            </span>
                            {item.assignee && (
                              <div className="ml-1 w-4 h-4 bg-orange-600 bg-opacity-50 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {getAssigneeInitials(item.assignee)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Task Row - Empty Timeline */}
                <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="h-full flex items-center px-2">
                    <div className="text-sm text-gray-500 italic">Timeline sẽ hiển thị khi có task</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
