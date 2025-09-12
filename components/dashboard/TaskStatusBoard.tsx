'use client';

import { Task } from '@/types/milestone';
import { Project } from '@/types/project';

interface TaskStatusBoardProps {
  tasks: Task[];
  selectedProject: Project | null;
  onCreateTask: () => void;
}

export default function TaskStatusBoard({ tasks, selectedProject, onCreateTask }: TaskStatusBoardProps) {
  // Mock data - trong thực tế sẽ lấy từ API với projectId
  const tasksWithProject = tasks.map(task => ({
    ...task,
    projectId: task.id === 1 ? '1' : task.id === 2 ? '2' : '1' // Mock project assignment
  }));

  const filteredTasks = tasksWithProject.filter(task => 
    !selectedProject || task.projectId === selectedProject.id
  );

  const todoTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const doneTasks = filteredTasks.filter(task => task.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#FF5E13';
      case 'medium':
        return '#FFA463';
      default:
        return '#64748B';
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(date));
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className={`task-card ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
      <div className="task-header">
        <h5 className="task-title">{task.name}</h5>
        <span 
          className="priority-badge"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
      </div>
      
      {task.assignedTo && (
        <div className="task-assignee">
          <img 
            src={task.assignedTo.avatar} 
            alt={task.assignedTo.name}
            className="assignee-avatar"
          />
          <span className="assignee-name">{task.assignedTo.name}</span>
        </div>
      )}

      <div className="task-footer">
        <span className={`task-due-date ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
          {formatDate(task.dueDate)}
        </span>
        {isOverdue(task.dueDate, task.status) && (
          <span className="overdue-indicator">Trễ hạn</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="task-status-board">
      <div className="section-header">
        <h3>Task Status</h3>
        <button 
          className="create-task-btn"
          onClick={onCreateTask}
          title="Tạo task mới"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="kanban-board">
        <div className="kanban-column">
          <div className="column-header">
            <h4>To Do</h4>
            <span className="task-count">{todoTasks.length}</span>
          </div>
          <div className="column-content">
            {todoTasks.length === 0 ? (
              <div className="empty-column">
                <p>Không có task</p>
              </div>
            ) : (
              todoTasks.slice(0, 3).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
            {todoTasks.length > 3 && (
              <div className="more-tasks">
                +{todoTasks.length - 3} tasks khác
              </div>
            )}
          </div>
        </div>

        <div className="kanban-column">
          <div className="column-header">
            <h4>In Progress</h4>
            <span className="task-count">{inProgressTasks.length}</span>
          </div>
          <div className="column-content">
            {inProgressTasks.length === 0 ? (
              <div className="empty-column">
                <p>Không có task</p>
              </div>
            ) : (
              inProgressTasks.slice(0, 3).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
            {inProgressTasks.length > 3 && (
              <div className="more-tasks">
                +{inProgressTasks.length - 3} tasks khác
              </div>
            )}
          </div>
        </div>

        <div className="kanban-column">
          <div className="column-header">
            <h4>Done</h4>
            <span className="task-count">{doneTasks.length}</span>
          </div>
          <div className="column-content">
            {doneTasks.length === 0 ? (
              <div className="empty-column">
                <p>Không có task</p>
              </div>
            ) : (
              doneTasks.slice(0, 3).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
            {doneTasks.length > 3 && (
              <div className="more-tasks">
                +{doneTasks.length - 3} tasks khác
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
