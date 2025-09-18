'use client';


import React, { useState, useRef, useEffect } from 'react';
import { mockEpics, mockTasks, mockProject } from '@/constants/mockData';
import { ItemModal } from './modals/ItemModal';

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
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalItemType, setModalItemType] = useState<'epic' | 'task'>('epic');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedEpicForTask, setSelectedEpicForTask] = useState<{ id: string; title: string } | null>(null);
  
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
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);



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
            startDate: (task as any).startDate || task.createdDate,
            endDate: (task as any).endDate || task.dueDate,
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


  // Generate timeline dates for infinite scrolling (like a schedule)
  const generateTimelineDates = () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    
    // Generate a large range for infinite scrolling (5 years in each direction)
    startDate.setFullYear(today.getFullYear() - 5, 0, 1); // January 1st, 5 years ago
    endDate.setFullYear(today.getFullYear() + 5, 11, 31); // December 31st, 5 years ahead
    console.log(`📅 Infinite timeline: ${startDate.toDateString()} to ${endDate.toDateString()}`);

    const dates: Date[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    console.log(`📅 Infinite timeline: Generated ${dates.length} days from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    return dates;
  };

  const timelineDates = generateTimelineDates();

  // Auto-scroll to current week on mount
  useEffect(() => {
    if (contentRef.current) {
      const today = new Date();
      const todayIndex = timelineDates.findIndex(date => 
        date.getFullYear() === today.getFullYear() && 
        date.getMonth() === today.getMonth() && 
        date.getDate() === today.getDate()
      );
      
      if (todayIndex !== -1) {
        // Calculate scroll position to center the current week
        const dayWidth = 64; // 64px per day
        const containerWidth = contentRef.current.clientWidth;
        const todayPosition = todayIndex * dayWidth;
        const scrollPosition = Math.max(0, todayPosition - (containerWidth / 2));
        
        console.log(`📅 Auto-scroll to today: index=${todayIndex}, position=${todayPosition}px, scroll=${scrollPosition}px`);
        contentRef.current.scrollLeft = scrollPosition;
      }
    }
  }, []); // Run once on mount

  // Sync scroll between header and content
  const syncScroll = (sourceRef: React.RefObject<HTMLDivElement | null>, targetRef: React.RefObject<HTMLDivElement | null>) => {
    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
    }
  };

  // Calculate position and width for timeline bars using real calendar
  const calculateBarPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn(`⚠️ Invalid dates: startDate=${startDate}, endDate=${endDate}`);
      return { left: 0, width: 0 };
    }
    
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
    
    // For single day tasks, ensure duration is exactly 1
    if (startUTC.getTime() === endUTC.getTime()) {
      duration = 1;
    }
    
    const leftPercent = Math.max(0, (startOffset / totalUnits) * 100);
    // Calculate width based on actual duration
    const calculatedWidth = (duration / totalUnits) * 100;
    
    // Use exact calculated width for all durations, don't force minimum
    const widthPercent = calculatedWidth;
    
    console.log(`📊 Date Calculation: start=${start.toISOString().split('T')[0]}, end=${end.toISOString().split('T')[0]}, startOffset=${startOffset}, duration=${duration}, totalUnits=${totalUnits}, calculatedWidth=${calculatedWidth}%, widthPercent=${widthPercent}%`);
    
    return { left: leftPercent, width: widthPercent };
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, itemId: string, startDate: string, endDate: string, dragType: 'move' | 'resize-start' | 'resize-end' = 'move') => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`🎯 Drag Start: ${itemId}, Type: ${dragType}, ClientX: ${e.clientX}`);
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
    
    console.log(`🔄 Drag Move: deltaX=${deltaX}, daysToMove=${daysToMove}, type=${dragStart.dragType}, draggedItem=${draggedItem}`);
    
    // Allow movement even for small deltas to ensure single day tasks can be dragged
    if (Math.abs(deltaX) > 5) { // Minimum 5px movement threshold
      const newStartDate = new Date(dragStart.startDate);
      const newEndDate = new Date(dragStart.endDate);
      
      if (dragStart.dragType === 'move') {
        newStartDate.setDate(newStartDate.getDate() + daysToMove);
        newEndDate.setDate(newEndDate.getDate() + daysToMove);
      } else if (dragStart.dragType === 'resize-start') {
        newStartDate.setDate(newStartDate.getDate() + daysToMove);
        // Allow single day tasks - allow start date to equal end date
        if (newStartDate > newEndDate) {
          newStartDate.setDate(newEndDate.getDate());
        }
      } else if (dragStart.dragType === 'resize-end') {
        newEndDate.setDate(newEndDate.getDate() + daysToMove);
        // Allow single day tasks - allow end date to equal start date
        if (newEndDate < newStartDate) {
          newEndDate.setDate(newStartDate.getDate());
        }
      }
      
      const newStartDateStr = newStartDate.toISOString().split('T')[0];
      const newEndDateStr = newEndDate.toISOString().split('T')[0];
      
      console.log(`📅 Updated: ${draggedItem} - ${newStartDateStr} to ${newEndDateStr}, Duration: ${Math.floor((new Date(newEndDateStr).getTime() - new Date(newStartDateStr).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`);
      
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
        console.log(`🌍 Global Mouse Move: draggedItem=${draggedItem}, clientX=${e.clientX}`);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);


  // Handle open create epic modal
  const handleOpenCreateEpicModal = () => {
    setModalMode('create');
    setModalItemType('epic');
    setSelectedItem(null);
    setIsModalOpen(true);
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
    setModalMode('create');
    setModalItemType('task');
    setSelectedEpicForTask({ id: epicId, title: epicTitle });
    setSelectedItem({ epicId });
    setIsModalOpen(true);
  };

  // Handle modal submit (create or edit)
  const handleModalSubmit = (itemData: {
    id?: string;
    title: string;
    description: string;
    priority: string;
    assignee: string;
    startDate: string;
    endDate: string;
    status: string;
    progress: number;
    epicId?: string;
  }) => {
    if (modalMode === 'create') {
      if (modalItemType === 'epic') {
        const newEpic: TimelineItem = {
          id: `epic-${Date.now()}`,
          title: itemData.title,
          type: 'epic',
          status: itemData.status,
          priority: itemData.priority as 'low' | 'medium' | 'high' | 'urgent',
          assignee: itemData.assignee,
          startDate: itemData.startDate,
          endDate: itemData.endDate,
          rowIndex: timelineItems.length,
          progress: itemData.progress
        };
        setTimelineItems(prev => [...prev, newEpic]);
        console.log('✅ Created epic:', newEpic);
      } else {
        const newTask: TimelineItem = {
          id: `task-${Date.now()}`,
          title: itemData.title,
          type: 'task',
          status: itemData.status,
          priority: itemData.priority as 'low' | 'medium' | 'high' | 'urgent',
          assignee: itemData.assignee,
          startDate: itemData.startDate,
          endDate: itemData.endDate,
          epicId: itemData.epicId || '',
          rowIndex: timelineItems.length,
          progress: itemData.progress
        };
        setTimelineItems(prev => [...prev, newTask]);
        console.log('✅ Created task:', newTask);
      }
    } else {
      // Edit mode
      setTimelineItems(prev => 
        prev.map(item => 
          item.id === itemData.id && item.type === modalItemType
            ? {
                ...item,
                title: itemData.title,
                priority: itemData.priority as 'low' | 'medium' | 'high' | 'urgent',
                assignee: itemData.assignee,
                startDate: itemData.startDate,
                endDate: itemData.endDate,
                status: itemData.status,
                progress: itemData.progress
              }
            : item
        )
      );
      console.log(`🔄 Updated ${modalItemType}:`, itemData);
    }
  };

  // Handle open edit modal
  const handleOpenEditModal = (item: any, type: 'epic' | 'task', epicTitle?: string) => {
    setModalMode('edit');
    setModalItemType(type);
    setSelectedItem({ ...item, epicTitle });
    setIsModalOpen(true);
  };

  // Handle click with drag detection
  const handleBarClick = (e: React.MouseEvent, item: any, itemType: 'epic' | 'task') => {
    // Only open modal if it's a click (not a drag)
    if (!isDraggingBar && !draggedItem) {
      e.stopPropagation();
      
      // Use timeout to ensure drag detection is complete
      setTimeout(() => {
        if (!isDraggingBar && !draggedItem) {
          handleOpenEditModal(item, itemType);
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
               <div className="flex gap-1">
                 <button
                   onClick={() => {
                     if (contentRef.current) {
                       const today = new Date();
                       const todayIndex = timelineDates.findIndex(date => 
                         date.getFullYear() === today.getFullYear() && 
                         date.getMonth() === today.getMonth() && 
                         date.getDate() === today.getDate()
                       );
                       
                       if (todayIndex !== -1) {
                         const dayWidth = 64;
                         const containerWidth = contentRef.current.clientWidth;
                         const todayPosition = todayIndex * dayWidth;
                         const scrollPosition = Math.max(0, todayPosition - (containerWidth / 2));
                         contentRef.current.scrollLeft = scrollPosition;
                       }
                     }
                   }}
                   className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                 >
                   Hôm nay
                 </button>
                 <button
                   className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white"
                 >
                   Tuần
                 </button>
               </div>
         </div>
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
           <div 
             className="w-[60%] overflow-hidden"
             ref={headerRef}
           >
            <div 
              className="overflow-hidden h-16 relative border-l-2 border-blue-200"
              style={{ width: `${timelineDates.length * 64}px` }}
            >


              {/* Drag Area Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-gradient-to-r from-blue-200 via-transparent to-blue-200"></div>
        </div>

              
               {/* Month Headers Row - Part 1 (1/3 height) */}
               {timeScale === 'day' && (
                 <div className="flex h-6 min-w-max border-b border-gray-200">
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
              
              {/* Days Row - Part 2 (2/3 height) */}
              <div 
                className="flex h-10 min-w-max" 
                ref={timelineRef}
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
                    <div key={index} className={`${showDayDetails ? 'w-16' : 'w-24'} ${isWeekStart ? 'border-l-2 border-blue-400' : 'border-r border-gray-200'} px-2 py-1 text-center transition-colors flex-shrink-0 ${isToday ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50'}`}>
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
                          onClick={() => handleOpenEditModal(epic, 'epic')}
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
                          title="Tạo Task mới"
                        >
                          +
                        </button>
        </div>
        </div>
      </div>

                  {/* Show child tasks if epic is expanded */}
                  {expandedEpics.has(epic.id) && (() => {
                    // Get tasks from both mockData and newly created tasks
                    const mockTasks = epic.tasks || [];
                    const createdTasks = timelineItems.filter(task => task.type === 'task' && task.epicId === epic.id);
                    
                    // Remove duplicates by using a Map with task.id as key
                    const taskMap = new Map();
                    
                    // Add mock tasks first
                    mockTasks.forEach(task => {
                      taskMap.set(task.id, task);
                    });
                    
                    // Add created tasks (they will override mock tasks with same ID)
                    createdTasks.forEach(task => {
                      taskMap.set(task.id, task);
                    });
                    
                    const allTasks = Array.from(taskMap.values());
                    
                    console.log(`🎯 Epic ${epic.id} tasks:`, { mockTasks, createdTasks, allTasks });
                    return allTasks.map((task, taskIndex) => (
                      <div key={`${epic.id}-task-${task.id}-${taskIndex}`} className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-gray-25 ml-6`}>
                        <div className="h-full flex items-center px-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-2 h-2 bg-purple-400 rounded-full" />
                            <span 
                              className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-purple-600 transition-colors"
                              onClick={() => handleOpenEditModal(task, 'task', epic.name || (epic as any).title)}
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
                  onClick={handleOpenCreateEpicModal}
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
            <div 
              className="w-[60%] overflow-x-auto overflow-y-hidden pb-4"
              ref={contentRef}
              onScroll={() => syncScroll(contentRef, headerRef)}
            >
             <div 
               className="relative"
               style={{ width: `${timelineDates.length * 64}px` }}
             >
              
              
               <div 
                 className="relative bg-white"
                 ref={timelineRef}
               >
                 {/* Horizontal grid lines background */}
                 <div className="absolute inset-0 opacity-20">
                   {Array.from({ length: 20 }, (_, i) => (
                     <div 
                       key={i}
                       className="absolute border-b border-gray-200"
                       style={{ 
                         top: `${i * 48}px`, 
                         height: '1px',
                         width: `${timelineDates.length * 64}px` // Full timeline width
                       }}
                     />
                   ))}
                 </div>
                 
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
                     const todayPosition = (todayIndex * columnWidth) + (columnWidth / 2); // Center in the column
                     console.log(`📅 Today Line: todayIndex=${todayIndex}, columnWidth=${columnWidth}, todayPosition=${todayPosition}px`);
                     return (
                       <div 
                         className="absolute top-0 bottom-0 w-1 bg-blue-500 z-20 pointer-events-none shadow-lg"
                         style={{ left: `${todayPosition - 2}px` }} // -2px to center the 4px wide line
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
                                minWidth: '16px',
                                backgroundColor: '#ff6b35', // Orange for epic
                                border: '1px solid rgba(255,255,255,0.3)',
                                zIndex: draggedItem === epic.id ? 20 : 10
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                console.log(`🖱️ Epic Mouse Down: ${epic.id}, Position: ${epicPosition.left}%, Width: ${epicPosition.width}%, ClientX: ${e.clientX}, Target: ${e.target}`);
                                handleDragStart(e, epic.id, startDate, endDate, 'move');
                              }}
                              title={`${epic.name || (epic as any).title}\n📅 ${new Date(epic.startDate).toLocaleDateString('vi-VN')} - ${new Date(epic.endDate).toLocaleDateString('vi-VN')}`}
                            >
                              {/* Resize handles */}
                              <div 
                                className="absolute left-0 top-0 w-3 h-full cursor-ew-resize z-20 hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-500 hover:bg-opacity-60 hover:shadow-lg transition-all duration-200 rounded-l-md"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleDragStart(e, epic.id, startDate, endDate, 'resize-start');
                                }}
                                title="Drag to resize start date"
                              />
                              <div 
                                className="absolute right-0 top-0 w-3 h-full cursor-ew-resize z-20 hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-500 hover:bg-opacity-60 hover:shadow-lg transition-all duration-200 rounded-r-md"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleDragStart(e, epic.id, startDate, endDate, 'resize-end');
                                }}
                                title="Drag to resize end date"
                              />
                              
                              {/* Epic content */}
                              <div 
                                className="h-full bg-orange-300 bg-opacity-40 rounded-md flex items-center px-2 z-10 cursor-move hover:bg-opacity-60 transition-all"
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(epic, 'epic');
                                }}
                                title={`${new Date((epic as any).startDate).toLocaleDateString('vi-VN')} - ${new Date((epic as any).endDate).toLocaleDateString('vi-VN')}`}
                              >
                                <span className="text-xs text-white font-medium truncate">
                                  {epic.name || (epic as any).title}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Show child task timeline bars if epic is expanded */}
                        {expandedEpics.has(epic.id) && (() => {
                          // Get tasks from both mockData and newly created tasks
                          const mockTasks = epic.tasks || [];
                          const createdTasks = timelineItems.filter(task => task.type === 'task' && task.epicId === epic.id);
                          
                          // Remove duplicates by using a Map with task.id as key
                          const taskMap = new Map();
                          
                          // Add mock tasks first
                          mockTasks.forEach(task => {
                            taskMap.set(task.id, task);
                          });
                          
                          // Add created tasks (they will override mock tasks with same ID)
                          createdTasks.forEach(task => {
                            taskMap.set(task.id, task);
                          });
                          
                          const allTasks = Array.from(taskMap.values());
                          
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
                                      minWidth: '16px',
                                      backgroundColor: '#8b5cf6', // Purple for task
                                      border: '1px solid rgba(255,255,255,0.3)',
                                      zIndex: draggedItem === task.id ? 20 : 10
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      console.log(`🖱️ Task Mouse Down: ${task.id}, Position: ${taskPosition.left}%, Width: ${taskPosition.width}%, ClientX: ${e.clientX}, Target: ${e.target}`);
                                      handleDragStart(e, task.id, startDate, endDate, 'move');
                                    }}
                                    title={`${task.title}\n📅 ${new Date(task.startDate).toLocaleDateString('vi-VN')} - ${new Date(task.endDate).toLocaleDateString('vi-VN')}`}
                                  >
                                    {/* Resize handles */}
                                    <div 
                                      className="absolute left-0 top-0 w-3 h-full cursor-ew-resize z-20 hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-500 hover:bg-opacity-60 hover:shadow-lg transition-all duration-200 rounded-l-md"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleDragStart(e, task.id, startDate, endDate, 'resize-start');
                                      }}
                                      title="Drag to resize start date"
                                    />
                                    <div 
                                      className="absolute right-0 top-0 w-3 h-full cursor-ew-resize z-20 hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-500 hover:bg-opacity-60 hover:shadow-lg transition-all duration-200 rounded-r-md"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleDragStart(e, task.id, startDate, endDate, 'resize-end');
                                      }}
                                      title="Drag to resize end date"
                                    />
                                    
                                    {/* Task content */}
                                    <div 
                                      className="h-full bg-purple-300 bg-opacity-40 rounded-md flex items-center px-2 z-10 cursor-move hover:bg-opacity-60 transition-all"
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditModal(task, 'task', epic.name || (epic as any).title);
                                      }}
                                      title={`${new Date((task as any).startDate).toLocaleDateString('vi-VN')} - ${new Date((task as any).endDate).toLocaleDateString('vi-VN')}`}
                                    >
                                      <span className="text-xs text-white font-medium truncate">
                                        {task.title}
                                      </span>
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

      {/* Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        item={selectedItem}
        itemType={modalItemType}
        epicTitle={selectedEpicForTask?.title || selectedItem?.epicTitle}
        mode={modalMode}
      />
    </div>
  );
};

