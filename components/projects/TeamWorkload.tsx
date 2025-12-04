'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { GetTaskResponse } from '@/types/task';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { normalizeRole, UserRole } from '@/lib/rbac';

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
          // Normalize member list to a simple shape: { id: string, name, email, role }
          const transformedMembers = (membersRes.data || [])
            .map((pm: any) => (pm.member || pm))
            .filter((src: any) => src && (src.id || src.userId))
            .map((src: any) => {
              const roleRaw = src.role || src.roleName || '';
              const normalizedRole = normalizeRole(roleRaw);
              return {
                id: src.id ? src.id.toString() : (src.userId ? src.userId.toString() : ''),
                name: src.fullName || src.name || src.email || 'Unknown',
                email: src.email || '',
                role: normalizedRole
              };
            })
            // Keep only users with Member role
            .filter((m: any) => m.role === UserRole.MEMBER);

          setMembers(transformedMembers);
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
    
    if (!name) return gradients[0];
    let hash = 0;
    const safeName = String(name);
    for (let i = 0; i < safeName.length; i++) {
      hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
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

  // Calculate workload by user — include all project members (even if they have 0 tasks)
  const assigneeCounts: Record<string, number> = {};
  const assigneeMap: Record<string, any> = {}; // Map userId to user info

  // Initialize counts for every project member (members state contains normalized members)
  members.forEach((m) => {
    if (m && m.id) {
      assigneeCounts[m.id] = 0;
      assigneeMap[m.id] = { fullName: m.name, email: m.email, role: m.role };
    }
  });

  // Count tasks per assignee (prefer task.userId, fallback to task.user?.id)
  tasks.forEach(task => {
    const assignedId = task.userId ? task.userId.toString() : (task.user && task.user.id ? task.user.id.toString() : null);
    if (assignedId) {
      if (assigneeCounts.hasOwnProperty(assignedId)) {
        assigneeCounts[assignedId] = (assigneeCounts[assignedId] || 0) + 1;
      } else {
        // Task assigned to a user not in the project members list — include them too
        assigneeCounts[assignedId] = (assigneeCounts[assignedId] || 0) + 1;
        assigneeMap[assignedId] = task.user || { fullName: assignedId };
      }
    } else {
      // Unassigned tasks
      assigneeCounts['unassigned'] = (assigneeCounts['unassigned'] || 0) + 1;
    }
  });

  const totalTasks = tasks.length;

  // Build workload data — ensure all members are present (even zero tasks), then include any other assignees and unassigned bucket
  const workloadEntries: Array<{ assignee: string; taskCount: number; color?: string; gradient?: string | null; avatar?: string | null } > = [];

  // Members first
  members.forEach((m) => {
    const count = assigneeCounts[m.id] || 0;
    workloadEntries.push({
      assignee: m.name,
      taskCount: count,
      color: '#fb923c',
      gradient: getAvatarColor(m.name),
      avatar: m.name ? m.name.charAt(0).toUpperCase() : null
    });
  });

  // Other assignees not in members
  Object.keys(assigneeCounts).forEach((userId) => {
    if (userId === 'unassigned') return;
    if (members.find((m) => m.id === userId)) return; // already added
    const user = assigneeMap[userId];
    const fullName = user?.fullName || user?.name || userId;
    workloadEntries.push({
      assignee: fullName,
      taskCount: assigneeCounts[userId] || 0,
      color: '#fb923c',
      gradient: getAvatarColor(fullName),
      avatar: fullName ? String(fullName).charAt(0).toUpperCase() : null
    });
  });

  // Unassigned bucket
  if (assigneeCounts['unassigned']) {
    workloadEntries.push({
      assignee: 'Unassigned',
      taskCount: assigneeCounts['unassigned'] || 0,
      color: '#6b7280',
      gradient: null,
      avatar: null
    });
  }

  const workloadData = workloadEntries
    .map(item => ({
      ...item,
      percentage: totalTasks > 0 ? Math.round((item.taskCount / totalTasks) * 100) : 0
    }))
    .sort((a, b) => b.taskCount - a.taskCount);

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