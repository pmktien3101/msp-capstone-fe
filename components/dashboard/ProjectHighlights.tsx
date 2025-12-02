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
import '@/app/styles/project-highlights.scss';

interface ProjectHighlightsProps {
  projects: Project[];
  tasks: any[];
  milestones: any[];
}

export const ProjectHighlights = ({ projects, tasks, milestones }: ProjectHighlightsProps) => {
  const router = useRouter();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set([]));

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
  // Calculate priority projects (in-progress projects with nearest endDate)
  const getPriorityProjects = () => {
    return projects
      .filter(project => project.status === ProjectStatus.InProgress) // Only get in-progress projects
      .sort((a, b) => {
        if (!a.endDate || !b.endDate) return 0;
        const aEndDate = new Date(a.endDate);
        const bEndDate = new Date(b.endDate);
        return aEndDate.getTime() - bEndDate.getTime(); // Sort by nearest endDate
      })
      .slice(0, 3); // Get top 3 projects with nearest endDate
  };

  // Top 3 important milestones coming due
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

  // Tasks ready to review and in progress
  const getTasksByStatus = () => {
    // Filter tasks ready to review
    const onHoldTasks = tasks.filter((task: any) => 
      task.status === TaskStatus.ReadyToReview
    );

    // Filter in-progress tasks and sort by nearest endDate
    const inProgressTasks = tasks
      .filter((task: any) => task.status === TaskStatus.InProgress)
      .sort((a: any, b: any) => {
        if (!a.endDate || !b.endDate) return 0;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      })
      .slice(0, 3); // Only get 3 tasks

    return {
      onHold: onHoldTasks.slice(0, 5),
      inProgress: inProgressTasks
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
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      default: return 'Medium';
    }
  };

  return (
    <div className="project-highlights">
      {/* Header */}
      <div className="pm-highlights-section-header">
        <h2>Projects Being Tracked</h2>
        <p>Priority projects and important milestones</p>
      </div>

      <div className="highlights-grid">
        {/* Priority Projects */}
        <div className="highlight-card">
          <div className="card-header" onClick={() => toggleCard('priority')}>
            <div className="card-title">
              <AlertTriangle size={20} />
              <h3>Priority Projects (In Progress)</h3>
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
                <p>No priority projects</p>
              </div>
            ) : (
              priorityProjects.map(project => {
                const priority = getPriorityLevel(project);
                if (!project.endDate) return null;
                const endDate = new Date(project.endDate);
                const daysUntilDeadline = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                // Calculate progress from tasks
                const projectTasks = tasks.filter((task: any) => task.projectId === project.id);
                const completedTasks = projectTasks.filter((task: any) => task.status === TaskStatus.Done).length;
                const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
                
                return (
                  <div key={project.id} className="priority-item" onClick={() => handleProjectClick(project.id)}>
                    <div className="priority-indicator" style={{ backgroundColor: '#f59e0b' }} />
                    <div className="item-content">
                      <h4>{project.name}</h4>
                      <div className="item-details">
                        <span className="deadline">
                          <Calendar size={14} />
                          {daysUntilDeadline > 0 ? `${daysUntilDeadline} ${daysUntilDeadline === 1 ? 'day' : 'days'} left` : 'Overdue'}
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
              <h3>Upcoming Milestones</h3>
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
                <p>No upcoming milestones</p>
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
                      <span>{daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ready To Review Tasks */}
        <div className="highlight-card">
          <div className="card-header" onClick={() => toggleCard('onHold')}>
            <div className="card-title">
              <AlertTriangle size={20} />
              <h3>Ready To Review Tasks</h3>
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
                <p>No tasks ready to review</p>
              </div>
            ) : (
              onHold.map((task: any) => {
                const project = projects.find((p: any) => p.id === task.projectId);
                return (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <h4>{task.title || task.name}</h4>
                      <div className="task-meta">
                        <p className="assignee">{task.user?.fullName || 'Unassigned'}</p>
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
                      <span>{TASK_STATUS_LABELS[TaskStatus.ReadyToReview]}</span>
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
              <h3>In Progress Tasks (Top 3 by Deadline)</h3>
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
                <p>No tasks in progress</p>
              </div>
            ) : (
              inProgress.map((task: any) => {
                const project = projects.find((p: any) => p.id === task.projectId);
                const endDate = task.endDate ? new Date(task.endDate) : null;
                const daysUntilDeadline = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                
                return (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <h4>{task.title || task.name}</h4>
                      <div className="task-meta">
                        <p className="assignee">{task.user?.fullName || 'Unassigned'}</p>
                        <p 
                          className="project project-link"
                          onClick={() => project && handleProjectClick(project.id)}
                        >
                          {task.projectName || project?.name}
                        </p>
                        {daysUntilDeadline !== null && (
                          <p className="deadline-info">
                            <Calendar size={12} />
                            {daysUntilDeadline > 0 
                              ? `${daysUntilDeadline} ${daysUntilDeadline === 1 ? 'day' : 'days'} left` 
                              : 'Overdue'}
                          </p>
                        )}
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
    </div>
  );
};

