"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { TaskStatus } from "@/constants/status";
import { MilestoneBackend } from "@/types/milestone";
import { GetTaskResponse } from "@/types/task";
import { milestoneService } from "@/services/milestoneService";
import { taskService } from "@/services/taskService";

interface MilestoneProgressProps {
  project: Project;
}

interface MilestoneWithProgress extends MilestoneBackend {
  progress: number;
  status: string;
  totalTasks: number;
  completedTasks: number;
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
        const [milestonesRes, tasksRes] = await Promise.all([
          milestoneService.getMilestonesByProjectId(project.id),
          taskService.getTasksByProjectId(project.id)
        ]);

        if (milestonesRes.success && milestonesRes.data && tasksRes.success && tasksRes.data) {
          const milestonesData = milestonesRes.data;
          const tasksData = tasksRes.data.items || [];

          // Calculate progress for each milestone
          const milestonesWithProgress = milestonesData.map(milestone => {
            // Find tasks belonging to this milestone
            const milestoneTasks = tasksData.filter(task => 
              task.milestones && task.milestones.some(m => m.id === milestone.id)
            );

            const totalTasks = milestoneTasks.length;
            const completedTasks = milestoneTasks.filter(task => task.status === TaskStatus.Done).length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
              completedTasks
            };
          });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: 'rgba(16, 185, 129, 0.2)'
        };
      case "in-progress":
        return {
          background: 'rgba(251, 146, 60, 0.1)',
          color: '#fb923c',
          border: 'rgba(251, 146, 60, 0.2)'
        };
      case "pending":
        return {
          background: 'rgba(107, 114, 128, 0.1)',
          color: '#6b7280',
          border: 'rgba(107, 114, 128, 0.2)'
        };
      case "overdue":
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          border: 'rgba(239, 68, 68, 0.2)'
        };
      default:
        return {
          background: 'rgba(107, 114, 128, 0.1)',
          color: '#6b7280',
          border: 'rgba(107, 114, 128, 0.2)'
        };
    }
  };

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
            const event = new CustomEvent('navigateToTab', { detail: { tab: 'list' } });
            window.dispatchEvent(event);
          }}
        >
          View all
        </a>
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
                <p className="milestone-description">{milestone.description}</p>
              </div>
            </div>

            <div className="milestone-progress-bar">
              <div className="progress-container">
                <div
                  className="progress-fill"
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{milestone.progress}%</span>
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
                  Due: {new Date(milestone.dueDate).toLocaleDateString("en-US")}
                </span>
              </div>
              <div className="milestone-tasks">
                <span>
                  {milestone.completedTasks}/{milestone.totalTasks} {milestone.totalTasks === 1 ? 'task' : 'tasks'} completed
                </span>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      <style jsx>{`
        .milestone-progress {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .milestone-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .milestone-section-title h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .milestone-section-title p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .view-all-link {
          font-size: 13px;
          color: #fb923c;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #f97316;
        }

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .no-milestones-message {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
          font-size: 14px;
        }

        .no-milestones-message p {
          margin: 0;
        }

        .milestone-item {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .milestone-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #fb923c, #fbbf24);
        }

        .milestone-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .milestone-info {
          flex: 1;
        }

        .milestone-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .milestone-description {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }

        .milestone-status {
          flex-shrink: 0;
        }

        .status-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          background: rgba(251, 146, 60, 0.1);
          color: #fb923c;
          border: 1px solid rgba(251, 146, 60, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .milestone-progress-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .progress-container {
          flex: 1;
          height: 6px;
          background: #f1f5f9;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #fb923c, #fbbf24);
          border-radius: 6px;
          transition: width 0.3s ease;
          box-shadow: 0 1px 2px rgba(251, 146, 60, 0.3);
        }

        .progress-text {
          font-size: 11px;
          font-weight: 600;
          color: #fb923c;
          min-width: 35px;
          text-align: right;
        }

        .milestone-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 11px;
          color: #6b7280;
          padding: 8px 10px;
          background: rgba(251, 146, 60, 0.05);
          border-radius: 6px;
          border: 1px solid rgba(251, 146, 60, 0.1);
        }

        .milestone-due-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }


        @media (max-width: 768px) {
          .milestone-header {
            flex-direction: column;
            gap: 12px;
          }

          .milestone-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};
