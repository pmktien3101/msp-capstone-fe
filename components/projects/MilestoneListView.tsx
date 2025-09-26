"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { mockTasks, mockMembers, mockMilestones } from "@/constants/mockData";
import { useUser } from "@/hooks/useUser";
import { ListHeader } from "./ListHeader";
import {
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  CheckCircle2,
  Target,
  Edit,
  X,
  Trash2,
  Plus,
} from "lucide-react";

interface MilestoneListViewProps {
  project: Project;
}

interface MilestoneDetailPanelProps {
  milestone: any;
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  members: any[];
}

const MilestoneDetailPanel = ({ milestone, isOpen, onClose, tasks, members }: MilestoneDetailPanelProps) => {
  if (!isOpen) return null;

  const [editedMilestone, setEditedMilestone] = useState(milestone);
  const [editedTasks, setEditedTasks] = useState(tasks);

  const milestoneTasks = editedTasks.filter(task => 
    task.milestoneIds.includes(milestone.id)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#6b7280";
      case "in-progress":
        return "#f59e0b";
      case "review":
        return "#3b82f6";
      case "done":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "Cần làm";
      case "in-progress":
        return "Đang làm";
      case "review":
        return "Đang review";
      case "done":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : memberId;
  };

  const getMilestoneNames = (milestoneIds: string[]) => {
    return milestoneIds.map(id => {
      const milestone = mockMilestones.find(m => m.id === id);
      return milestone ? milestone.name : id;
    });
  };

  const calculateProgress = () => {
    if (milestoneTasks.length === 0) return 0;
    const completedTasks = milestoneTasks.filter(task => task.status === "done").length;
    return Math.round((completedTasks / milestoneTasks.length) * 100);
  };

  const progress = calculateProgress();

  const handleMilestoneFieldChange = (field: string, value: any) => {
    setEditedMilestone((prev: any) => ({
      ...prev,
      [field]: value
    }));
    // Auto-save on change
    console.log(`Updated milestone ${field}:`, value);
  };

  const handleTaskFieldChange = (taskId: string, field: string, value: any) => {
    setEditedTasks((prev: any) => 
      prev.map((task: any) => 
        task.id === taskId 
          ? { ...task, [field]: value }
          : task
      )
    );
    // Auto-save on change
    console.log(`Updated task ${taskId} ${field}:`, value);
  };

  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter') {
      callback();
    }
  };

  return (
    <div className="milestone-detail-overlay" onClick={onClose}>
      <div className="milestone-detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <div className="panel-title">
            <Target size={20} />
            <input
              type="text"
              value={editedMilestone.name}
              onChange={(e) => handleMilestoneFieldChange('name', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, () => console.log('Saved milestone name'))}
              className="milestone-name-input"
            />
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>


        <div className="panel-content">
          <div className="milestone-info">
            <textarea
              value={editedMilestone.description}
              onChange={(e) => handleMilestoneFieldChange('description', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, () => console.log('Saved milestone description'))}
              className="milestone-description-input"
              rows={3}
              placeholder="Mô tả cột mốc..."
            />
            <div className="milestone-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <input
                  type="date"
                  value={editedMilestone.dueDate}
                  onChange={(e) => handleMilestoneFieldChange('dueDate', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, () => console.log('Saved milestone due date'))}
                  className="due-date-input"
                />
              </div>
              <div className="meta-item">
                <CheckCircle size={16} />
                <span>{milestoneTasks.length} tasks</span>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Tiến độ</span>
              <span className="progress-percentage">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="tasks-section">
            <div className="tasks-header">
              <h4>Danh sách công việc</h4>
              <button className="add-task-btn" onClick={() => console.log('Add new task to milestone:', milestone.id)}>
                <Plus size={16} />
                Thêm công việc
              </button>
            </div>
            <div className="tasks-list">
              {milestoneTasks.length === 0 ? (
                <div className="empty-tasks-state">
                  <div className="empty-tasks-icon">
                    <Target size={48} />
                  </div>
                  <h4>Chưa có công việc nào</h4>
                  <p>Cột mốc này chưa có công việc nào được gán. Hãy thêm công việc để bắt đầu quản lý tiến độ.</p>
                  <button className="add-first-task-btn" onClick={() => console.log('Add first task to milestone:', milestone.id)}>
                    <Plus size={16} />
                    Thêm công việc đầu tiên
                  </button>
                </div>
              ) : (
                milestoneTasks.map((task) => {
                  const taskMilestoneNames = getMilestoneNames(task.milestoneIds);
                  const isMultiMilestone = task.milestoneIds.length > 1;
                  
                  return (
                    <div key={task.id} className="task-item-compact">
                      <div className="task-main-info">
                        <div className="task-id-compact">{task.id}</div>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleTaskFieldChange(task.id, 'title', e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, () => console.log(`Saved task ${task.id} title`))}
                          className="task-title-input-compact"
                          placeholder="Tên công việc..."
                        />
                        {isMultiMilestone && (
                          <div className="multi-milestone-badge-compact">
                            [{taskMilestoneNames.join(", ")}]
                          </div>
                        )}
                      </div>
                      
                      <div className="task-controls">
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskFieldChange(task.id, 'status', e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, () => console.log(`Saved task ${task.id} status`))}
                          className="status-select-compact"
                        >
                          <option value="todo">Cần làm</option>
                          <option value="in-progress">Đang làm</option>
                          <option value="review">Đang kiểm tra</option>
                          <option value="done">Hoàn thành</option>
                        </select>
                        
                        <select
                          value={task.assignee || ""}
                          onChange={(e) => handleTaskFieldChange(task.id, 'assignee', e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, () => console.log(`Saved task ${task.id} assignee`))}
                          className="assignee-select-compact"
                        >
                          <option value="">Chưa phân công</option>
                          {members.map(member => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="task-dates-compact">
                        <input
                          type="date"
                          value={task.startDate || ""}
                          onChange={(e) => handleTaskFieldChange(task.id, 'startDate', e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, () => console.log(`Saved task ${task.id} start date`))}
                          className="date-input-compact"
                          placeholder="Bắt đầu"
                        />
                        <input
                          type="date"
                          value={task.endDate || ""}
                          onChange={(e) => handleTaskFieldChange(task.id, 'endDate', e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, () => console.log(`Saved task ${task.id} end date`))}
                          className="date-input-compact"
                          placeholder="Kết thúc"
                        />
                      </div>
                      
                      <textarea
                        value={task.description}
                        onChange={(e) => handleTaskFieldChange(task.id, 'description', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => console.log(`Saved task ${task.id} description`))}
                        className="task-description-input-compact"
                        rows={1}
                        placeholder="Mô tả công việc..."
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .milestone-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .milestone-detail-panel {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 1000px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .panel-title h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .milestone-name-input {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          background: white;
          width: 100%;
          max-width: 500px;
          transition: border-color 0.2s ease;
        }

        .milestone-name-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }


        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }


        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .milestone-info {
          margin-bottom: 24px;
        }

        .milestone-description {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .milestone-description-input {
          width: 100%;
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 12px;
          background: white;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .milestone-description-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .due-date-input {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 6px 8px;
          background: white;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .due-date-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .milestone-meta {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #64748b;
        }

        .progress-section {
          margin-bottom: 24px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .progress-header span:first-child {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .progress-percentage {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 6px;
          transition: width 0.6s ease;
        }

        .tasks-section h4 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .tasks-header h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .add-task-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-task-btn:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-item-compact {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          transition: all 0.2s ease;
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 12px;
          align-items: start;
        }

        .task-item-compact:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .task-main-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .task-id-compact {
          font-size: 10px;
          color: #ff8c42;
          font-weight: 700;
          letter-spacing: 0.5px;
          min-width: 60px;
        }

        .task-title-input-compact {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 6px 8px;
          background: white;
          transition: border-color 0.2s ease;
        }

        .task-title-input-compact:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .multi-milestone-badge-compact {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          font-size: 9px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .task-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .status-select-compact, .assignee-select-compact {
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px 6px;
          background: white;
          font-size: 11px;
          font-weight: 600;
          min-width: 80px;
          transition: border-color 0.2s ease;
        }

        .status-select-compact:focus, .assignee-select-compact:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .task-dates-compact {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .date-input-compact {
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px 6px;
          background: white;
          font-size: 11px;
          min-width: 100px;
          transition: border-color 0.2s ease;
        }

        .date-input-compact:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .task-description-input-compact {
          grid-column: 1 / -1;
          width: 100%;
          font-size: 12px;
          color: #64748b;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 6px 8px;
          background: white;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .task-description-input-compact:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .empty-tasks-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          margin: 20px 0;
        }

        .empty-tasks-icon {
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .empty-tasks-state h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #475569;
        }

        .empty-tasks-state p {
          margin: 0 0 20px 0;
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
          max-width: 300px;
        }

        .add-first-task-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }

        .add-first-task-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .task-info {
          flex: 1;
        }

        .task-id {
          font-size: 12px;
          color: #ff8c42;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .task-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .multi-milestone-badge {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .task-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
        }

        .task-title-input, .task-description-input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          background: white;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .task-title-input {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .task-title-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .task-description-input {
          font-size: 14px;
          color: #64748b;
          resize: vertical;
        }

        .task-description-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .status-select, .assignee-select {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 6px 8px;
          background: white;
          font-size: 12px;
          font-weight: 600;
          min-width: 120px;
          transition: border-color 0.2s ease;
        }

        .status-select:focus, .assignee-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .date-inputs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .date-input {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 6px 8px;
          background: white;
          font-size: 12px;
          min-width: 120px;
          transition: border-color 0.2s ease;
        }

        .date-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .task-status {
          flex-shrink: 0;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
        }

        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #64748b;
        }

        .unassigned {
          color: #9ca3af;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .milestone-detail-panel {
            margin: 10px;
            max-width: calc(100vw - 20px);
            max-height: calc(100vh - 20px);
          }

          .panel-header {
            padding: 16px 20px;
          }

          .panel-content {
            padding: 20px;
          }

          .milestone-meta {
            flex-direction: column;
            gap: 12px;
          }

          .task-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .task-footer {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export const MilestoneListView = ({ project }: MilestoneListViewProps) => {
  const { role } = useUser();
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Get milestones for this project
  const projectMilestones = mockMilestones.filter(milestone => 
    milestone.projectId === project.id
  );

  // Filter milestones based on search and filters
  const filteredMilestones = projectMilestones.filter(milestone => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      milestone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || milestone.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort milestones
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'progress':
        comparison = calculateMilestoneProgress(a.id) - calculateMilestoneProgress(b.id);
        break;
      case 'taskCount':
        const aTaskCount = mockTasks.filter(task => task.milestoneIds.includes(a.id)).length;
        const bTaskCount = mockTasks.filter(task => task.milestoneIds.includes(b.id)).length;
        comparison = aTaskCount - bTaskCount;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "in-progress":
        return <Play size={16} />;
      case "completed":
        return <CheckCircle2 size={16} />;
      case "overdue":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#6b7280";
      case "in-progress":
        return "#f59e0b";
      case "completed":
        return "#10b981";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Kế hoạch";
      case "in-progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "overdue":
        return "Quá hạn";
      default:
        return status;
    }
  };

  const calculateMilestoneProgress = (milestoneId: string) => {
    const milestoneTasks = mockTasks.filter(task => 
      task.milestoneIds.includes(milestoneId)
    );
    if (milestoneTasks.length === 0) return 0;
    const completedTasks = milestoneTasks.filter(task => task.status === "done").length;
    return Math.round((completedTasks / milestoneTasks.length) * 100);
  };

  const getTaskCount = (milestoneId: string) => {
    const milestoneTasks = mockTasks.filter(task => 
      task.milestoneIds.includes(milestoneId)
    );
    const completedTasks = milestoneTasks.filter(task => task.status === "done").length;
    return `${milestoneTasks.length} công việc (${completedTasks} hoàn thành)`;
  };

  const handleMilestoneClick = (milestone: any) => {
    setSelectedMilestone(milestone);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedMilestone(null);
  };

  return (
    <div className="milestone-list-view">
      <ListHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <div className="milestone-table">
        <div className="table-header">
          <div className="col-milestone">Cột mốc</div>
          <div className="col-due-date">Ngày hết hạn</div>
          <div className="col-tasks">Công việc</div>
          <div className="col-progress">Tiến độ</div>
          <div className="col-status">Trạng thái</div>
          <div className="col-actions">Thao tác</div>
        </div>

        <div className="table-body">
          {sortedMilestones.map((milestone) => {
            const progress = calculateMilestoneProgress(milestone.id);
            const taskCount = getTaskCount(milestone.id);
            
            return (
              <div 
                key={milestone.id} 
                className="table-row"
                onClick={() => handleMilestoneClick(milestone)}
              >
                <div className="col-milestone">
                  <div className="milestone-details">
                    <div className="milestone-name">{milestone.name}</div>
                    <div className="milestone-description">{milestone.description}</div>
                  </div>
                </div>
                <div className="col-due-date">
                  <div className="due-date">
                    <Calendar size={16} />
                    <span>{new Date(milestone.dueDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="col-tasks">
                  <div className="task-count">{taskCount}</div>
                </div>
                <div className="col-progress">
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{progress}%</div>
                  </div>
                </div>
                <div className="col-status">
                  <div 
                    className="status-badge"
                    style={{
                      backgroundColor: `${getStatusColor(milestone.status)}20`,
                      color: getStatusColor(milestone.status),
                      borderColor: getStatusColor(milestone.status),
                    }}
                  >
                    {getStatusIcon(milestone.status)}
                    <span>{getStatusLabel(milestone.status)}</span>
                  </div>
                </div>
                <div className="col-actions">
                  <button 
                    className="delete-milestone-btn-row"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Delete milestone:', milestone.id);
                    }}
                    title="Xóa cột mốc"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMilestone && (
        <MilestoneDetailPanel
          milestone={selectedMilestone}
          isOpen={isDetailPanelOpen}
          onClose={handleCloseDetailPanel}
          tasks={mockTasks}
          members={mockMembers}
        />
      )}

      <style jsx>{`
        .milestone-list-view {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
          border-radius: 16px;
          overflow: hidden;
        }

        .milestone-table {
          flex: 1;
          overflow-y: auto;
          background: white;
        }

        .table-header {
          display: grid;
          grid-template-columns: 300px 120px 150px 120px 120px 60px;
          gap: 16px;
          padding: 16px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .table-body {
          display: flex;
          flex-direction: column;
        }

        .table-row {
          display: grid;
          grid-template-columns: 300px 120px 150px 120px 120px 60px;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: all 0.2s ease;
          align-items: center;
        }

        .table-row:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .milestone-details {
          flex: 1;
          min-width: 0;
        }

        .milestone-name {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 280px;
        }

        .milestone-description {
          font-size: 14px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 280px;
        }

        .due-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-count {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          min-width: 35px;
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100px;
        }

        .col-actions {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-milestone-btn-row {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fecaca;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.7;
        }

        .delete-milestone-btn-row:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          opacity: 1;
          transform: scale(1.05);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .table-header {
            display: none;
          }

          .table-row {
            padding: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 12px;
            background: white;
            position: relative;
          }

          .milestone-details {
            margin-bottom: 12px;
          }

          .col-due-date,
          .col-tasks,
          .col-progress,
          .col-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-top: 1px solid #f1f5f9;
          }

          .col-due-date::before {
            content: "Ngày hết hạn:";
            font-weight: 600;
            color: #374151;
          }

          .col-tasks::before {
            content: "Công việc:";
            font-weight: 600;
            color: #374151;
          }

          .col-progress::before {
            content: "Tiến độ:";
            font-weight: 600;
            color: #374151;
          }

          .col-status::before {
            content: "Trạng thái:";
            font-weight: 600;
            color: #374151;
          }

          .col-actions {
            position: absolute;
            top: 16px;
            right: 16px;
          }
        }

        @media (max-width: 768px) {
          .milestone-name-input {
            font-size: 18px;
            max-width: 300px;
          }

          .task-item-compact {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .task-main-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .task-controls {
            flex-direction: column;
            gap: 6px;
            width: 100%;
          }

          .task-dates-compact {
            flex-direction: column;
            gap: 6px;
            width: 100%;
          }

          .status-select-compact, .assignee-select-compact {
            width: 100%;
            min-width: auto;
          }

          .date-input-compact {
            width: 100%;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};
