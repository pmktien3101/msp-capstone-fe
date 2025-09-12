'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectTabs } from '@/components/projects/ProjectTabs';
import { Project } from '@/types/project';
import '@/app/styles/project-detail.scss';

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Project Management System',
        description: 'A system to manage company projects and resources',
        status: 'active' as const,
        startDate: '2025-09-01',
        endDate: '2025-12-31',
        manager: 'John Doe',
        members: [
          { id: '1', name: 'John Doe', role: 'Project Manager', email: 'john.doe@example.com', avatar: '/avatars/john.png' },
          { id: '2', name: 'Jane Smith', role: 'Developer', email: 'jane.smith@example.com', avatar: '/avatars/jane.png' }
        ],
        progress: 75
      },
      {
        id: '2',
        name: 'Marketing Campaign',
        description: 'Q4 Digital Marketing Campaign',
        status: 'planning' as const,
        startDate: '2025-10-01',
        endDate: '2025-12-15',
        manager: 'Jane Smith',
        members: [
          { id: '3', name: 'Mike Johnson', role: 'Marketing Lead', email: 'mike.johnson@example.com', avatar: '/avatars/mike.png' },
          { id: '4', name: 'Sarah Wilson', role: 'Content Creator', email: 'sarah.wilson@example.com', avatar: '/avatars/sarah.png' }
        ],
        progress: 25
      },
      {
        id: '3',
        name: 'Mobile App Development',
        description: 'Customer service mobile application',
        status: 'completed' as const,
        startDate: '2025-06-01',
        endDate: '2025-09-30',
        manager: 'Tom Brown',
        members: [
          { id: '5', name: 'Tom Brown', role: 'Tech Lead', email: 'tom.brown@example.com', avatar: '/avatars/tom.png' },
          { id: '6', name: 'Emma Davis', role: 'Developer', email: 'emma.davis@example.com', avatar: '/avatars/emma.png' }
        ],
        progress: 100
      }
    ];

    const foundProject = mockProjects.find(p => p.id === projectId);
    setProject(foundProject || null);
    setLoading(false);
  }, [projectId]);

  if (loading) {
    return (
      <div className="project-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dự án...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-error">
        <h2>Không tìm thấy dự án</h2>
        <p>Dự án với ID "{projectId}" không tồn tại.</p>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="project-header">
        <div className="project-info">
          <h1 className="project-title">{project.name}</h1>
          <p className="project-description">{project.description}</p>
          <div className="project-meta">
            <span className={`status-badge status-${project.status}`}>
              {project.status === 'active' && 'Đang hoạt động'}
              {project.status === 'planning' && 'Đang lập kế hoạch'}
              {project.status === 'on-hold' && 'Tạm dừng'}
              {project.status === 'completed' && 'Hoàn thành'}
            </span>
            <span className="progress-text">Tiến độ: {project.progress}%</span>
          </div>
        </div>
        <div className="project-actions">
          <button className="btn btn-secondary">Chia sẻ</button>
          <button className="btn btn-primary">Cài đặt</button>
        </div>
      </div>

      <ProjectTabs project={project} />
    </div>
  );
};

export default ProjectDetailPage;
