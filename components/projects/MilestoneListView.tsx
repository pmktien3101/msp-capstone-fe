"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { MilestoneBackend } from "@/types/milestone";
import { mockTasks, mockMembers } from "@/constants/mockData";
import { useUser } from "@/hooks/useUser";
import { ListHeader } from "./ListHeader";
import { milestoneService } from "@/services/milestoneService";
import {
  Calendar,
  CheckCircle,
  Target,
  X,
  Trash2,
  Plus,
  Save,
} from "lucide-react";

interface MilestoneListViewProps {
  project: Project;
}

interface MilestoneDetailPanelProps {
  milestone: MilestoneBackend;
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  members: any[];
  allMilestones?: MilestoneBackend[];
}

const MilestoneDetailPanel = ({ milestone, isOpen, onClose, tasks, members, allMilestones = [] }: MilestoneDetailPanelProps) => {
  const [editedMilestone, setEditedMilestone] = useState(milestone);
  const [editedTasks, setEditedTasks] = useState(tasks);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    startDate: '',
    endDate: '',
    status: 'todo',
    selectedMilestones: [milestone.id.toString()] // Mặc định chọn milestone hiện tại
  });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTasks, setEditingTasks] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const milestoneTasks = editedTasks.filter(task => 
    task.milestoneIds?.includes(milestone.id.toString())
  );

  // Get all milestones for this project
  const projectMilestones = allMilestones;

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
      const milestone = projectMilestones.find((m: MilestoneBackend) => m.id.toString() === id);
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
    // Mark task as being edited
    setEditingTasks(prev => new Set(prev).add(taskId));
    console.log(`Updated task ${taskId} ${field}:`, value);
  };

  const handleSaveTask = (taskId: string) => {
    // Here you would typically save to API
    console.log(`Saving task ${taskId}`);
    setEditingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  const handleCancelEdit = (taskId: string) => {
    // Reset task to original state
    setEditedTasks(prev => prev.map(task => 
      task.id === taskId ? tasks.find(t => t.id === taskId) || task : task
    ));
    setEditingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter') {
      callback();
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const taskId = `task-${Date.now()}`;
    const createdTask = {
      id: taskId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      assignee: newTask.assignee || null,
      startDate: newTask.startDate || null,
      endDate: newTask.endDate || null,
      milestoneIds: [milestone.id.toString()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditedTasks(prev => [...prev, createdTask]);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      startDate: '',
      endDate: '',
      status: 'todo',
      selectedMilestones: [milestone.id.toString()]
    });
    setShowCreateTaskModal(false);
  };

  const handleCreateTaskInline = () => {
    setIsCreatingTask(true);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      startDate: '',
      endDate: '',
      status: 'todo',
      selectedMilestones: [milestone.id.toString()]
    });
  };

  const handleSaveTaskInline = () => {
    if (!newTask.title.trim()) return;

    const taskId = `task-${Date.now()}`;
    const createdTask = {
      id: taskId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      assignee: newTask.assignee || null,
      startDate: newTask.startDate || null,
      endDate: newTask.endDate || null,
      milestoneIds: newTask.selectedMilestones,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditedTasks(prev => [...prev, createdTask]);
    setIsCreatingTask(false);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      startDate: '',
      endDate: '',
      status: 'todo',
      selectedMilestones: [milestone.id.toString()]
    });
  };

  const handleCancelTaskInline = () => {
    setIsCreatingTask(false);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      startDate: '',
      endDate: '',
      status: 'todo',
      selectedMilestones: [milestone.id.toString()]
    });
  };

  const handleMilestoneToggle = (milestoneId: string) => {
    setNewTask(prev => ({
      ...prev,
      selectedMilestones: prev.selectedMilestones.includes(milestoneId)
        ? prev.selectedMilestones.filter(id => id !== milestoneId)
        : [...prev.selectedMilestones, milestoneId]
    }));
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
              <button className="add-task-btn" onClick={handleCreateTaskInline}>
                <Plus size={16} />
                Thêm công việc
              </button>
            </div>
            <div className="tasks-list">
              {/* Inline Task Creation */}
              {isCreatingTask && (
                <div className="create-task-form">
                  <div className="form-header">
                    <h3>Tạo công việc mới</h3>
                  </div>
                  
                  <div className="form-content">
                    <div className="form-group">
                      <label>Tên công việc *</label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        className="form-input"
                        placeholder="Nhập tên công việc..."
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <label>Mô tả</label>
                      <textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        className="form-textarea"
                        rows={3}
                        placeholder="Mô tả chi tiết công việc..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Cột mốc</label>
                      <div className="milestones-checkboxes">
                        {projectMilestones.map(milestoneItem => (
                          <label key={milestoneItem.id} className="milestone-checkbox-label">
                            <input
                              type="checkbox"
                              checked={newTask.selectedMilestones.includes(milestoneItem.id)}
                              onChange={() => handleMilestoneToggle(milestoneItem.id)}
                              className="milestone-checkbox"
                            />
                            <span className="milestone-checkbox-text">{milestoneItem.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Người thực hiện</label>
                        <select
                          value={newTask.assignee || ""}
                          onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                          className="form-select"
                        >
                          <option value="">Chưa phân công</option>
                          {members.map(member => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Trạng thái</label>
                        <select
                          value={newTask.status}
                          onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value }))}
                          className="form-select"
                        >
                          <option value="todo">Cần làm</option>
                          <option value="in-progress">Đang làm</option>
                          <option value="review">Đang kiểm tra</option>
                          <option value="done">Hoàn thành</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Ngày bắt đầu</label>
                        <input
                          type="date"
                          value={newTask.startDate || ""}
                          onChange={(e) => setNewTask(prev => ({ ...prev, startDate: e.target.value }))}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Ngày kết thúc</label>
                        <input
                          type="date"
                          value={newTask.endDate || ""}
                          onChange={(e) => setNewTask(prev => ({ ...prev, endDate: e.target.value }))}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      onClick={() => setIsCreatingTask(false)}
                      className="cancel-btn"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleSaveTaskInline}
                      disabled={!newTask.title.trim()}
                      className="create-btn"
                    >
                      Tạo công việc
                    </button>
                  </div>
                </div>
              )}

              {milestoneTasks.length === 0 && !isCreatingTask ? (
                <div className="empty-tasks-state">
                  <div className="empty-tasks-icon">
                    <Target size={48} />
                  </div>
                  <h4>Chưa có công việc nào</h4>
                  <p>Cột mốc này chưa có công việc nào được gán. Hãy thêm công việc để bắt đầu quản lý tiến độ.</p>
                  <button className="add-first-task-btn" onClick={handleCreateTaskInline}>
                    <Plus size={16} />
                    Thêm công việc đầu tiên
                  </button>
                </div>
              ) : (
                milestoneTasks.map((task) => {
                  const taskMilestoneNames = getMilestoneNames(task.milestoneIds);
                  const isMultiMilestone = task.milestoneIds.length > 1;
                  
                  return (
                    <div key={task.id} className={`task-item-compact ${editingTasks.has(task.id) ? 'has-edit-actions' : ''}`}>
                      {editingTasks.has(task.id) && (
                        <div className="edit-actions-top">
                          <button
                            onClick={() => handleSaveTask(task.id)}
                            className="save-btn"
                            title="Lưu thay đổi"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => handleCancelEdit(task.id)}
                            className="edit-cancel-btn"
                            title="Hủy thay đổi"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      
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
                          <div className="multi-milestone-badge-compact" title={taskMilestoneNames.join(", ")}>
                            <span className="milestone-count">+{task.milestoneIds.length}</span>
                            <span className="milestone-text">milestones</span>
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

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="create-task-modal-overlay" onClick={() => setShowCreateTaskModal(false)}>
          <div className="create-task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo công việc mới</h3>
              <button className="close-btn" onClick={() => setShowCreateTaskModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Tên công việc *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tên công việc..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết công việc..."
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Người thực hiện</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Chưa phân công</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value }))}
                    className="form-select"
                  >
                    <option value="todo">Cần làm</option>
                    <option value="in-progress">Đang làm</option>
                    <option value="review">Đang kiểm tra</option>
                    <option value="done">Hoàn thành</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, startDate: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={newTask.endDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, endDate: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowCreateTaskModal(false)}
              >
                Hủy
              </button>
              <button 
                className="create-btn" 
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
              >
                Tạo công việc
              </button>
            </div>
          </div>
        </div>
      )}

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
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-task-btn:hover {
          background: #FF5E13;
          color: white;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .task-item-compact {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 16px;
          align-items: start;
          position: relative;
          overflow: visible;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .task-item-compact.has-edit-actions {
          padding-top: 50px;
        }

        .task-item-compact::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: linear-gradient(180deg, #FF5E13 0%, #FF8C42 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .task-item-compact:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }

        .task-item-compact:hover::before {
          opacity: 1;
        }

        .create-task-form {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .form-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.025em;
        }

        .form-content {
          padding: 24px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
        }


        .task-actions-inline {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .save-task-btn, .cancel-task-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-task-btn {
          background: #10b981;
          color: white;
        }

        .save-task-btn:hover:not(:disabled) {
          background: #059669;
          transform: scale(1.05);
        }

        .save-task-btn:disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .cancel-task-btn {
          background: #ef4444;
          color: white;
        }

        .cancel-task-btn:hover {
          background: #dc2626;
          transform: scale(1.05);
        }

        .task-main-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .task-id-compact {
          font-size: 11px;
          color: #ff8c42;
          font-weight: 800;
          letter-spacing: 0.5px;
          min-width: 60px;
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          padding: 4px 8px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #fed7aa;
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
          min-width: 0;
          max-width: calc(100% - 120px);
          overflow: hidden;
          text-overflow: ellipsis;
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
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 2px;
          max-width: 80px;
          overflow: hidden;
          cursor: help;
          transition: all 0.2s ease;
        }

        .multi-milestone-badge-compact:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: scale(1.05);
        }

        .milestone-count {
          font-weight: 800;
          font-size: 10px;
        }

        .milestone-text {
          font-size: 8px;
          opacity: 0.9;
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

        .edit-actions-top {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 6px;
          align-items: center;
          z-index: 10;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 4px 6px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .save-btn, .edit-cancel-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .save-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .save-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .edit-cancel-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .edit-cancel-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
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
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-first-task-btn:hover {
          background: #FF5E13;
          color: white;
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

        /* Milestone Selection Styles */
        .task-milestones-compact {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .milestones-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        .milestones-checkboxes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .milestone-checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 11px;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .milestone-checkbox-label:hover {
          background: #e2e8f0;
          color: #374151;
        }

        .milestone-checkbox {
          width: 14px;
          height: 14px;
          accent-color: #FF5E13;
        }

        .milestone-checkbox-text {
          white-space: nowrap;
        }

        /* Create Task Modal Styles */
        .create-task-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .create-task-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: border-color 0.2s ease;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #FF5E13;
          box-shadow: 0 0 0 3px rgba(255, 94, 19, 0.1);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .create-btn {
          padding: 10px 20px;
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .create-btn:hover:not(:disabled) {
          background: #FF5E13;
          color: white;
        }

        .create-btn:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          border-color: #d1d5db;
          cursor: not-allowed;
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

          .create-task-modal {
            margin: 10px;
            max-width: calc(100vw - 20px);
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .modal-content {
            padding: 20px;
          }

          .modal-footer {
            padding: 16px 20px;
            flex-direction: column;
          }

          .cancel-btn, .create-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export const MilestoneListView = ({ project }: MilestoneListViewProps) => {
  const { role } = useUser();
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneBackend | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [projectMilestones, setProjectMilestones] = useState<MilestoneBackend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch milestones from API
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!project.id) return;
      
      setIsLoading(true);
      try {
        const response = await milestoneService.getMilestonesByProjectId(project.id.toString());
        if (response.success && response.data) {
          setProjectMilestones(response.data);
        } else {
          console.error('Failed to fetch milestones:', response.error);
          setProjectMilestones([]);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
        setProjectMilestones([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [project.id]);

  // Filter milestones based on search
  const filteredMilestones = projectMilestones.filter((milestone: MilestoneBackend) => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      milestone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Sort milestones
  const sortedMilestones = [...filteredMilestones].sort((a: MilestoneBackend, b: MilestoneBackend) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'taskCount':
        const aTaskCount = mockTasks.filter(task => task.milestoneIds?.includes(a.id.toString())).length;
        const bTaskCount = mockTasks.filter(task => task.milestoneIds?.includes(b.id.toString())).length;
        comparison = aTaskCount - bTaskCount;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });


  const calculateMilestoneProgress = (milestoneId: string) => {
    const milestoneTasks = mockTasks.filter(task => 
      task.milestoneIds?.includes(milestoneId)
    );
    if (milestoneTasks.length === 0) return 0;
    const completedTasks = milestoneTasks.filter(task => task.status === "done").length;
    return Math.round((completedTasks / milestoneTasks.length) * 100);
  };

  const getTaskCount = (milestoneId: string) => {
    const milestoneTasks = mockTasks.filter(task => 
      task.milestoneIds?.includes(milestoneId)
    );
    const completedTasks = milestoneTasks.filter(task => task.status === "done").length;
    return `${milestoneTasks.length} công việc (${completedTasks} hoàn thành)`;
  };

  const handleMilestoneClick = (milestone: MilestoneBackend) => {
    setSelectedMilestone(milestone);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedMilestone(null);
  };

  const handleDeleteMilestone = async (milestoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Bạn có chắc chắn muốn xóa cột mốc này?')) {
      return;
    }

    try {
      const response = await milestoneService.deleteMilestone(milestoneId);
      if (response.success) {
        // Refresh milestones list
        const updatedResponse = await milestoneService.getMilestonesByProjectId(project.id.toString());
        if (updatedResponse.success && updatedResponse.data) {
          setProjectMilestones(updatedResponse.data);
        }
        alert('Xóa cột mốc thành công!');
      } else {
        alert(`Lỗi: ${response.error}`);
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Có lỗi xảy ra khi xóa cột mốc');
    }
  };

  return (
    <div className="milestone-list-view">
      <ListHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
          <div className="col-actions">Thao tác</div>
        </div>

        <div className="table-body">
          {isLoading ? (
            <div className="loading-state">
              <p>Đang tải cột mốc...</p>
            </div>
          ) : sortedMilestones.length === 0 ? (
            <div className="empty-state">
              <Target size={48} />
              <p>Chưa có cột mốc nào</p>
            </div>
          ) : (
            sortedMilestones.map((milestone) => {
              const progress = calculateMilestoneProgress(milestone.id.toString());
              const taskCount = getTaskCount(milestone.id.toString());
              
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
                  <div className="col-actions">
                    <button 
                      className="delete-milestone-btn-row"
                      onClick={(e) => handleDeleteMilestone(milestone.id.toString(), e)}
                      title="Xóa cột mốc"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedMilestone && (
        <MilestoneDetailPanel
          milestone={selectedMilestone}
          isOpen={isDetailPanelOpen}
          onClose={handleCloseDetailPanel}
          tasks={mockTasks}
          members={mockMembers}
          allMilestones={projectMilestones}
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

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: #64748b;
        }

        .loading-state p,
        .empty-state p {
          margin-top: 16px;
          font-size: 16px;
        }

        .empty-state svg {
          color: #94a3b8;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 120px 150px 120px 60px;
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
          grid-template-columns: 1fr 120px 150px 120px 60px;
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
        }

        .milestone-description {
          font-size: 14px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
          .col-progress {
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


          .col-actions {
            position: absolute;
            top: 16px;
            right: 16px;
          }
        }

        @media (max-width: 1024px) and (min-width: 769px) {
          .task-item-compact {
            grid-template-columns: 1fr auto;
            gap: 12px;
          }

          .task-main-info {
            flex-wrap: wrap;
            gap: 6px;
          }

          .task-title-input-compact {
            max-width: calc(100% - 100px);
            min-width: 200px;
          }

          .multi-milestone-badge-compact {
            max-width: 70px;
            font-size: 8px;
            padding: 3px 6px;
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
            width: 100%;
          }

          .task-title-input-compact {
            max-width: 100%;
            width: 100%;
          }

          .multi-milestone-badge-compact {
            max-width: 100%;
            width: fit-content;
            margin-top: 4px;
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

          .create-task-form {
            margin-bottom: 16px;
          }

          .form-header {
            padding: 16px 20px;
          }

          .form-header h3 {
            font-size: 16px;
          }

          .form-content {
            padding: 20px;
          }

          .form-actions {
            padding: 16px 20px;
            flex-direction: column;
            gap: 12px;
          }

          .cancel-btn, .create-btn {
            width: 100%;
          }

          .edit-actions-top {
            top: 8px;
            right: 8px;
            gap: 4px;
            padding: 3px 5px;
          }

          .save-btn, .edit-cancel-btn {
            width: 24px;
            height: 24px;
          }

          .task-item-compact.has-edit-actions {
            padding-top: 40px;
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
