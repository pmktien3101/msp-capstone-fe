'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { GetTaskResponse } from '@/types/task';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';

interface TeamWorkloadProps {
  project: Project;
}

export const TeamWorkload = ({ project }: TeamWorkloadProps) => {
  const [tasks, setTasks] = useState<GetTaskResponse[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks and members from API
  useEffect(() => {
    const fetchData = async () => {
      if (!project?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [tasksRes, membersRes] = await Promise.all([
          taskService.getTasksByProjectId(project.id),
          projectService.getProjectMembers(project.id)
        ]);

        if (tasksRes.success && tasksRes.data) {
          setTasks(tasksRes.data.items || []);
        } else {
          setTasks([]);
        }

        if (membersRes.success && membersRes.data) {
          setMembers(membersRes.data);
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error('[TeamWorkload] Error fetching data:', error);
        setTasks([]);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [project?.id]);

  // Generate consistent gradient color from name
  const getAvatarColor = (name: string): string => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Check if project exists
  if (!project) {
    return (
      <div className="team-workload">
        <div className="section-header">
          <div className="team-workload-section-title">
            <h3>Team Members</h3>
            <p>List of members and their assigned tasks.</p>
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
      <div className="team-workload">
        <div className="team-workload-section-header">
          <div className="team-workload-section-title">
            <h3>Team Members</h3>
            <p>List of members and their assigned tasks.</p>
          </div>
        </div>
        <div className="workload-content">
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  // Calculate workload by user
  const assigneeCounts: Record<string, number> = {};
  const assigneeMap: Record<string, any> = {}; // Map userId to user info
  
  tasks.forEach(task => {
    if (task.user && task.userId) {
      assigneeCounts[task.userId] = (assigneeCounts[task.userId] || 0) + 1;
      assigneeMap[task.userId] = task.user;
    } else {
      // Unassigned tasks
      assigneeCounts['unassigned'] = (assigneeCounts['unassigned'] || 0) + 1;
    }
  });

  const totalTasks = tasks.length;
  
  const workloadData = Object.entries(assigneeCounts).map(([userId, count]) => {
    if (userId === 'unassigned') {
      return {
        assignee: 'Unassigned',
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
        color: '#6b7280',
        gradient: null,
        avatar: null,
        taskCount: count
      };
    }

    const user = assigneeMap[userId];
    const fullName = user?.fullName || 'Unknown';
    return {
      assignee: fullName,
      percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
      color: '#fb923c',
      gradient: getAvatarColor(fullName),
      avatar: fullName.charAt(0).toUpperCase(),
      taskCount: count
    };
  }).sort((a, b) => b.taskCount - a.taskCount); // Sort by task count descending

  return (
    <div className="team-workload">
      <div className="team-workload-section-header">
        <div className="team-workload-section-title">
          <h3>Team Members</h3>
          <p>List of members and their assigned tasks.</p>
        </div>
      </div>

      <div className="workload-content">
        <div className="workload-chart">
          {workloadData.map((item, index) => (
            <div key={item.assignee} className="workload-item">
              <div className="workload-header">
                <div className="assignee-info">
                  {item.avatar ? (
                    <div className="assignee-avatar" style={{ background: item.gradient || item.color }}>
                      {item.avatar}
                    </div>
                  ) : (
                    <div className="assignee-placeholder">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <div className="assignee-details">
                    <span className="assignee-name">{item.assignee}</span>
                    <span className="assignee-tasks">{item.taskCount} {item.taskCount === 1 ? 'task' : 'tasks'}</span>
                  </div>
                </div>
                <span className="workload-percentage">{item.percentage}%</span>
              </div>
              <div className="workload-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="workload-summary">
          <div className="summary-item">
            <span className="summary-label">Total Members</span>
            <span className="summary-value">{workloadData.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Assigned Tasks</span>
            <span className="summary-value">{totalTasks - (assigneeCounts.unassigned || 0)}/{totalTasks}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .team-workload {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .team-workload-section-header {
          margin-bottom: 24px;
        }

        .team-workload-section-title h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .team-workload-section-title p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .workload-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .workload-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .workload-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .workload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .assignee-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .assignee-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
        }

        .assignee-placeholder {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .assignee-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .assignee-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .assignee-tasks {
          font-size: 11px;
          color: #6b7280;
        }

        .workload-percentage {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .workload-bar {
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .workload-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-label {
          font-size: 14px;
          color: #6b7280;
        }

        .summary-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .workload-content {
            gap: 20px;
          }

          .workload-chart {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};