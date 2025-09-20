'use client';


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { mockMilestones, mockTasks, mockProject } from '@/constants/mockData';
import { ItemModal } from './modals/ItemModal';

interface Task {
  id: string;
  title: string;
  description: string;
  epic: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string | null;
  startDate: string;
  endDate: string;
  createdDate: string;
  updatedDate: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  milestoneId: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  progress: number;
  dueDate: string;
  tasks: Task[];
}

interface TimelineItem {
  id: string;
  title: string;
  type: 'milestone' | 'task';
  status: string;
  priority: string;
  assignee: string | null;
  startDate: string;
  endDate: string;
  dueDate?: string;
  progress: number;
  milestoneId?: string;
  rowIndex: number;
}

interface ProjectTimelineProps {

  project: any;
}

export const ProjectTimeline = ({ project }: ProjectTimelineProps) => {

  const [timeScale, setTimeScale] = useState<'day'>('day');
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set(['milestone-1', 'milestone-2', 'milestone-3']));
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; startDate: string; endDate: string; dragType: 'move' | 'resize-start' | 'resize-end' } | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalItemType, setModalItemType] = useState<'milestone' | 'task'>('milestone');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedEpicForTask, setSelectedEpicForTask] = useState<{ id: string; title: string } | null>(null);
  
  // Click vs Drag detection
  const [dragThreshold] = useState(5); // Minimum pixels to consider it a drag
  const [isDraggingBar, setIsDraggingBar] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Milestone positions for mockData milestones
  const [milestonePositions, setMilestonePositions] = useState<{[key: string]: {dueDate: string}}>({});
  
  // Task positions for mockData tasks
  const [taskPositions, setTaskPositions] = useState<{[key: string]: {startDate: string, endDate: string}}>({});
  
  // Task drag & drop states
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverMilestone, setDragOverMilestone] = useState<string | null>(null);
  const [dragOverTask, setDragOverTask] = useState<string | null>(null);
  const [isHtml5Drag, setIsHtml5Drag] = useState(false);
  const [dragOverSameLevel, setDragOverSameLevel] = useState(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);



  // Generate timeline items from milestones and tasks (only once on mount)
  useEffect(() => {
    const items: TimelineItem[] = [];
    let rowIndex = 0;

    mockMilestones.forEach(milestone => {
      // Add milestone
      items.push({
        id: milestone.id,
        title: milestone.name,
        type: 'milestone',
        status: milestone.status,
        priority: 'high',
        assignee: null,
        startDate: (milestone as any).dueDate,
        endDate: (milestone as any).dueDate,
        dueDate: (milestone as any).dueDate,
        progress: milestone.progress,
        rowIndex: rowIndex++
      });

      // Add tasks if milestone is expanded
      if (expandedMilestones.has(milestone.id)) {
        milestone.tasks.forEach(task => {
          items.push({
            id: task.id,
            title: task.title,
            type: 'task',
            status: task.status,
            priority: task.priority,
            assignee: task.assignee,
            startDate: (task as any).startDate || task.createdDate,
            endDate: (task as any).endDate || task.endDate,
            progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0,
            milestoneId: milestone.id,
            rowIndex: rowIndex++
          });
        });
      }
    });

    setTimelineItems(items);
  }, []); // Remove expandedMilestones dependency to prevent re-loading

  // Update timeline items when expandedMilestones changes (for showing/hiding tasks)
  useEffect(() => {
    if (timelineItems.length === 0) return; // Don't run on initial load
    
    setTimelineItems(prev => {
      const items: TimelineItem[] = [];
      let rowIndex = 0;

      // Get all milestones (including newly created ones)
      const milestones = prev.filter(item => item.type === 'milestone');
      
      milestones.forEach(milestone => {
        // Add milestone
        items.push({
          ...milestone,
          rowIndex: rowIndex++
        });

        // Add tasks for this milestone if expanded
        if (expandedMilestones.has(milestone.id)) {
          const tasks = prev.filter(task => task.type === 'task' && task.milestoneId === milestone.id);
          tasks.forEach(task => {
            items.push({
              ...task,
              rowIndex: rowIndex++
            });
          });
        }
      });

      return items;
    });
  }, [expandedMilestones]);


  // Generate timeline dates for infinite scrolling (like a schedule) - Memoized
  const timelineDates = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    
    // Generate a large range for infinite scrolling (5 years in each direction)
    startDate.setFullYear(today.getFullYear() - 5, 0, 1); // January 1st, 5 years ago
    endDate.setFullYear(today.getFullYear() + 5, 11, 31); // December 31st, 5 years ahead

    const dates: Date[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, []); // Only generate once on mount

  // Memoize month groups to avoid recalculation on every render
  const monthGroups = useMemo(() => {
    const groups: { [key: string]: { start: number; end: number; month: string } } = {};
    
    timelineDates.forEach((date, index) => {
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = { start: index, end: index, month: monthKey };
      } else {
        groups[monthKey].end = index;
      }
    });
    
    return Object.values(groups);
  }, [timelineDates]);

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
    
    
    return { left: leftPercent, width: widthPercent };
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, itemId: string, startDate: string, endDate: string, dragType: 'move' | 'resize-start' | 'resize-end' = 'move') => {
    e.preventDefault();
    e.stopPropagation();
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

  // Handle drag move with throttling for smooth performance
  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggedItem || !dragStart) return;

    const deltaX = e.clientX - dragStart.x;
    
    // Calculate pixel width per day (64px for week view)
    const pixelWidthPerDay = 64;
    const daysToMove = Math.round(deltaX / pixelWidthPerDay);
    
    // Only update if there's significant movement to reduce re-renders
    if (Math.abs(deltaX) > 5) {
      const newStartDate = new Date(dragStart.startDate);
      const newEndDate = new Date(dragStart.endDate);
      
      if (dragStart.dragType === 'move') {
        newStartDate.setDate(newStartDate.getDate() + daysToMove);
        newEndDate.setDate(newEndDate.getDate() + daysToMove);
      } else if (dragStart.dragType === 'resize-start') {
        newStartDate.setDate(newStartDate.getDate() + daysToMove);
        if (newStartDate > newEndDate) {
          newStartDate.setDate(newEndDate.getDate());
        }
      } else if (dragStart.dragType === 'resize-end') {
        newEndDate.setDate(newEndDate.getDate() + daysToMove);
        if (newEndDate < newStartDate) {
          newEndDate.setDate(newStartDate.getDate());
        }
      }
      
      const newStartDateStr = newStartDate.toISOString().split('T')[0];
      const newEndDateStr = newEndDate.toISOString().split('T')[0];
      
      // Batch state updates to prevent multiple re-renders
      requestAnimationFrame(() => {
        // Update timelineItems if it's a created item
        setTimelineItems(prev => prev.map(item => {
          if (item.id !== draggedItem) return item;
          return {
            ...item,
            startDate: newStartDateStr,
            endDate: newEndDateStr,
            dueDate: item.type === 'milestone' ? newStartDateStr : item.dueDate
          };
        }));
        
        // Update milestonePositions for mockData milestones
        setMilestonePositions(prev => ({
          ...prev,
          [draggedItem]: {
            dueDate: newStartDateStr
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
      });
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

  // Task drag & drop handlers
  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    e.stopPropagation(); // Prevent timeline drag
    setIsHtml5Drag(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTask(taskId);
    console.log(`🚀 Task drag start: ${taskId}`);
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
    setDragOverMilestone(null);
    setDragOverTask(null);
    setDragOverSameLevel(false);
    setIsHtml5Drag(false);
    // console.log('🏁 Task drag end');
  };

  const handleMilestoneDragOver = (e: React.DragEvent, milestoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverMilestone(milestoneId);
    console.log(`🎯 Drag over milestone: ${milestoneId}`);
  };

  const handleTaskDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTask(taskId);
    console.log(`🎯 Drag over task: ${taskId}`);
  };

  const handleSameLevelDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSameLevel(true);
    console.log(`🎯 Drag over same level`);
  };

  const handleMilestoneDrop = (e: React.DragEvent, targetMilestoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    
    if (draggedTaskId) {
      // console.log(`📦 Drop task ${draggedTaskId} into milestone ${targetMilestoneId}`);
      
      setTimelineItems(prev => 
        prev.map(item => {
          if (item.id === draggedTaskId && item.type === 'task') {
            return {
              ...item,
              milestoneId: targetMilestoneId
            };
          }
          return item;
        })
      );
      
      // Cập nhật mockData để xóa task khỏi milestone cũ và thêm vào milestone mới
      const draggedTask = timelineItems.find(item => item.id === draggedTaskId);
      if (draggedTask) {
        // Xóa task khỏi milestone cũ trong mockData
        mockMilestones.forEach(milestone => {
          if (milestone.tasks) {
            milestone.tasks = milestone.tasks.filter(task => task.id !== draggedTaskId);
          }
        });
        
        // Thêm task vào milestone mới trong mockData
        const targetMilestone = mockMilestones.find(m => m.id === targetMilestoneId);
        if (targetMilestone && targetMilestone.tasks) {
          const taskToAdd = {
            id: draggedTask.id,
            title: draggedTask.title,
            description: '',
            epic: '',
            status: draggedTask.status as 'todo' | 'in-progress' | 'review' | 'done',
            priority: draggedTask.priority as 'low' | 'medium' | 'high',
            assignee: draggedTask.assignee || '',
            startDate: draggedTask.startDate,
            endDate: draggedTask.endDate,
            createdDate: new Date().toISOString().split('T')[0],
            updatedDate: new Date().toISOString().split('T')[0],
            estimatedHours: 0,
            actualHours: 0,
            tags: [],
            milestoneId: targetMilestoneId
          };
          targetMilestone.tasks.push(taskToAdd);
        }
      }
    }
    
    setDragOverMilestone(null);
  };

  const handleTaskDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    
    if (draggedTaskId && draggedTaskId !== targetTaskId) {
      // console.log(`📦 Drop task ${draggedTaskId} after task ${targetTaskId}`);
      
      // Find target task's milestone
      const targetTask = timelineItems.find(item => item.id === targetTaskId);
      if (targetTask && targetTask.milestoneId) {
        setTimelineItems(prev => 
          prev.map(item => {
            if (item.id === draggedTaskId && item.type === 'task') {
              return {
                ...item,
                milestoneId: targetTask.milestoneId
              };
            }
            return item;
          })
        );
        
        // Cập nhật mockData để xóa task khỏi milestone cũ và thêm vào milestone mới
        const draggedTask = timelineItems.find(item => item.id === draggedTaskId);
        if (draggedTask) {
          // Xóa task khỏi milestone cũ trong mockData
          mockMilestones.forEach(milestone => {
            if (milestone.tasks) {
              milestone.tasks = milestone.tasks.filter(task => task.id !== draggedTaskId);
            }
          });
          
          // Thêm task vào milestone mới trong mockData
          const targetMilestone = mockMilestones.find(m => m.id === targetTask.milestoneId);
          if (targetMilestone && targetMilestone.tasks) {
            const taskToAdd = {
              id: draggedTask.id,
              title: draggedTask.title,
              description: '',
              epic: '',
              status: draggedTask.status as 'todo' | 'in-progress' | 'review' | 'done',
              priority: draggedTask.priority as 'low' | 'medium' | 'high',
              assignee: draggedTask.assignee || '',
              startDate: draggedTask.startDate,
              endDate: draggedTask.endDate,
              createdDate: new Date().toISOString().split('T')[0],
              updatedDate: new Date().toISOString().split('T')[0],
              estimatedHours: 0,
              actualHours: 0,
              tags: [],
              milestoneId: targetTask.milestoneId
            };
            targetMilestone.tasks.push(taskToAdd);
          }
        }
      }
    }
    
    setDragOverTask(null);
  };

  const handleSameLevelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    
    if (draggedTaskId) {
      // console.log(`📦 Drop task ${draggedTaskId} to same level (no milestone)`);
      
      setTimelineItems(prev => 
        prev.map(item => {
          if (item.id === draggedTaskId && item.type === 'task') {
            return {
              ...item,
              milestoneId: undefined
            };
          }
          return item;
        })
      );
      
      // Xóa task khỏi milestone cũ trong mockData
      mockMilestones.forEach(milestone => {
        if (milestone.tasks) {
          milestone.tasks = milestone.tasks.filter(task => task.id !== draggedTaskId);
        }
      });
    }
    
    setDragOverSameLevel(false);
  };

  // Add global event listeners for drag with throttling
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdateTime = 0;
    const throttleDelay = 16; // ~60fps

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedItem && dragStart) {
        const now = Date.now();
        
        // Throttle updates to 60fps for smooth performance
        if (now - lastUpdateTime >= throttleDelay) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          
          animationFrameId = requestAnimationFrame(() => {
            handleDragMove(e as any);
            lastUpdateTime = now;
          });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggedItem) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        handleDragEnd();
      }
    };

    if (draggedItem) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
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


  // Handle open create milestone modal
  const handleOpenCreateMilestoneModal = () => {
    setModalMode('create');
    setModalItemType('milestone');
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  // Handle open create task modal (same level as milestone)
  const handleOpenCreateTaskModalSameLevel = () => {
    setModalMode('create');
    setModalItemType('task');
    setSelectedItem(null);
    setSelectedEpicForTask(null);
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
    milestoneId: string;
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
      milestoneId: taskData.milestoneId,
      rowIndex: timelineItems.length,
      progress: 0
    };
    
    // console.log('🚀 Creating new task:', newTask);
    setTimelineItems(prev => {
      const updated = [...prev, newTask];
      // console.log('📝 Updated timelineItems with new task:', updated);
      return updated;
    });
  };

  // Handle open create task modal
  const handleOpenCreateTaskModal = (milestoneId: string, milestoneTitle: string) => {
    setModalMode('create');
    setModalItemType('task');
    setSelectedEpicForTask({ id: milestoneId, title: milestoneTitle });
    setSelectedItem({ milestoneId, milestoneTitle }); // Pass milestone info to modal
    setIsModalOpen(true);
  };

  // Handle modal submit (create or edit)
  const handleModalSubmit = (itemData: {
    id?: string;
    title: string;
    description: string;
    priority: string;
    assignee: string;
    startDate?: string;
    endDate?: string;
    dueDate?: string;
    status: string;
    milestoneId?: string;
  }) => {
    if (modalMode === 'create') {
      if (modalItemType === 'milestone') {
        const newMilestone: TimelineItem = {
          id: `milestone-${Date.now()}`,
          title: itemData.title,
          type: 'milestone',
          status: itemData.status,
          priority: itemData.priority as 'low' | 'medium' | 'high' | 'urgent',
          assignee: itemData.assignee,
          startDate: itemData.dueDate || '',
          endDate: itemData.dueDate || '',
          dueDate: itemData.dueDate,
          rowIndex: timelineItems.length,
          progress: 0
        };
        setTimelineItems(prev => [...prev, newMilestone]);
        // console.log('✅ Created milestone:', newMilestone);
      } else {
        const newTask: TimelineItem = {
          id: `task-${Date.now()}`,
          title: itemData.title,
          type: 'task',
          status: itemData.status,
          priority: itemData.priority as 'low' | 'medium' | 'high' | 'urgent',
          assignee: itemData.assignee,
          startDate: itemData.startDate || '',
          endDate: itemData.endDate || '',
          milestoneId: itemData.milestoneId || undefined, // undefined for same-level tasks
          rowIndex: timelineItems.length,
          progress: 0
        };
        setTimelineItems(prev => [...prev, newTask]);
        // console.log('✅ Created task:', newTask);
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
                startDate: modalItemType === 'milestone' ? (itemData.dueDate || '') : (itemData.startDate || ''),
                endDate: modalItemType === 'milestone' ? (itemData.dueDate || '') : (itemData.endDate || ''),
                dueDate: itemData.dueDate,
                status: itemData.status,
                progress: 0
              }
            : item
        )
      );
      // console.log(`🔄 Updated ${modalItemType}:`, itemData);
    }
  };

  // Handle open edit modal
  const handleOpenEditModal = (item: any, type: 'milestone' | 'task', milestoneTitle?: string) => {
    setModalMode('edit');
    setModalItemType(type);
    setSelectedItem({ ...item, milestoneTitle });
    setIsModalOpen(true);
  };

  // Handle click with drag detection
  const handleBarClick = (e: React.MouseEvent, item: any, itemType: 'milestone' | 'task') => {
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

  // Get status color (giống như tab Danh sách)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return '#6b7280';
      case 'in-progress':
        return '#f59e0b';
      case 'review':
        return '#3b82f6';
      case 'done':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  // Get status background color (giống như tab Danh sách)
  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'todo':
        return '#f3f4f6';
      case 'in-progress':
        return '#fef3c7';
      case 'review':
        return '#dbeafe';
      case 'done':
        return '#dcfce7';
      default:
        return '#f3f4f6';
    }
  };

  // Get status label in Vietnamese (giống như tab Danh sách)
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'Cần làm';
      case 'in-progress':
        return 'Đang làm';
      case 'review':
        return 'Đang review';
      case 'done':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  // Get timeline bar color based on type
  const getTimelineBarColor = (item: TimelineItem) => {
    // console.log(`🔍 DEBUG: ${item.title} - Type: "${item.type}", Status: "${item.status}"`);
    
    // Test với màu sắc cố định để debug
    if (item.type === 'milestone') {
      // console.log(`🟠 EPIC: ${item.title} - Using ORANGE`);
      return '#ff6b35'; // Bright orange để test
    } else {
      // console.log(`🟣 TASK: ${item.title} - Using PURPLE`);
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
              <p className="text-sm text-gray-600">Theo dõi và quản lý tiến độ dự án</p>
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
                  {monthGroups.map((group, groupIndex) => {
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
                  })}
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
                  
                  // Show detailed day info for week view
                  const showDayDetails = true;
                  
                  // Debug week boundary
                  const isWeekStart = date.getDay() === 1;
                  
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
             {/* Display Milestones and their Tasks */}
             {useMemo(() => {
               // Get all milestones from mockData + newly created milestones
               const allMilestones = [...mockMilestones];
               const createdMilestones = timelineItems.filter(item => item.type === 'milestone' && !mockMilestones.find(mockMilestone => mockMilestone.id === item.id));
               const milestones = [...allMilestones, ...createdMilestones.map(createdMilestone => ({
                 id: createdMilestone.id,
                 name: createdMilestone.title,
                 description: '',
                 status: createdMilestone.status,
                 progress: createdMilestone.progress,
                 dueDate: createdMilestone.dueDate || createdMilestone.startDate,
                 tasks: []
               }))];
               
               // Get same-level tasks (tasks without milestoneId)
               const sameLevelTasks = timelineItems.filter(item => item.type === 'task' && !item.milestoneId);
              
               // console.log('🎯 All milestones for display:', milestones);
               // console.log('🎯 Same-level tasks:', sameLevelTasks);
              
              return (
                <>
                  {/* Render milestones */}
                  {milestones.map((milestone, milestoneIndex) => (
                <React.Fragment key={`milestone-${milestone.id}-${milestoneIndex}`}>
                   {/* Milestone Row */}
                   <div 
                     className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors ${milestoneIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${dragOverMilestone === milestone.id ? 'bg-blue-50 border-blue-200' : ''}`}
                     onDragOver={(e) => handleMilestoneDragOver(e, milestone.id)}
                     onDrop={(e) => handleMilestoneDrop(e, milestone.id)}
                     onDragLeave={() => setDragOverMilestone(null)}
                   >
                     <div className="h-full flex items-center px-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button 
                          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                          onClick={() => {
                            const newExpanded = new Set(expandedMilestones);
                            if (newExpanded.has(milestone.id)) {
                              newExpanded.delete(milestone.id);
                            } else {
                              newExpanded.add(milestone.id);
                            }
                            setExpandedMilestones(newExpanded);
                          }}
                        >
                          {expandedMilestones.has(milestone.id) ? '▼' : '▶'}
                        </button>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ea580c' }}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </div>
                        <span 
                          className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleOpenEditModal(milestone, 'milestone')}
                          title="Click để chỉnh sửa Milestone"
                        >
                          {milestone.name || (milestone as any).title}
                        </span>
                        <span className="text-xs text-gray-500">({milestone.id})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${milestone.progress}%`,
                                background: 'linear-gradient(to right, #ea580c, #dc2626)'
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{milestone.progress}%</span>
                        </div>
                        {(milestone as any).assignee && (
                          <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                            {getAssigneeInitials((milestone as any).assignee)}
          </div>
                        )}
                        <span 
                          className="px-2 py-1 text-xs rounded-full font-medium"
                          style={{
                            backgroundColor: getStatusBackgroundColor(milestone.status),
                            color: getStatusColor(milestone.status)
                          }}
                        >
                          {getStatusLabel(milestone.status)}
                        </span>
                        <button 
                          className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                          onClick={() => handleOpenCreateTaskModal(milestone.id, milestone.name || (milestone as any).title)}
                          title="Tạo Task mới"
                        >
                          +
                        </button>
        </div>
        </div>
      </div>

                  {/* Show child tasks if milestone is expanded */}
                  {expandedMilestones.has(milestone.id) && (() => {
                    // Get tasks from both mockData and newly created tasks
                    const mockTasks = milestone.tasks || [];
                    const createdTasks = timelineItems.filter(task => task.type === 'task' && task.milestoneId === milestone.id);
                    
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
                    
                     // console.log(`🎯 Milestone ${milestone.id} tasks:`, { mockTasks, createdTasks, allTasks });
                     return allTasks.map((task, taskIndex) => (
                       <div 
                         key={`${milestone.id}-task-${task.id}-${taskIndex}`} 
                         className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-gray-25 ml-6 ${dragOverTask === task.id ? 'bg-blue-50 border-blue-200' : ''}`}
                         onDragOver={(e) => handleTaskDragOver(e, task.id)}
                         onDrop={(e) => handleTaskDrop(e, task.id)}
                         onDragLeave={() => setDragOverTask(null)}
                       >
                         <div className="h-full flex items-center px-3">
                           <div className="flex items-center space-x-3 flex-1 min-w-0">
                             <div 
                               className="flex items-center space-x-2 flex-1 min-w-0"
                             >
                               <div
                                 className="cursor-move p-1 hover:bg-gray-100 rounded"
                                 draggable={true}
                                 onDragStart={(e) => {
                                   e.stopPropagation();
                                   handleTaskDragStart(e, task.id);
                                 }}
                                 onDragEnd={handleTaskDragEnd}
                                 title="Kéo để di chuyển task"
                               >
                                 <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                 </svg>
                               </div>
                               <span 
                                 className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-orange-600 transition-colors"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleOpenEditModal(task, 'task', milestone.name || (milestone as any).title);
                                 }}
                                 title="Click để chỉnh sửa Task"
                               >
                                 {task.title}
                               </span>
                               <span className="text-xs text-gray-500">({task.id})</span>
                             </div>
                           </div>
                           <div className="flex items-center space-x-2">
                             {task.assignee && (
                               <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                                 {getAssigneeInitials(task.assignee)}
                               </div>
                             )}
                             <span 
                               className="px-2 py-1 text-xs rounded-full font-medium"
                               style={{
                                 backgroundColor: getStatusBackgroundColor(task.status),
                                 color: getStatusColor(task.status)
                               }}
                             >
                               {getStatusLabel(task.status)}
                             </span>
                           </div>
                         </div>
                       </div>
                     ));
                  })()}
                </React.Fragment>
                  ))}
                  
                   {/* Render same-level tasks */}
                   {sameLevelTasks.map((task, taskIndex) => (
                       <div 
                         key={`same-level-task-${task.id}-${taskIndex}`} 
                         className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors ${(milestones.length + taskIndex) % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${dragOverTask === task.id ? 'bg-blue-50 border-blue-200' : ''}`}
                         onDragOver={(e) => handleTaskDragOver(e, task.id)}
                         onDrop={(e) => handleTaskDrop(e, task.id)}
                         onDragLeave={() => setDragOverTask(null)}
                       >
                         <div className="h-full flex items-center px-3">
                           <div className="flex items-center space-x-3 flex-1 min-w-0">
                             <div 
                               className="flex items-center space-x-2 flex-1 min-w-0"
                             >
                               <div
                                 className="cursor-move p-1 hover:bg-gray-100 rounded"
                                 draggable={true}
                                 onDragStart={(e) => {
                                   e.stopPropagation();
                                   handleTaskDragStart(e, task.id);
                                 }}
                                 onDragEnd={handleTaskDragEnd}
                                 title="Kéo để di chuyển task"
                               >
                                 <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                 </svg>
                               </div>
                               <span 
                                 className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-orange-600 transition-colors"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleOpenEditModal(task, 'task');
                                 }}
                                 title="Click để chỉnh sửa Task"
                               >
                                 {task.title}
                               </span>
                               <span className="text-xs text-gray-500">({task.id})</span>
                             </div>
                           </div>
                           <div className="flex items-center space-x-2">
                             {task.assignee && (
                               <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                                 {getAssigneeInitials(task.assignee)}
                               </div>
                             )}
                             <span 
                               className="px-2 py-1 text-xs rounded-full font-medium"
                               style={{
                                 backgroundColor: getStatusBackgroundColor(task.status),
                                 color: getStatusColor(task.status)
                               }}
                             >
                               {getStatusLabel(task.status)}
                             </span>
                           </div>
                         </div>
                       </div>
                     ))}
                </>
              );
            }, [timelineItems, expandedMilestones, dragOverTask, dragOverMilestone])}

            {/* Add Milestone Row - At the end */}
            <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors">
              <div className="h-full flex items-center px-3 space-x-3">
                <button 
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium cursor-pointer"
                  onClick={handleOpenCreateMilestoneModal}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9 6 9-6" />
                  </svg>
                  <span>Tạo Milestone</span>
                </button>
                <button 
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium cursor-pointer"
                  onClick={handleOpenCreateTaskModalSameLevel}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>Tạo Task</span>
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
                  // console.log(`📅 Today: ${today.toDateString()}, Found at index: ${todayIndex}`);
                  // console.log(`📅 Timeline dates: ${timelineDates.slice(0, 10).map(d => d.toDateString()).join(', ')}...`);
                  
                   if (todayIndex !== -1) {
                     const columnWidth = 64;
                     const todayPosition = (todayIndex * columnWidth) + (columnWidth / 2); // Center in the column
                     // console.log(`📅 Today Line: todayIndex=${todayIndex}, columnWidth=${columnWidth}, todayPosition=${todayPosition}px`);
                     return (
                       <div 
                         className="absolute top-0 bottom-0 w-1 bg-blue-500 z-20 pointer-events-none shadow-lg"
                         style={{ left: `${todayPosition - 2}px` }} // -2px to center the 4px wide line
                       />
                     );
                   }
                  return null;
                })()}

                  {/* Display Milestone and Task Timeline Bars */}
                  {useMemo(() => {
                    // Get all milestones from mockData + newly created milestones
                    const allMilestones = [...mockMilestones];
                    const createdMilestones = timelineItems.filter(item => item.type === 'milestone' && !mockMilestones.find(mockMilestone => mockMilestone.id === item.id));
                    const milestones = [...allMilestones, ...createdMilestones.map(createdMilestone => ({
                      id: createdMilestone.id,
                      name: createdMilestone.title,
                      description: '',
                      status: createdMilestone.status,
                      progress: createdMilestone.progress,
                      dueDate: createdMilestone.dueDate || createdMilestone.startDate,
                      tasks: []
                    }))];
                    
                    // Get same-level tasks (tasks without milestoneId)
                    const sameLevelTasks = timelineItems.filter(item => item.type === 'task' && !item.milestoneId);
                   
                    // console.log('🎯 Timeline milestones for display:', milestones);
                    // console.log('🎯 Timeline same-level tasks:', sameLevelTasks);
                   
                   return (
                     <>
                       {/* Render milestone timeline bars */}
                       {milestones.map((milestone, milestoneIndex) => {
                     // Use custom position if available, otherwise use original dates
                     const customPosition = milestonePositions[milestone.id];
                     const dueDate = customPosition ? customPosition.dueDate : (milestone as any).dueDate;
                     const milestonePosition = calculateBarPosition(dueDate, dueDate);
                     return (
                       <React.Fragment key={`timeline-milestone-${milestone.id}-${milestoneIndex}`}>
                         {/* Milestone Timeline Flag */}
                         <div className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${milestoneIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${dragOverMilestone === milestone.id ? 'bg-blue-50 border-blue-200' : ''}`}
                               onDragOver={(e) => handleMilestoneDragOver(e, milestone.id)}
                               onDrop={(e) => handleMilestoneDrop(e, milestone.id)}
                               onDragLeave={() => setDragOverMilestone(null)}>
                           <div className="absolute top-2 left-0 h-8" style={{ width: `${timelineDates.length * 64}px` }}>
                             {/* Milestone Flag */}
                             <div 
                               className="absolute h-8 cursor-move z-10"
                               style={{
                                 left: `${milestonePosition.left}%`,
                                 willChange: 'transform, left',
                                 transform: 'translateZ(0)' // Force hardware acceleration
                               }}
                               onMouseDown={(e) => {
                                 e.stopPropagation();
                                 // console.log(`🖱️ Milestone Mouse Down: ${milestone.id}, Position: ${milestonePosition.left}%, ClientX: ${e.clientX}, Target: ${e.target}`);
                                 handleDragStart(e, milestone.id, dueDate, dueDate, 'move');
                               }}
                               title={`${milestone.name || (milestone as any).title}\n📅 ${new Date(dueDate).toLocaleDateString('vi-VN')}`}
                             >
                                  {/* Flag Icon */}
                                  <div className={`w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center ml-5 transition-all duration-500 ease-out ${draggedItem === milestone.id ? 'scale-110 shadow-2xl bg-gradient-to-br from-orange-400 to-orange-600 ring-3 ring-orange-300 ring-opacity-50' : 'hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-orange-400 hover:to-orange-600 hover:ring-2 hover:ring-orange-200 hover:ring-opacity-60'}`}>
                                    <svg className={`w-5 h-5 text-white mx-auto transition-all duration-500 ease-out ${draggedItem === milestone.id ? 'scale-110 drop-shadow-lg' : 'hover:scale-110 hover:drop-shadow-lg'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                  </div>
                             </div>
                           </div>
                         </div>

                         {/* Show child task timeline bars if milestone is expanded */}
                         {expandedMilestones.has(milestone.id) && (() => {
                           // Get tasks from both mockData and newly created tasks
                           const mockTasks = milestone.tasks || [];
                           const createdTasks = timelineItems.filter(task => task.type === 'task' && task.milestoneId === milestone.id);
                           
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
                           
                            // console.log(`🎯 Timeline Milestone ${milestone.id} tasks:`, { mockTasks, createdTasks, allTasks });
                           return allTasks.map((task, taskIndex) => {
                             // Use custom position if available, otherwise use original dates
                             const customPosition = taskPositions[task.id];
                             const startDate = customPosition ? customPosition.startDate : task.startDate;
                             const endDate = customPosition ? customPosition.endDate : task.endDate;
                             const taskPosition = calculateBarPosition(startDate, endDate);
                             return (
                                <div 
                                  key={`${milestone.id}-timeline-task-${task.id}-${taskIndex}`} 
                                  className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors relative bg-gray-25 ${dragOverTask === task.id ? 'bg-blue-50 border-blue-200' : ''}`}
                                  onDragOver={(e) => handleTaskDragOver(e, task.id)}
                                  onDrop={(e) => handleTaskDrop(e, task.id)}
                                  onDragLeave={() => setDragOverTask(null)}
                                >
                                  <div className="absolute top-2 left-0 h-8" style={{ width: `${timelineDates.length * 64}px` }}>
                                   <div 
                                     className={`absolute h-8 rounded-md cursor-move group transition-all duration-300 ease-in-out ${draggedItem === task.id ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-xl z-30' : 'hover:shadow-lg z-10'}`}
                                     style={{
                                       left: `${taskPosition.left}%`,
                                       width: `${taskPosition.width}%`,
                                       minWidth: '16px',
                                       backgroundColor: '#f97316', // Orange for task
                                       border: '1px solid rgba(255,255,255,0.3)',
                                       zIndex: draggedItem === task.id ? 30 : 10,
                                       willChange: draggedItem === task.id ? 'transform, left, width' : 'auto',
                                       transform: 'translateZ(0)' // Force hardware acceleration
                                     }}
                                     onMouseDown={(e) => {
                                       e.stopPropagation();
                                       // console.log(`🖱️ Task Mouse Down: ${task.id}, Position: ${taskPosition.left}%, Width: ${taskPosition.width}%, ClientX: ${e.clientX}, Target: ${e.target}`);
                                       handleDragStart(e, task.id, startDate, endDate, 'move');
                                     }}
                                     title={`${task.title}\n📅 ${new Date(task.startDate).toLocaleDateString('vi-VN')} - ${new Date(task.endDate).toLocaleDateString('vi-VN')}`}
                                   >
                                     {/* Resize handles */}
                                     <div 
                                       className="absolute left-0 top-0 w-3 h-full cursor-ew-resize z-20 hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-500 hover:bg-opacity-60 hover:shadow-lg transition-all duration-300 ease-in-out rounded-l-md opacity-0 group-hover:opacity-100"
                                       onMouseDown={(e) => {
                                         e.stopPropagation();
                                         handleDragStart(e, task.id, startDate, endDate, 'resize-start');
                                       }}
                                       title="Drag to resize start date"
                                     />
                                     <div 
                                       className="absolute right-0 top-0 w-3 h-full cursor-ew-resize z-20 hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-500 hover:bg-opacity-60 hover:shadow-lg transition-all duration-300 ease-in-out rounded-r-md opacity-0 group-hover:opacity-100"
                                       onMouseDown={(e) => {
                                         e.stopPropagation();
                                         handleDragStart(e, task.id, startDate, endDate, 'resize-end');
                                       }}
                                       title="Drag to resize end date"
                                     />
                                     
                                     {/* Task content */}
                                     <div 
                                       className="h-full bg-orange-300 bg-opacity-40 rounded-md flex items-center px-2 z-10 cursor-move hover:bg-opacity-60 transition-all duration-300 ease-in-out group-hover:bg-opacity-70"
                                       onDoubleClick={(e) => {
                                         e.stopPropagation();
                                         handleOpenEditModal(task, 'task', milestone.name || (milestone as any).title);
                                       }}
                                       title={`${new Date((task as any).startDate).toLocaleDateString('vi-VN')} - ${new Date((task as any).endDate).toLocaleDateString('vi-VN')}`}
                                     >
                                       <span className="text-xs text-white font-medium truncate transition-all duration-300 group-hover:text-orange-100">
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
                  })}
                  
                   {/* Render same-level task timeline bars */}
                   {sameLevelTasks.map((task, taskIndex) => {
                    // Use custom position if available, otherwise use original dates
                    const customPosition = taskPositions[task.id];
                    const startDate = customPosition ? customPosition.startDate : task.startDate;
                    const endDate = customPosition ? customPosition.endDate : task.endDate;
                    const taskPosition = calculateBarPosition(startDate, endDate);
                    
                    return (
                       <div 
                         key={`same-level-timeline-task-${task.id}-${taskIndex}`} 
                         className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${(milestones.length + taskIndex) % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${dragOverTask === task.id ? 'bg-blue-50 border-blue-200' : ''}`}
                         onDragOver={(e) => handleTaskDragOver(e, task.id)}
                         onDrop={(e) => handleTaskDrop(e, task.id)}
                         onDragLeave={() => setDragOverTask(null)}
                       >
                         <div className="absolute top-2 left-0 h-8" style={{ width: `${timelineDates.length * 64}px` }}>
                          <div 
                            className={`absolute h-8 rounded-md cursor-move group transition-all duration-300 ease-in-out ${draggedItem === task.id ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-xl z-30' : 'hover:shadow-lg z-10'}`}
                            style={{
                              left: `${taskPosition.left}%`,
                              width: `${taskPosition.width}%`,
                              minWidth: '16px',
                              backgroundColor: '#f97316', // Orange for same-level task (same as milestone tasks)
                              border: '1px solid rgba(255,255,255,0.3)',
                              zIndex: draggedItem === task.id ? 30 : 10,
                              willChange: draggedItem === task.id ? 'transform, left, width' : 'auto',
                              transform: 'translateZ(0)' // Force hardware acceleration
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              // console.log(`🖱️ Same-level Task Mouse Down: ${task.id}, Position: ${taskPosition.left}%, Width: ${taskPosition.width}%, ClientX: ${e.clientX}, Target: ${e.target}`);
                              handleDragStart(e, task.id, startDate, endDate, 'move');
                            }}
                            title={`${task.title}\n📅 ${new Date(task.startDate).toLocaleDateString('vi-VN')} - ${new Date(task.endDate).toLocaleDateString('vi-VN')}`}
                          >
                            {/* Resize handles */}
                            <div 
                              className="absolute left-0 top-0 w-3 h-full cursor-ew-resize z-20 hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-500 hover:bg-opacity-60 hover:shadow-lg transition-all duration-300 ease-in-out rounded-l-md opacity-0 group-hover:opacity-100"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleDragStart(e, task.id, startDate, endDate, 'resize-start');
                              }}
                              title="Drag to resize start date"
                            />
                            <div 
                              className="absolute right-0 top-0 w-3 h-full cursor-ew-resize z-20 hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-500 hover:bg-opacity-60 hover:shadow-lg transition-all duration-300 ease-in-out rounded-r-md opacity-0 group-hover:opacity-100"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleDragStart(e, task.id, startDate, endDate, 'resize-end');
                              }}
                              title="Drag to resize end date"
                            />
                            
                            {/* Task content */}
                            <div 
                              className="h-full bg-orange-300 bg-opacity-40 rounded-md flex items-center px-2 z-10 cursor-move hover:bg-opacity-60 transition-all duration-300 ease-in-out group-hover:bg-opacity-70"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(task, 'task');
                              }}
                              title={`${new Date(task.startDate).toLocaleDateString('vi-VN')} - ${new Date(task.endDate).toLocaleDateString('vi-VN')}`}
                            >
                              <span className="text-xs text-white font-medium truncate transition-all duration-300 group-hover:text-orange-100">
                                {task.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                     );
                   })}
                     </>
                   );
                 }, [timelineItems, expandedMilestones, milestonePositions, taskPositions, draggedItem, dragOverMilestone, dragOverTask])}

                  {/* Add Milestone Row - Empty Timeline */}
                  <div className="h-12 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                    <div className="h-full flex items-center px-2">
                      <div className="text-sm text-gray-500 italic">Timeline sẽ hiển thị khi có milestone</div>
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
        itemType={modalItemType as 'milestone' | 'task'}
        epicTitle={selectedEpicForTask?.title || selectedItem?.milestoneTitle}
        mode={modalMode}
        milestones={(() => {
          // Get all milestones from mockData + newly created milestones
          const allMilestones = [...mockMilestones];
          const createdMilestones = timelineItems.filter(item => item.type === 'milestone' && !mockMilestones.find(mockMilestone => mockMilestone.id === item.id));
          const milestones = [...allMilestones, ...createdMilestones.map(createdMilestone => ({
            id: createdMilestone.id,
            name: createdMilestone.title
          }))];
          return milestones.map((milestone: any) => ({
            id: milestone.id,
            name: milestone.name
          }));
        })()}
        assignees={[
          { id: '1', name: 'Phuoc Loc' },
          { id: '2', name: 'Quang Long' },
          { id: '3', name: 'Minh Duc' },
          { id: '4', name: 'Van Anh' }
        ]}
      />
    </div>
  );
};

