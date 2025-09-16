'use client';

import React, { useState, useRef, useEffect } from 'react';
import { mockEpics, mockTasks, mockProject } from '@/constants/mockData';
import { CreateEpicModal } from './modals/CreateEpicModal';
import { CreateTaskModal } from './modals/CreateTaskModal';
import { EditEpicModal } from './modals/EditEpicModal';
import { EditTaskModal } from './modals/EditTaskModal';

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
  
  // Modal states
  const [isCreateEpicModalOpen, setIsCreateEpicModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedEpicForTask, setSelectedEpicForTask] = useState<{ id: string; title: string } | null>(null);
  
  // Edit modal states
  const [isEditEpicModalOpen, setIsEditEpicModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedEpicForEdit, setSelectedEpicForEdit] = useState<any>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<any>(null);
  
  // Click vs Drag detection
  const [dragThreshold] = useState(5); // Minimum pixels to consider it a drag
  const [isDraggingBar, setIsDraggingBar] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Epic positions for mockData epics
  const [epicPositions, setEpicPositions] = useState<{[key: string]: {startDate: string, endDate: string}}>({});
  
  // Task positions for mockData tasks
  const [taskPositions, setTaskPositions] = useState<{[key: string]: {startDate: string, endDate: string}}>({});
  const timelineRef = useRef<HTMLDivElement>(null);

  // Reset timeline scroll when timeScale changes
  useEffect(() => {
    setTimelineScroll(0);
  }, [timeScale]);

  // Generate timeline items from epics and tasks (only once on mount)
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

    console.log('🔄 Initial timeline items loaded:', items);
    setTimelineItems(items);
  }, []); // Remove expandedEpics dependency to prevent re-loading

  // Update timeline items when expandedEpics changes (for showing/hiding tasks)
  useEffect(() => {
    if (timelineItems.length === 0) return; // Don't run on initial load
    
    setTimelineItems(prev => {
      const items: TimelineItem[] = [];
      let rowIndex = 0;

      // Get all epics (including newly created ones)
      const epics = prev.filter(item => item.type === 'epic');
      
      epics.forEach(epic => {
        // Add epic
        items.push({
          ...epic,
          rowIndex: rowIndex++
        });

        // Add tasks for this epic if expanded
        if (expandedEpics.has(epic.id)) {
          const tasks = prev.filter(task => task.type === 'task' && task.epicId === epic.id);
          tasks.forEach(task => {
            items.push({
              ...task,
              rowIndex: rowIndex++
            });
          });
        }
      });

      console.log('🔄 Updated timeline items for expandedEpics:', items);
      return items;
    });
  }, [expandedEpics]);


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
    e.stopPropagation();
    console.log(`🎯 Drag Start: ${itemId}, Type: ${dragType}`);
    setDraggedItem(itemId);
    setDragStart({ x: e.clientX, startDate, endDate, dragType });
    setIsDraggingBar(true);
    setDragStartTime(Date.now());
    
    // Clear any pending click timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }
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
      
      const newStartDateStr = newStartDate.toISOString().split('T')[0];
      const newEndDateStr = newEndDate.toISOString().split('T')[0];
      
      console.log(`📅 Updated: ${draggedItem} - ${newStartDateStr} to ${newEndDateStr}`);
      
      // Update timelineItems if it's a created item
      setTimelineItems(prev => prev.map(item => {
        if (item.id !== draggedItem) return item;
        return {
          ...item,
          startDate: newStartDateStr,
          endDate: newEndDateStr
        };
      }));
      
      // Update epicPositions for mockData epics
      setEpicPositions(prev => ({
        ...prev,
        [draggedItem]: {
          startDate: newStartDateStr,
          endDate: newEndDateStr
        }
      }));
      
      // Update taskPositions for mockData tasks
      setTaskPositions(prev => ({
        ...prev,
        [draggedItem]: {
          startDate: newStartDateStr,
          endDate: newEndDateStr
        }
      }));
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    const dragDuration = Date.now() - dragStartTime;
    const wasQuickClick = dragDuration < 200; // Less than 200ms is considered a click
    
    setDraggedItem(null);
    setDragStart(null);
    setIsDraggingBar(false);
    
    // If it was a quick click, allow modal to open after a short delay
    if (wasQuickClick) {
      const timeout = setTimeout(() => {
        setIsDraggingBar(false);
      }, 50);
      setClickTimeout(timeout);
    }
  };

  // Add global event listeners for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedItem && dragStart) {
        handleDragMove(e as any);
      }
      
      // Handle timeline drag globally
      if (isDraggingTimeline && timelineDragStart) {
        const deltaX = e.clientX - timelineDragStart.x;
        const sensitivity = 2.5;
        const newScroll = Math.max(0, timelineDragStart.scroll - (deltaX * sensitivity));
        const maxScroll = Math.max(0, (timelineDates.length * 64) - (timelineRef.current?.parentElement?.clientWidth || 0));
        setTimelineScroll(Math.min(newScroll, maxScroll));
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggedItem) {
        handleDragEnd();
      }
      
      // Handle timeline drag end globally
      if (isDraggingTimeline) {
        handleTimelineDragEnd();
      }
    };

    if (draggedItem || isDraggingTimeline) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedItem, dragStart, isDraggingTimeline, timelineDragStart, timelineDates.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  // Handle timeline drag start
  const handleTimelineDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingTimeline(true);
    setTimelineDragStart({ x: e.clientX, scroll: timelineScroll });
  };

  // Handle timeline drag move
  const handleTimelineDragMove = (e: React.MouseEvent) => {
    if (!isDraggingTimeline || !timelineDragStart) return;
    
    const deltaX = e.clientX - timelineDragStart.x;
    const sensitivity = 2.5; // Optimized sensitivity for smooth dragging
    const newScroll = Math.max(0, timelineDragStart.scroll - (deltaX * sensitivity));
    const maxScroll = Math.max(0, (timelineDates.length * 64) - (timelineRef.current?.parentElement?.clientWidth || 0));
    setTimelineScroll(Math.min(newScroll, maxScroll));
    
    console.log(`🔄 Timeline Drag: deltaX=${deltaX}, newScroll=${newScroll}, maxScroll=${maxScroll}`);
  };

  // Handle timeline drag end
  const handleTimelineDragEnd = () => {
    setIsDraggingTimeline(false);
    setTimelineDragStart(null);
  };

  // Handle create epic
  const handleCreateEpic = (epicData: {
    title: string;
    description: string;
    priority: string;
    assignee: string;
    startDate: string;
    endDate: string;
  }) => {
    const newEpic: TimelineItem = {
      id: `epic-${Date.now()}`,
      title: epicData.title,
      type: 'epic',
      status: 'todo',
      priority: epicData.priority as 'low' | 'medium' | 'high' | 'urgent',
      assignee: epicData.assignee,
      startDate: epicData.startDate,
      endDate: epicData.endDate,
      epicId: undefined,
      rowIndex: timelineItems.length,
      progress: 0
    };
    
    console.log('🚀 Creating new epic:', newEpic);
    setTimelineItems(prev => {
      const updated = [...prev, newEpic];
      console.log('📝 Updated timelineItems:', updated);
      return updated;
    });
    setExpandedEpics(prev => {
      const updated = new Set([...prev, newEpic.id]);
      console.log('📂 Updated expandedEpics:', updated);
      return updated;
    });
  };

  // Handle create task
  const handleCreateTask = (taskData: {
    title: string;
    description: string;
    priority: string;
    assignee: string;
    startDate: string;
    endDate: string;
    epicId: string;
  }) => {
    const newTask: TimelineItem = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      type: 'task',
      status: 'todo',
      priority: taskData.priority as 'low' | 'medium' | 'high' | 'urgent',
      assignee: taskData.assignee,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      epicId: taskData.epicId,
      rowIndex: timelineItems.length,
      progress: 0
    };
    
    console.log('🚀 Creating new task:', newTask);
    setTimelineItems(prev => {
      const updated = [...prev, newTask];
      console.log('📝 Updated timelineItems with new task:', updated);
      return updated;
    });
  };

  // Handle open create task modal
  const handleOpenCreateTaskModal = (epicId: string, epicTitle: string) => {
    setSelectedEpicForTask({ id: epicId, title: epicTitle });
    setIsCreateTaskModalOpen(true);
  };

  // Handle edit epic
  const handleUpdateEpic = (epicData: {
    id: string;
    title: string;
    description: string;
    priority: string;
    assignee: string;
    startDate: string;
    endDate: string;
    status: string;
    progress: number;
  }) => {
    setTimelineItems(prev => 
      prev.map(item => 
        item.id === epicData.id && item.type === 'epic'
          ? {
              ...item,
              title: epicData.title,
              priority: epicData.priority as 'low' | 'medium' | 'high' | 'urgent',
              assignee: epicData.assignee,
              startDate: epicData.startDate,
              endDate: epicData.endDate,
              status: epicData.status,
              progress: epicData.progress
            }
          : item
      )
    );
    console.log('🔄 Updated epic:', epicData);
  };

  // Handle edit task
  const handleUpdateTask = (taskData: {
    id: string;
    title: string;
    description: string;
    priority: string;
    assignee: string;
    startDate: string;
    endDate: string;
    status: string;
    progress: number;
    epicId: string;
  }) => {
    setTimelineItems(prev => 
      prev.map(item => 
        item.id === taskData.id && item.type === 'task'
          ? {
              ...item,
              title: taskData.title,
              priority: taskData.priority as 'low' | 'medium' | 'high' | 'urgent',
              assignee: taskData.assignee,
              startDate: taskData.startDate,
              endDate: taskData.endDate,
              status: taskData.status,
              progress: taskData.progress
            }
          : item
      )
    );
    console.log('🔄 Updated task:', taskData);
  };

  // Handle open edit epic modal
  const handleOpenEditEpicModal = (epic: any) => {
    setSelectedEpicForEdit(epic);
    setIsEditEpicModalOpen(true);
  };

  // Handle open edit task modal
  const handleOpenEditTaskModal = (task: any, epicTitle?: string) => {
    setSelectedTaskForEdit({ ...task, epicTitle });
    setIsEditTaskModalOpen(true);
  };

  // Handle click with drag detection
  const handleBarClick = (e: React.MouseEvent, item: any, itemType: 'epic' | 'task') => {
    // Only open modal if it's a click (not a drag)
    if (!isDraggingBar && !draggedItem) {
      e.stopPropagation();
      
      // Use timeout to ensure drag detection is complete
      setTimeout(() => {
        if (!isDraggingBar && !draggedItem) {
          if (itemType === 'epic') {
            handleOpenEditEpicModal(item);
          } else {
            handleOpenEditTaskModal(item);
          }
        }
      }, 100);
    }
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
              className={`overflow-hidden transition-all duration-200 ${isDraggingTimeline ? 'cursor-grabbing bg-blue-100 shadow-lg' : 'cursor-grab hover:bg-blue-50 hover:shadow-md'} h-16 relative border-l-2 border-blue-200`}
              onMouseDown={handleTimelineDragStart}
              onMouseMove={handleTimelineDragMove}
              onMouseUp={handleTimelineDragEnd}
              onMouseLeave={handleTimelineDragEnd}
              title="Kéo để di chuyển timeline"
            >


              {/* Drag Area Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-gradient-to-r from-blue-200 via-transparent to-blue-200"></div>
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
            {/* Display Epics and their Tasks */}
            {(() => {
              // Get all epics from mockData + newly created epics
              const allEpics = [...mockEpics];
              const createdEpics = timelineItems.filter(item => item.type === 'epic' && !mockEpics.find(mockEpic => mockEpic.id === item.id));
              const epics = [...allEpics, ...createdEpics.map(createdEpic => ({
                id: createdEpic.id,
                name: createdEpic.title,
                description: '',
                status: createdEpic.status,
                progress: createdEpic.progress,
                startDate: createdEpic.startDate,
                endDate: createdEpic.endDate,
                tasks: []
              }))];
              
              console.log('🎯 All epics for display:', epics);
              return epics.map((epic, epicIndex) => (
                <React.Fragment key={`epic-${epic.id}-${epicIndex}`}>
                  {/* Epic Row */}
                  <div className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors ${epicIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="h-full flex items-center px-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button 
                          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                          onClick={() => {
                            const newExpanded = new Set(expandedEpics);
                            if (newExpanded.has(epic.id)) {
                              newExpanded.delete(epic.id);
                            } else {
                              newExpanded.add(epic.id);
                            }
                            setExpandedEpics(newExpanded);
                          }}
                        >
                          {expandedEpics.has(epic.id) ? '▼' : '▶'}
                        </button>
                        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span 
                          className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleOpenEditEpicModal(epic)}
                          title="Click để chỉnh sửa Epic"
                        >
                          {epic.name || (epic as any).title}
                        </span>
                        <span className="text-xs text-gray-500">({epic.id})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${epic.progress}%`,
                                background: 'linear-gradient(to right, #f97316, #ea580c)'
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{epic.progress}%</span>
                        </div>
                        {(epic as any).assignee && (
                          <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                            {getAssigneeInitials((epic as any).assignee)}
                          </div>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(epic.status)} text-white`}>
                          {epic.status.toUpperCase()}
                        </span>
                        <button 
                          className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                          onClick={() => handleOpenCreateTaskModal(epic.id, epic.name || (epic as any).title)}
                        >
                          + Task
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Show child tasks if epic is expanded */}
                  {expandedEpics.has(epic.id) && (() => {
                    // Get tasks from both mockData and newly created tasks
                    const mockTasks = epic.tasks || [];
                    const createdTasks = timelineItems.filter(task => task.type === 'task' && task.epicId === epic.id);
                    const allTasks = [...mockTasks, ...createdTasks];
                    
                    console.log(`🎯 Epic ${epic.id} tasks:`, { mockTasks, createdTasks, allTasks });
                    return allTasks.map((task, taskIndex) => (
                      <div key={`${epic.id}-task-${task.id}-${taskIndex}`} className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-gray-25 ml-6`}>
                        <div className="h-full flex items-center px-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-2 h-2 bg-purple-400 rounded-full" />
                            <span 
                              className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-purple-600 transition-colors"
                              onClick={() => handleOpenEditTaskModal(task, epic.name || (epic as any).title)}
                              title="Click để chỉnh sửa Task"
                            >
                              {task.title}
                            </span>
                            <span className="text-xs text-gray-500">({task.id})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {task.assignee && (
                              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                                {getAssigneeInitials(task.assignee)}
                              </div>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(task.status)} text-white`}>
                              {task.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </React.Fragment>
              ));
            })()}

            {/* Add Epic Row - At the end */}
            <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors">
              <div className="h-full flex items-center px-3">
                <button 
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                  onClick={() => setIsCreateEpicModalOpen(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Tạo Epic</span>
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

                {/* Display Epic and Task Timeline Bars */}
                {(() => {
                  // Get all epics from mockData + newly created epics
                  const allEpics = [...mockEpics];
                  const createdEpics = timelineItems.filter(item => item.type === 'epic' && !mockEpics.find(mockEpic => mockEpic.id === item.id));
                  const epics = [...allEpics, ...createdEpics.map(createdEpic => ({
                    id: createdEpic.id,
                    name: createdEpic.title,
                    description: '',
                    status: createdEpic.status,
                    progress: createdEpic.progress,
                    startDate: createdEpic.startDate,
                    endDate: createdEpic.endDate,
                    tasks: []
                  }))];
                  
                  console.log('🎯 Timeline epics for display:', epics);
                  return epics.map((epic, epicIndex) => {
                    // Use custom position if available, otherwise use original dates
                    const customPosition = epicPositions[epic.id];
                    const startDate = customPosition ? customPosition.startDate : epic.startDate;
                    const endDate = customPosition ? customPosition.endDate : epic.endDate;
                    const epicPosition = calculateBarPosition(startDate, endDate);
                    return (
                      <React.Fragment key={`timeline-epic-${epic.id}-${epicIndex}`}>
                        {/* Epic Timeline Bar */}
                        <div className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${epicIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <div className="absolute top-2 left-0 h-8" style={{ width: `${timelineDates.length * 64}px` }}>
                            <div 
                              className={`absolute h-8 rounded-md cursor-move group transition-all duration-200 ${draggedItem === epic.id ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'}`}
                              style={{
                                left: `${epicPosition.left}%`,
                                width: `${epicPosition.width}%`,
                                minWidth: '80px',
                                backgroundColor: '#ff6b35', // Orange for epic
                                border: '1px solid rgba(255,255,255,0.3)',
                                zIndex: draggedItem === epic.id ? 20 : 10
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleDragStart(e, epic.id, startDate, endDate, 'move');
                              }}
                              title={`${epic.name || (epic as any).title} (${epic.startDate} - ${epic.endDate}) - Drag to move, resize handles to adjust duration`}
                            >
                              {/* Resize handles */}
                              <div 
                                className="absolute left-0 top-0 w-8 h-full bg-blue-500 bg-opacity-30 cursor-ew-resize opacity-100 hover:bg-opacity-60 transition-all duration-200 rounded-l-md flex items-center justify-center border-r-2 border-blue-400 z-20"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleDragStart(e, epic.id, startDate, endDate, 'resize-start');
                                }}
                                title="Drag to resize start date"
                              >
                                <div className="w-3 h-8 bg-blue-700 rounded-sm shadow-lg flex items-center justify-center">
                                  <div className="w-1 h-6 bg-white rounded"></div>
                                </div>
                              </div>
                              <div 
                                className="absolute right-0 top-0 w-8 h-full bg-blue-500 bg-opacity-30 cursor-ew-resize opacity-100 hover:bg-opacity-60 transition-all duration-200 rounded-r-md flex items-center justify-center border-l-2 border-blue-400 z-20"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleDragStart(e, epic.id, startDate, endDate, 'resize-end');
                                }}
                                title="Drag to resize end date"
                              >
                                <div className="w-3 h-8 bg-blue-700 rounded-sm shadow-lg flex items-center justify-center">
                                  <div className="w-1 h-6 bg-white rounded"></div>
                                </div>
                              </div>
                              
                              {/* Epic content */}
                              <div 
                                className="h-full bg-orange-300 bg-opacity-40 rounded-md flex items-center px-12 z-10 cursor-move hover:bg-opacity-60 transition-all"
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditEpicModal(epic);
                                }}
                                title="Kéo để di chuyển Epic, kéo handles để điều chỉnh thời gian, double-click để chỉnh sửa"
                              >
                                <span className="text-xs text-white font-medium truncate">
                                  {epic.name || (epic as any).title}
                                </span>
                                {(epic as any).assignee && (
                                  <div className="ml-1 w-4 h-4 bg-orange-600 bg-opacity-50 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                    {getAssigneeInitials((epic as any).assignee)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Show child task timeline bars if epic is expanded */}
                        {expandedEpics.has(epic.id) && (() => {
                          // Get tasks from both mockData and newly created tasks
                          const mockTasks = epic.tasks || [];
                          const createdTasks = timelineItems.filter(task => task.type === 'task' && task.epicId === epic.id);
                          const allTasks = [...mockTasks, ...createdTasks];
                          
                          console.log(`🎯 Timeline Epic ${epic.id} tasks:`, { mockTasks, createdTasks, allTasks });
                          return allTasks.map((task, taskIndex) => {
                            // Use custom position if available, otherwise use original dates
                            const customPosition = taskPositions[task.id];
                            const startDate = customPosition ? customPosition.startDate : task.startDate;
                            const endDate = customPosition ? customPosition.endDate : task.endDate;
                            const taskPosition = calculateBarPosition(startDate, endDate);
                            return (
                              <div key={`${epic.id}-timeline-task-${task.id}-${taskIndex}`} className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors relative bg-gray-25`}>
                                <div className="absolute top-2 left-0 h-8" style={{ width: `${timelineDates.length * 64}px` }}>
                                  <div 
                                    className={`absolute h-8 rounded-md cursor-move group transition-all duration-200 ${draggedItem === task.id ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'}`}
                                    style={{
                                      left: `${taskPosition.left}%`,
                                      width: `${taskPosition.width}%`,
                                      minWidth: '80px',
                                      backgroundColor: '#8b5cf6', // Purple for task
                                      border: '1px solid rgba(255,255,255,0.3)',
                                      zIndex: draggedItem === task.id ? 20 : 10
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      handleDragStart(e, task.id, startDate, endDate, 'move');
                                    }}
                                    title={`${task.title} (${task.startDate} - ${task.endDate}) - Drag to move, resize handles to adjust duration`}
                                  >
                                    {/* Resize handles */}
                                    <div 
                                      className="absolute left-0 top-0 w-8 h-full bg-blue-500 bg-opacity-30 cursor-ew-resize opacity-100 hover:bg-opacity-60 transition-all duration-200 rounded-l-md flex items-center justify-center border-r-2 border-blue-400 z-20"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleDragStart(e, task.id, startDate, endDate, 'resize-start');
                                      }}
                                      title="Drag to resize start date"
                                    >
                                      <div className="w-3 h-8 bg-blue-700 rounded-sm shadow-lg flex items-center justify-center">
                                        <div className="w-1 h-6 bg-white rounded"></div>
                                      </div>
                                    </div>
                                    <div 
                                      className="absolute right-0 top-0 w-8 h-full bg-blue-500 bg-opacity-30 cursor-ew-resize opacity-100 hover:bg-opacity-60 transition-all duration-200 rounded-r-md flex items-center justify-center border-l-2 border-blue-400 z-20"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleDragStart(e, task.id, startDate, endDate, 'resize-end');
                                      }}
                                      title="Drag to resize end date"
                                    >
                                      <div className="w-3 h-8 bg-blue-700 rounded-sm shadow-lg flex items-center justify-center">
                                        <div className="w-1 h-6 bg-white rounded"></div>
                                      </div>
                                    </div>
                                    
                                    {/* Task content */}
                                    <div 
                                      className="h-full bg-purple-300 bg-opacity-40 rounded-md flex items-center px-12 z-10 cursor-move hover:bg-opacity-60 transition-all"
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditTaskModal(task, epic.name || (epic as any).title);
                                      }}
                                      title="Kéo để di chuyển Task, kéo handles để điều chỉnh thời gian, double-click để chỉnh sửa"
                                    >
                                      <span className="text-xs text-white font-medium truncate">
                                        {task.title}
                                      </span>
                                      {task.assignee && (
                                        <div className="ml-1 w-4 h-4 bg-purple-600 bg-opacity-50 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                          {getAssigneeInitials(task.assignee)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </React.Fragment>
                    );
                  });
                })()}

                {/* Add Epic Row - Empty Timeline */}
                <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="h-full flex items-center px-2">
                    <div className="text-sm text-gray-500 italic">Timeline sẽ hiển thị khi có epic</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEpicModal
        isOpen={isCreateEpicModalOpen}
        onClose={() => setIsCreateEpicModalOpen(false)}
        onCreateEpic={handleCreateEpic}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        epicId={selectedEpicForTask?.id || ''}
        epicTitle={selectedEpicForTask?.title || ''}
      />

      <EditEpicModal
        isOpen={isEditEpicModalOpen}
        onClose={() => setIsEditEpicModalOpen(false)}
        onUpdateEpic={handleUpdateEpic}
        epic={selectedEpicForEdit}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        onUpdateTask={handleUpdateTask}
        task={selectedTaskForEdit}
        epicTitle={selectedTaskForEdit?.epicTitle}
      />
    </div>
  );
};
