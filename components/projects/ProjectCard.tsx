'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: Project;
  onEditProject: () => void;
  onAddMeeting: () => void;
}

export function ProjectCard({ project, onEditProject, onAddMeeting }: ProjectCardProps) {
  const router = useRouter();

  const getProjectStatusText = (status: string) => {
    switch (status) {
      case 'planning': return '📋 Lập kế hoạch';
      case 'active': return '🚀 Đang thực hiện';
      case 'on-hold': return '⏸️ Tạm dừng';
      case 'completed': return '✅ Hoàn thành';
      default: return status;
    }
  };

  const handleViewDetails = () => {
    router.push(`/projects/${project.id}/milestones`);
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <div className="project-icon">📁</div>
        <div className="project-status">
          <span className={cn('status-badge', project.status)}>
            {getProjectStatusText(project.status)}
          </span>
        </div>
      </div>
      
      <div className="project-content">
        <h3 className="project-title">{project.name}</h3>
        <p className="project-description">{project.description}</p>
        
        <div className="project-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span className="meta-text">
              {new Date(project.startDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
              })} - {new Date(project.endDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👤</span>
            <span className="meta-text">{project.manager}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👥</span>
            <span className="meta-text">{project.members.length} thành viên</span>
          </div>
        </div>
        
        <div className="project-progress">
          <div className="progress-header">
            <span className="progress-label">Tiến độ</span>
            <span className="progress-percentage">{project.progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="project-actions">
        <Button variant="default" size="sm" onClick={handleViewDetails}>Xem Chi Tiết</Button>
        <Button variant="secondary" size="sm" onClick={onEditProject}>Chỉnh Sửa</Button>
        <Button variant="outline" size="sm" onClick={onAddMeeting}>📅 Tạo Meeting</Button>
      </div>
    </div>
  );
}
