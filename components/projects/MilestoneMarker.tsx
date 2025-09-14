'use client';

import { useState } from 'react';
import { Milestone } from '@/types/milestone';

interface MilestoneMarkerProps {
  milestone: Milestone;
  position: number;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestoneId: string) => void;
}

export const MilestoneMarker = ({ milestone, position, onEdit, onDelete }: MilestoneMarkerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'delayed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '🏁';
      case 'in-progress': return '🚧';
      case 'pending': return '⏳';
      case 'delayed': return '⚠️';
      default: return '🏁';
    }
  };

  return (
    <div
      className="milestone-marker"
      style={{
        left: position,
        top: -10
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Milestone Flag */}
      <div 
        className="milestone-flag"
        style={{ backgroundColor: getStatusColor(milestone.status) }}
        onClick={() => onEdit?.(milestone)}
      >
        <span className="milestone-icon">{getStatusIcon(milestone.status)}</span>
        <div className="milestone-flag-pole"></div>
      </div>

      {/* Milestone Tooltip */}
      {isHovered && (
        <div className="milestone-tooltip">
          <div className="tooltip-header">
            <h4>{milestone.name || milestone.title}</h4>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(milestone.status) }}
            >
              {milestone.status}
            </span>
          </div>
          <p className="tooltip-description">{milestone.description}</p>
          <div className="tooltip-meta">
            <span className="due-date">
              📅 {new Date(milestone.endDate || milestone.dueDate).toLocaleDateString('vi-VN')}
            </span>
            <span className="progress">
              📊 {milestone.progress}%
            </span>
          </div>
          <div className="tooltip-actions">
            <button 
              className="edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(milestone);
              }}
            >
              ✏️ Chỉnh sửa
            </button>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Bạn có chắc chắn muốn xóa milestone này?')) {
                  onDelete?.(milestone.id);
                }
              }}
            >
              🗑️ Xóa
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .milestone-marker {
          position: absolute;
          z-index: 10;
          cursor: pointer;
        }

        .milestone-flag {
          position: relative;
          width: 24px;
          height: 24px;
          border-radius: 4px 4px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .milestone-flag:hover {
          transform: scale(1.1);
        }

        .milestone-icon {
          font-size: 12px;
          color: white;
        }

        .milestone-flag-pole {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 8px;
          background: #374151;
        }

        .milestone-tooltip {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          min-width: 280px;
          z-index: 20;
        }

        .tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .tooltip-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .status-badge {
          padding: 2px 6px;
          border-radius: 4px;
          color: white;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .tooltip-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.4;
        }

        .tooltip-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 12px;
          color: #6b7280;
        }

        .tooltip-actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn, .delete-btn {
          padding: 4px 8px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          background: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .delete-btn:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};
