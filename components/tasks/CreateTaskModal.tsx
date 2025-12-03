"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Flag, Target } from "lucide-react";
import { projectService } from "@/services/projectService";
import { milestoneService } from "@/services/milestoneService";
import { taskService } from "@/services/taskService";
import { MilestoneBackend } from "@/types/milestone";
import { Project } from "@/types/project";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { validateTaskDates } from "@/utils/taskValidation";
import "@/app/styles/create-task-modal.scss";
import { format } from "path";
import { formatDate } from "@/lib/formatDate";

interface CreateTaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MEMBER_CREATE_STATUS_OPTIONS = [
  { value: 'Todo', label: 'Todo' },
  { value: 'InProgress', label: 'In Progress' },
];

const ALL_STATUS_OPTIONS = [
  { value: 'Todo', label: 'Todo' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'ReadyToReview', label: 'Ready to Review' },
  { value: 'Done', label: 'Done' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export const CreateTaskModal = ({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) => {
  const { user } = useAuth();
  const isMember = user?.role === 'Member';
  
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "Todo",
    userId: "",
    reviewerId: "",
    startDate: "",
    endDate: "",
    milestoneIds: [] as string[],
  });

  const [members, setMembers] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<MilestoneBackend[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !isOpen) return;

      setIsLoadingData(true);
      try {
        // Fetch project details for date validation
        const projectResponse = await projectService.getProjectById(projectId);
        if (projectResponse.success && projectResponse.data) {
          setProject(projectResponse.data);
        }

        const membersResponse = await projectService.getProjectMembersByRole(projectId, 'Member');
        if (membersResponse.success && membersResponse.data) {
          const membersList = membersResponse.data
            .filter((pm: any) => pm.member)
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
            }));
          setMembers(membersList);
        }

        const reviewersResponse = await projectService.getProjectManagers(projectId);
        if (reviewersResponse.success && reviewersResponse.data) {
          const reviewersList = reviewersResponse.data
            .filter((pm: any) => pm.member)
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
            }));
          setReviewers(reviewersList);
        }

        const milestonesResponse = await milestoneService.getMilestonesByProjectId(projectId);
        if (milestonesResponse.success && milestonesResponse.data) {
          const items = Array.isArray(milestonesResponse.data) 
            ? milestonesResponse.data 
            : (milestonesResponse.data as any).items || [];
          setMilestones(items);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [projectId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTaskData({
        title: "",
        description: "",
        status: "Todo",
        userId: "",
        reviewerId: "",
        startDate: "",
        endDate: "",
        milestoneIds: [],
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!user?.userId) {
      toast.error("User not authenticated");
      return;
    }
    if (!taskData.title.trim()) {
      toast.error('Please enter task title');
      return;
    }
    if (!taskData.userId) {
      toast.error('Please select assignee');
      return;
    }
    if (!taskData.startDate || !taskData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    // Validate dates against project dates and business rules
    const dateValidation = validateTaskDates(
      taskData.startDate,
      taskData.endDate,
      project?.startDate,
      project?.endDate
    );

    if (!dateValidation.valid) {
      toast.error(dateValidation.message || 'Invalid dates');
      return;
    }

    try {
      setIsSaving(true);

      const createData = {
        projectId,
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        status: taskData.status,
        actorId: user.userId,
        userId: taskData.userId,
        reviewerId: taskData.reviewerId || undefined,
        startDate: new Date(taskData.startDate).toISOString(),
        endDate: new Date(taskData.endDate).toISOString(),
        milestoneIds: taskData.milestoneIds,
      };

      const response = await taskService.createTask(createData);

      if (response.success) {
        toast.success('Task created successfully');
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.error || 'Unable to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Error creating task');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMilestone = (milestoneId: string) => {
    setTaskData(prev => ({
      ...prev,
      milestoneIds: prev.milestoneIds.includes(milestoneId)
        ? prev.milestoneIds.filter(id => id !== milestoneId)
        : [...prev.milestoneIds, milestoneId]
    }));
  };

  const statusOptions = isMember ? MEMBER_CREATE_STATUS_OPTIONS : ALL_STATUS_OPTIONS;

  if (!isOpen) return null;

  return (
    <div className="create-task-modal-overlay" onClick={handleClose}>
      <div className="create-task-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Task</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {isLoadingData ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : (
            <div className="modal-content-grid">
              <div className="left-column">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Task Title</span>
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                    placeholder="Enter task title..."
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={taskData.description}
                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                    placeholder="Enter task description..."
                    rows={5}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Target size={16} />
                    <span className="label-text">Milestones</span>
                  </label>
                  <div className="milestone-list">
                    {milestones.length === 0 ? (
                      <p className="no-data-text">No milestones available</p>
                    ) : (
                      milestones.map(milestone => (
                        <label key={milestone.id} className="milestone-checkbox-label">
                          <input
                            type="checkbox"
                            checked={taskData.milestoneIds.includes(milestone.id)}
                            onChange={() => toggleMilestone(milestone.id)}
                            disabled={isSaving}
                          />
                          <span>{milestone.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                
              </div>

              <div className="right-column">
                <div className="form-group">
                  <label className="form-label">
                    <Flag size={16} />
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="form-select"
                    value={taskData.status}
                    onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                    disabled={isSaving}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    <span className="label-text">Assignee</span>
                    <span className="required-mark">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={taskData.userId}
                    onChange={(e) => setTaskData({ ...taskData, userId: e.target.value })}
                    disabled={isSaving}
                  >
                    <option value="">Select assignee</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    <span className="label-text">Start Date</span>
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskData.startDate}
                    onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                    min={project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : undefined}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isSaving}
                  />
                  {project?.startDate && (
                    <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                      Project start: {formatDate(project.startDate)}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    <span className="label-text">End Date</span>
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskData.endDate}
                    onChange={(e) => setTaskData({ ...taskData, endDate: e.target.value })}
                    min={taskData.startDate || undefined}
                    max={project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : undefined}
                    disabled={isSaving}
                  />
                  {project?.endDate && (
                    <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                      Project end: {formatDate(project.endDate)}
                    </span>
                  )}
                </div>

                
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="footer-button cancel-button" 
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            className="footer-button save-button" 
            onClick={handleSave}
            disabled={isSaving || isLoadingData}
          >
            {isSaving ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
