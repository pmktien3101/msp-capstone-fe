'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { TaskStatus } from '@/constants/status';
import { milestoneService } from '@/services/milestoneService';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { GetTaskResponse } from '@/types/task';
import { MilestoneBackend } from '@/types/milestone';
import { CheckCircle, Plus, Clock } from 'lucide-react';

interface OverviewCardsProps {
  project: Project;
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    onHold: number;
    completionRate: number;
  };
}

export const OverviewCards = ({ project, stats }: OverviewCardsProps) => {
  const [projectMilestones, setProjectMilestones] = useState<MilestoneBackend[]>([]);
  const [projectTasks, setProjectTasks] = useState<GetTaskResponse[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const projectId = project?.id?.toString();

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [milestonesRes, tasksRes, membersRes] = await Promise.all([
          milestoneService.getMilestonesByProjectId(projectId),
          taskService.getTasksListByProjectId(projectId), // Get all tasks without pagination
          projectService.getProjectMembers(projectId)
        ]);

        if (milestonesRes.success && milestonesRes.data) {
          setProjectMilestones(milestonesRes.data);
        }

        if (tasksRes.success && tasksRes.data) {
          setProjectTasks(tasksRes.data || []); // tasksRes.data is already an array
        }

        if (membersRes.success && membersRes.data) {
          // Filter out members who have left the project
          const activeMembers = membersRes.data.filter((pm: any) => !pm.leftAt);
          setProjectMembers(activeMembers);
        }
      } catch (error) {
        console.error('[OverviewCards] Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);
  
  // Tính toán các số liệu từ API data
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(task => task.status === TaskStatus.Done).length;
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Lấy timestamp hiện tại và 7 ngày trước
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Card 2: Số task completed trong 7 ngày gần nhất
  const recentlyCompletedTasks = projectTasks.filter(task => {
    if (task.status !== TaskStatus.Done) return false;
    // Giả sử task có trường updatedAt hoặc completedAt
    const taskDate = task.updatedAt ? new Date(task.updatedAt) : null;
    return taskDate && taskDate >= sevenDaysAgo && taskDate <= now;
  }).length;
  
  // Card 3: Số task được tạo trong 7 ngày gần nhất
  const recentlyCreatedTasks = projectTasks.filter(task => {
    const taskDate = task.createdAt ? new Date(task.createdAt) : null;
    return taskDate && taskDate >= sevenDaysAgo && taskDate <= now;
  }).length;
  
  // Card 4: Số task sắp đến hạn (7 ngày tiếp theo)
  const upcomingDueTasks = projectTasks.filter(task => {
    // Chỉ tính các task chưa hoàn thành
    if (task.status === TaskStatus.Done || task.status === TaskStatus.Cancelled) return false;
    const dueDate = task.endDate ? new Date(task.endDate) : null;
    return dueDate && dueDate >= now && dueDate <= sevenDaysLater;
  }).length;
  
  const overviewData = [
    {
      id: 'completion-rate',
      title: `${completedPercentage}%`,
      subtitle: 'Overall Completion',
      icon: <CheckCircle size={18} />,
      color: '#10b981'
    },
    {
      id: 'recently-completed',
      title: `${recentlyCompletedTasks} completed`,
      subtitle: 'in the last 7 days',
      icon: <CheckCircle size={18} />,
      color: '#10b981'
    },
    {
      id: 'recently-created',
      title: `${recentlyCreatedTasks} created`,
      subtitle: 'in the last 7 days',
      icon: <Plus size={18} />,
      color: '#3b82f6'
    },
    {
      id: 'upcoming-due',
      title: `${upcomingDueTasks} due soon`,
      subtitle: 'in the next 7 days',
      icon: <Clock size={18} />,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="overview-cards-123">
      {overviewData.map((card) => (
        <div key={card.id} className="overview-card-123">
          <div className="card-icon-123" style={{ color: card.color }}>
            {card.icon}
          </div>
          <div className="card-content-123">
            <h3 className="card-title-123">{card.title}</h3>
            <p className="card-subtitle-123">{card.subtitle}</p>
          </div>
        </div>
      ))}

      <style jsx>{`
        .overview-cards-123 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .overview-card-123 {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .overview-card-123:hover {
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .card-icon-123 {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .card-content-123 {
          flex: 1;
        }

        .card-title-123 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 3px 0;
          line-height: 1.2;
        }

        .card-subtitle-123 {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.3;
        }

        @media (max-width: 768px) {
          .overview-cards-123 {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .overview-card-123 {
            padding: 16px;
          }

          .card-title-123 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};