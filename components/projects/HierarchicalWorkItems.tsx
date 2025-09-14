'use client';

import { useState } from 'react';

interface WorkItem {
  id: string;
  title: string;
  type: 'milestone' | 'task';
  status: string;
  assignee?: string | null;
  children?: WorkItem[];
  isExpanded?: boolean;
  rowIndex?: number;
  dueDate?: string;
  milestoneId?: string | null;
  progress?: number;
}

interface HierarchicalWorkItemsProps {
  items: WorkItem[];
  onItemClick?: (item: WorkItem) => void;
  onItemToggle?: (itemId: string) => void;
}

export const HierarchicalWorkItems = ({ items, onItemClick, onItemToggle }: HierarchicalWorkItemsProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['milestone-1']));

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return { text: 'IN PROGRESS', color: '#ffffff', bgColor: '#3b82f6' };
      case 'todo':
        return { text: 'TO DO', color: '#ffffff', bgColor: '#6b7280' };
      case 'done':
        return { text: 'DONE', color: '#ffffff', bgColor: '#10b981' };
      case 'review':
        return { text: 'REVIEW', color: '#ffffff', bgColor: '#f59e0b' };
      default:
        return { text: 'TO DO', color: '#ffffff', bgColor: '#6b7280' };
    }
  };

  const getAssigneeInitials = (assignee?: string | null) => {
    if (!assignee) return '';
    return assignee.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const renderItem = (item: WorkItem, level: number = 0, rowIndex: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const isMilestone = item.type === 'milestone';
    const statusBadge = getStatusBadge(item.status);
    const assigneeInitials = getAssigneeInitials(item.assignee);

    if (isMilestone) {
      return (
        <div key={item.id} className="milestone-group">
          {/* Milestone Header */}
          <div 
            className="work-item milestone-item"
            onClick={() => onItemClick?.(item)}
          >
            <div className="item-left">
              <input 
                type="checkbox" 
                checked={item.status === 'done'}
                onChange={() => onItemToggle?.(item.id)}
                onClick={(e) => e.stopPropagation()}
              />
              
              <button 
                className="expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(item.id);
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
              
              <div className="milestone-icon">
                ⚡
              </div>
              
              <span className="item-title">{item.title}</span>
              
              {item.assignee && (
                <div className="assignee-avatar">
                  {assigneeInitials}
                </div>
              )}
            </div>
            
            <div className="item-right">
              <div className="milestone-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${item.progress || 0}%` }}
                  ></div>
                </div>
                <span className="progress-text">{item.progress || 0}%</span>
              </div>
            </div>
          </div>

          {/* Tasks in same row */}
          {isExpanded && item.children && (
            <div className="tasks-row">
              {item.children.map((child, childIndex) => (
                <div 
                  key={child.id}
                  className="work-item task-item nested"
                  onClick={() => onItemClick?.(child)}
                >
                  <div className="item-left">
                    <input 
                      type="checkbox" 
                      checked={child.status === 'done'}
                      onChange={() => onItemToggle?.(child.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="item-title">{child.title}</span>
                    
                    {child.assignee && (
                      <div className="assignee-avatar">
                        {getAssigneeInitials(child.assignee)}
                      </div>
                    )}
                  </div>
                  
                  <div className="item-right">
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Standalone task
      return (
        <div 
          key={item.id}
          className="work-item task-item"
          onClick={() => onItemClick?.(item)}
        >
          <div className="item-left">
            <input 
              type="checkbox" 
              checked={item.status === 'done'}
              onChange={() => onItemToggle?.(item.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="item-title">{item.title}</span>
            
            {item.assignee && (
              <div className="assignee-avatar">
                {assigneeInitials}
              </div>
            )}
          </div>
          
          <div className="item-right">
          </div>
        </div>
      );
    }
  };

  return (
    <div className="hierarchical-work-items">
      {items.map((item, index) => renderItem(item, 0, index))}
      
      <style jsx>{`
        .hierarchical-work-items {
          background: white;
        }

        .work-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          cursor: pointer;
          width: 100%;
          height: 40px;
          box-sizing: border-box;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s ease;
          flex-wrap: nowrap;
        }

        .work-item:hover {
          background-color: #f8fafc;
        }

        .work-item.milestone-item {
          font-weight: 600;
          background-color: #f8fafc;
          border-left: 4px solid #8b5cf6;
          font-size: 14px;
        }

        .work-item.task-item.nested {
          padding-left: 20px;
          font-weight: 400;
          background-color: white;
          border-left: 2px solid #e5e7eb;
          font-size: 13px;
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .item-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          color: #6b7280;
          font-size: 12px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .expand-btn:hover {
          color: #374151;
        }

        .milestone-icon {
          color: #8b5cf6;
          display: flex;
          align-items: center;
          font-size: 16px;
        }

        .item-title {
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
          max-width: 200px;
        }

        .milestone-item .item-title {
          font-weight: 600;
        }

        .task-item .item-title {
          font-weight: 400;
        }

        .assignee-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }


        .milestone-group {
          margin-bottom: 0;
        }

        .tasks-row {
          display: flex;
          flex-direction: column;
        }

        .children-container {
          position: relative;
        }

        .work-item:last-child {
          border-bottom: none;
        }

        .milestone-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .progress-bar {
          width: 60px;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          min-width: 30px;
          text-align: right;
        }
      `}</style>
    </div>
  );
};
