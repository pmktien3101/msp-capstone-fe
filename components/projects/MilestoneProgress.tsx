"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { TaskStatus } from "@/constants/status";
import { MilestoneBackend } from "@/types/milestone";
import { GetTaskResponse } from "@/types/task";
import { milestoneService } from "@/services/milestoneService";
import { taskService } from "@/services/taskService";
import "@/app/styles/milestone-progress.scss";
import { formatDate } from "@/lib/formatDate";

interface MilestoneProgressProps {
  project: Project;
}

interface MilestoneWithProgress extends MilestoneBackend {
  progress: number;
  status: string;
  totalTasks: number;
  completedTasks: number;
  // 4 main categories for progress bar
  doneCount: number;
  inProgressCount: number;
  readyToReviewCount: number;
  todoCount: number;
  // Detailed breakdown for tooltip
  statusCounts?: {
    done: number;
    inProgress: number;
    readyToReview: number;
    reopened: number;
    todo: number;
  };
}

export const MilestoneProgress = ({ project }: MilestoneProgressProps) => {
  const [milestones, setMilestones] = useState<MilestoneWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch milestones and tasks from API
  useEffect(() => {
    const fetchData = async () => {
      if (!project?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // First, fetch all milestones
        const milestonesRes = await milestoneService.getMilestonesByProjectId(project.id);

        if (milestonesRes.success && milestonesRes.data) {
          const milestonesData = milestonesRes.data;

          // For each milestone, fetch its tasks using the dedicated API
          const milestonesWithProgress = await Promise.all(
            milestonesData.map(async (milestone) => {
              // Fetch tasks for this specific milestone
              const tasksRes = await taskService.getTasksByMilestoneId(milestone.id);
              const milestoneTasks = tasksRes.success && tasksRes.data ? tasksRes.data : [];

            // Group tasks into 4 main categories for progress bar
            // Use both enum and string comparison for safety
            const doneCount = milestoneTasks.filter(t => 
              t.status === TaskStatus.Done || t.status === 'Done'
            ).length;
            
            // In Progress includes: InProgress and ReOpened only
            const inProgressCount = milestoneTasks.filter(t => 
              t.status === TaskStatus.InProgress || t.status === 'InProgress' ||
              t.status === TaskStatus.ReOpened || t.status === 'ReOpened'
            ).length;
            
            // Ready to Review as separate category
            const readyToReviewCount = milestoneTasks.filter(t => 
              t.status === TaskStatus.ReadyToReview || t.status === 'ReadyToReview'
            ).length;
            
            const todoCount = milestoneTasks.filter(t => 
              t.status === TaskStatus.Todo || t.status === 'Todo'
            ).length;

            // Total tasks excluding Cancelled (only count tasks displayed in progress bar)
            const totalTasks = doneCount + inProgressCount + readyToReviewCount + todoCount;
            const completedTasks = doneCount;

            // Status weights for progress calculation
            const statusWeights: Record<string, number> = {
              [TaskStatus.Todo]: 0,
              [TaskStatus.InProgress]: 0.5,
              [TaskStatus.ReadyToReview]: 0.75,
              [TaskStatus.Done]: 1.0,
              [TaskStatus.ReOpened]: 0.3,
              [TaskStatus.Cancelled]: 0, // Not counted towards progress (not displayed)
            };

            // Calculate weighted progress (only for non-cancelled tasks)
            let totalWeight = 0;
            milestoneTasks.forEach((task) => {
              if (task.status !== TaskStatus.Cancelled && task.status !== 'Cancelled') {
                totalWeight += statusWeights[task.status] || 0;
              }
            });

            const progress = totalTasks > 0 
              ? Math.round((totalWeight / totalTasks) * 100) 
              : 0;

            // Keep detailed breakdown for tooltip
            const statusCounts = {
              done: doneCount,
              inProgress: milestoneTasks.filter(t => 
                t.status === TaskStatus.InProgress || t.status === 'InProgress'
              ).length,
              readyToReview: milestoneTasks.filter(t => 
                t.status === TaskStatus.ReadyToReview || t.status === 'ReadyToReview'
              ).length,
              reopened: milestoneTasks.filter(t => 
                t.status === TaskStatus.ReOpened || t.status === 'ReOpened'
              ).length,
              todo: todoCount,
            };

            // Determine status based on progress and due date
            let status = 'pending';
            const today = new Date();
            const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null;

            if (progress === 100) {
              status = 'completed';
            } else if (dueDate && dueDate < today && progress < 100) {
              status = 'overdue';
            } else if (progress > 0) {
              status = 'in-progress';
            }

            return {
              ...milestone,
              progress,
              status,
              totalTasks,
              completedTasks,
              doneCount,
              inProgressCount,
              readyToReviewCount,
              todoCount,
              statusCounts
            };
          })
        );

          setMilestones(milestonesWithProgress);
        } else {
          setMilestones([]);
        }
      } catch (error) {
        console.error('[MilestoneProgress] Error fetching data:', error);
        setMilestones([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [project?.id]);

  // Check if project exists
  if (!project) {
    return (
      <div className="milestone-progress">
        <div className="section-header">
          <div className="milestone-section-title">
            <h3>Milestone Progress</h3>
            <p>Track the completion progress of project milestones.</p>
          </div>
        </div>
        <div className="no-data-message">
          <p>No project information</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="milestone-progress">
        <div className="milestone-section-header">
          <div className="milestone-section-title">
            <h3>Milestone Progress</h3>
            <p>Track the completion progress of project milestones.</p>
          </div>
        </div>
        <div className="milestones-list">
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="milestone-progress">
      <div className="milestone-section-header">
        <div className="milestone-section-title">
          <h3>Milestone Progress</h3>
          <p>View the progress of key milestones in the project.</p>
        </div>
        <a 
          href="#" 
          className="view-all-link"
          onClick={(e) => {
            e.preventDefault();
            // Navigate to list tab
            const event = new CustomEvent('navigateToTab', { detail: { tab: 'milestones' } });
            window.dispatchEvent(event);
          }}
        >
          View all
        </a>
      </div>

      {/* Progress Legend */}
      <div className="progress-legend">
        <div className="legend-item">
          <span className="legend-color done"></span>
          <span className="legend-label">Done</span>
        </div>
        <div className="legend-item">
          <span className="legend-color ready-to-review"></span>
          <span className="legend-label">Ready to Review</span>
        </div>
        <div className="legend-item">
          <span className="legend-color in-progress"></span>
          <span className="legend-label">In Progress</span>
        </div>
        <div className="legend-item">
          <span className="legend-color todo"></span>
          <span className="legend-label">To do</span>
        </div>
      </div>

      <div className="milestones-list">
        {milestones.length === 0 ? (
          <div className="no-milestones-message">
            <p>No milestones created yet</p>
          </div>
        ) : (
          milestones.map((milestone) => (
            <div key={milestone.id} className="milestone-item">
            <div className="milestone-header">
              <div className="milestone-info">
                <h4 className="milestone-title">{milestone.name}</h4>
              </div>
            </div>

            <div className="milestone-progress-bar">
              <div className="progress-container">
                {/* Simplified 3-segment progress bar */}
                {milestone.totalTasks > 0 ? (
                  <>
                    {/* Done segment (green) */}
                    {milestone.doneCount > 0 && (() => {
                      const percentage = Math.round((milestone.doneCount / milestone.totalTasks) * 100);
                      return (
                        <div
                          className="progress-segment done"
                          style={{ 
                            width: `${percentage}%` 
                          }}
                          title={`Done: ${milestone.doneCount} task${milestone.doneCount > 1 ? 's' : ''}`}
                        >
                          {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                        </div>
                      );
                    })()}
                    {/* Ready to Review segment (purple) */}
                    {milestone.readyToReviewCount > 0 && (() => {
                      const percentage = Math.round((milestone.readyToReviewCount / milestone.totalTasks) * 100);
                      return (
                        <div
                          className="progress-segment ready-to-review"
                          style={{ 
                            width: `${percentage}%` 
                          }}
                          title={`Ready to Review: ${milestone.readyToReviewCount} task${milestone.readyToReviewCount > 1 ? 's' : ''}`}
                        >
                          {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                        </div>
                      );
                    })()}
                    {/* In Progress segment (blue) - includes InProgress and ReOpened */}
                    {milestone.inProgressCount > 0 && (() => {
                      const percentage = Math.round((milestone.inProgressCount / milestone.totalTasks) * 100);
                      return (
                        <div
                          className="progress-segment in-progress"
                          style={{ 
                            width: `${percentage}%` 
                          }}
                          title={`In Progress: ${milestone.inProgressCount} task${milestone.inProgressCount > 1 ? 's' : ''} (InProgress: ${milestone.statusCounts?.inProgress || 0}, ReOpened: ${milestone.statusCounts?.reopened || 0})`}
                        >
                          {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                        </div>
                      );
                    })()}
                    {/* Todo segment (gray) */}
                    {milestone.todoCount > 0 && (() => {
                      const percentage = Math.round((milestone.todoCount / milestone.totalTasks) * 100);
                      return (
                        <div
                          className="progress-segment todo"
                          style={{ 
                            width: `${percentage}%` 
                          }}
                          title={`To Do: ${milestone.todoCount} task${milestone.todoCount > 1 ? 's' : ''}`}
                        >
                          {percentage >= 10 && <span className="segment-percentage">{percentage}%</span>}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="progress-segment empty" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>No tasks yet</span>
                  </div>
                )}
              </div>
            </div>

            <div className="milestone-details">
              <div className="milestone-due-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 10H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  Due: {formatDate(milestone.dueDate)}
                </span>
              </div>
              <div className="milestone-tasks">
                <span>
                  {milestone.totalTasks} tasks 
                </span>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};
