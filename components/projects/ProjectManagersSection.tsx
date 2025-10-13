'use client';

import { useState } from 'react';
import { Users, Plus, X, UserX } from 'lucide-react';

interface ProjectManager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ProjectManagersSectionProps {
  projectManagers: ProjectManager[];
  canManage: boolean;
  onAddManager?: () => void;
  onRemoveManager?: (managerId: string) => void;
}

export function ProjectManagersSection({
  projectManagers,
  canManage,
  onAddManager,
  onRemoveManager
}: ProjectManagersSectionProps) {
  const [hoveredManager, setHoveredManager] = useState<string | null>(null);

  return (
    <div className="project-managers-section">
      <div className="section-header">
        <div className="header-left">
          <Users size={18} />
          <h3>Project Managers</h3>
          <span className="manager-count">{projectManagers.length}</span>
        </div>
        {canManage && (
          <button 
            className="add-manager-btn"
            onClick={onAddManager}
            title="Thêm Project Manager"
          >
            <Plus size={16} />
            Thêm PM
          </button>
        )}
      </div>

      <div className="managers-list">
        {projectManagers.length === 0 ? (
          <div className="empty-state">
            <UserX size={32} />
            <p>Chưa có Project Manager nào được gán</p>
            {canManage && (
              <button className="add-first-manager" onClick={onAddManager}>
                <Plus size={16} />
                Thêm PM đầu tiên
              </button>
            )}
          </div>
        ) : (
          projectManagers.map((manager) => (
            <div 
              key={manager.id} 
              className="manager-card"
              onMouseEnter={() => setHoveredManager(manager.id)}
              onMouseLeave={() => setHoveredManager(null)}
            >
              <div className="manager-avatar">
                {manager.avatar ? (
                  <img src={manager.avatar} alt={manager.name} />
                ) : (
                  <span>{manager.name.charAt(0)}</span>
                )}
              </div>
              <div className="manager-info">
                <div className="manager-name">{manager.name}</div>
                <div className="manager-email">{manager.email}</div>
              </div>
              {canManage && hoveredManager === manager.id && (
                <button
                  className="remove-manager-btn"
                  onClick={() => onRemoveManager?.(manager.id)}
                  title="Xóa khỏi dự án"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .project-managers-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #F1F1F1;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #F1F1F1;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0D062D;
        }

        .header-left h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }

        .manager-count {
          font-size: 12px;
          font-weight: 600;
          color: #FF5E13;
          background: #FFF4ED;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .add-manager-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #FF5E13;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-manager-btn:hover {
          background: #E54D0F;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        .managers-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #94A3B8;
          text-align: center;
        }

        .empty-state p {
          margin: 12px 0 16px 0;
          font-size: 14px;
        }

        .add-first-manager {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #FFF4ED;
          color: #FF5E13;
          border: 2px dashed #FFD4B8;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-first-manager:hover {
          background: #FF5E13;
          color: white;
          border-color: #FF5E13;
        }

        .manager-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #FAFBFC;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          transition: all 0.3s ease;
          position: relative;
        }

        .manager-card:hover {
          background: #FFF4ED;
          border-color: #FFD4B8;
          transform: translateX(4px);
        }

        .manager-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #FF5E13;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .manager-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .manager-info {
          flex: 1;
          min-width: 0;
        }

        .manager-name {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
          margin-bottom: 2px;
        }

        .manager-email {
          font-size: 12px;
          color: #64748B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .remove-manager-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #FEE2E2;
          color: #DC2626;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .remove-manager-btn:hover {
          background: #DC2626;
          color: white;
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .add-manager-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
