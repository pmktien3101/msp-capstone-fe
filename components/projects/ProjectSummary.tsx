'use client';

import { Project } from "@/types/project";

interface ProjectSummaryProps {
  projects: Project[];
}

export function ProjectSummary({ projects }: ProjectSummaryProps) {
  const getActiveProjectsCount = () => 
    projects.filter(p => p.status === 'active').length;

  const getCompletedProjectsCount = () => 
    projects.filter(p => p.status === 'completed').length;

  const getAverageProgress = () => {
    if (projects.length === 0) return 0;
    const total = projects.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(total / projects.length);
  };

  return (
    <div className="projects-summary">
      <div className="summary-card">
        <div className="summary-icon">📊</div>
        <div className="summary-content">
          <h4>Tổng số dự án</h4>
          <p className="summary-number">{projects.length}</p>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-icon">🚀</div>
        <div className="summary-content">
          <h4>Đang thực hiện</h4>
          <p className="summary-number">{getActiveProjectsCount()}</p>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-icon">✅</div>
        <div className="summary-content">
          <h4>Hoàn thành</h4>
          <p className="summary-number">{getCompletedProjectsCount()}</p>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-icon">⏰</div>
        <div className="summary-content">
          <h4>Trung bình hoàn thành</h4>
          <p className="summary-number">{getAverageProgress()}%</p>
        </div>
      </div>
    </div>
  );
}
