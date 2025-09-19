'use client';

import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';

interface MemberProjectCardProps {
  project: Project;
  index?: number;
}

export function MemberProjectCard({ project, index = 0 }: MemberProjectCardProps) {
  const router = useRouter();

  const handleProjectClick = () => {
    router.push(`/projects/${project.id}`);
  };
  const getGradientClass = (index: number) => {
    switch (index % 3) {
      case 0:
        return 'gradient-purple';
      case 1:
        return 'gradient-pink';
      case 2:
        return 'gradient-blue';
      default:
        return 'gradient-purple';
    }
  };

  return (
    <div 
      className={`member-project-card ${getGradientClass(index)}`}
      onClick={handleProjectClick}
    >
      <div className="project-card-content">
        {/* Status Badge */}
        <div className="status-section">
          <div className="status-badge">
            <div className="status-icon">
              <div className="status-dot"></div>
              <div className="status-line"></div>
            </div>
            <div className="status-text">Đang hoạt động</div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="creator-section">
          <div className="creator-info">
            <span className="creator-label">PM </span>
            <span className="creator-name">{project.manager}</span>
          </div>
          <div className="creator-avatars">
            <img
              className="creator-avatar"
              src={project.members[0]?.avatar || '/avatars/default.png'}
              alt={project.members[0]?.name || 'Member'}
            />
          </div>
        </div>

        {/* Project Content */}
        <div className="project-content">
          <img
            className="project-thumbnail"
            src="https://placehold.co/78x78"
            alt="Project thumbnail"
          />
          <div className="project-details">
            <div className="project-title">{project.name}</div>
            <div className="project-description">{project.description}</div>
            <div className="progress-section">
              <div className="progress-line">
                <div
                  className="progress-fill"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .member-project-card {
          width: 100%;
          height: 149px;
          position: relative;
          border-radius: 20px;
          border: 1px solid #EBEBEB;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .member-project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .gradient-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .gradient-purple:hover {
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .gradient-pink {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          box-shadow: 0 4px 15px rgba(240, 147, 251, 0.2);
        }

        .gradient-pink:hover {
          box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
        }

        .gradient-blue {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          box-shadow: 0 4px 15px rgba(79, 172, 254, 0.2);
        }

        .gradient-blue:hover {
          box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
        }

        .project-card-content {
          width: 100%;
          height: 100%;
          position: relative;
          padding: 13px 15px;
        }

        .status-section {
          position: absolute;
          top: 13px;
          left: 17px;
          z-index: 2;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 40px;
          padding: 3px 11px;
          width: fit-content;
          backdrop-filter: blur(10px);
        }

        .status-icon {
          position: relative;
          width: 12px;
          height: 16px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          position: absolute;
          top: 4px;
          left: 2px;
        }

        .status-line {
          width: 8px;
          height: 2px;
          background: rgba(255, 255, 255, 0.9);
          position: absolute;
          top: 8px;
          left: 2px;
          transform: rotate(-2deg);
        }

        .status-text {
          color: rgba(255, 255, 255, 0.95);
          font-size: 17px;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
        }

        .creator-section {
          position: absolute;
          top: 17px;
          right: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .creator-info {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .creator-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 15.5px;
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        .creator-name {
          color: rgba(255, 255, 255, 0.95);
          font-size: 15.5px;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
        }

        .creator-avatars {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .creator-avatar {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          object-fit: cover;
        }

        .more-members {
          margin-left: -10px;
        }

        .more-avatar {
          width: 27px;
          height: 27px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .more-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16.5px;
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        .project-content {
          position: absolute;
          top: 41px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .project-thumbnail {
          width: 78px;
          height: 78px;
          border-radius: 46px;
          object-fit: cover;
          margin-top: 17px;
        }

        .project-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .project-title {
          color: rgba(255, 255, 255, 0.95);
          font-size: 18px;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
          margin-top: 13px;
        }

        .project-description {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 400;
          line-height: 1.4;
        }

        .progress-section {
          margin-top: auto;
        }

        .progress-line {
          width: 100%;
          height: 3.5px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .project-menu {
          color: white;
          font-size: 35px;
          font-weight: 400;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          margin-top: 13px;
        }
      `}</style>
    </div>
  );
}
