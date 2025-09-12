'use client';

import { useState } from 'react';
import { mockTasks } from '@/constants/mockData';

interface WorkItemsListProps {
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
}

export const WorkItemsList = ({ selectedItems, onSelectionChange }: WorkItemsListProps) => {
  const [workItems, setWorkItems] = useState(mockTasks.map((task, index) => ({
    ...task,
    type: 'epic',
    rowIndex: index
  })));

  const handleItemSelect = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  const handleCreateEpic = () => {
    const newEpic = {
      id: `MWA-${Date.now()}`,
      title: 'Epic mới',
      type: 'epic',
      status: 'todo',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignee: 'QL',
      color: '#8b5cf6'
    };
    setWorkItems([...workItems, newEpic]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return '#f59e0b';
      case 'in-progress':
        return '#3b82f6';
      case 'done':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'Cần làm';
      case 'in-progress':
        return 'Đang làm';
      case 'done':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  return (
    <div className="work-items-list">
      <div className="list-header">
        <h3>Công việc</h3>
      </div>

      <div className="list-content">
        {workItems.map((item) => (
          <div 
            key={item.id} 
            className={`work-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
            onClick={() => handleItemSelect(item.id)}
            style={{ height: '60px' }}
          >
            <div className="item-header">
              <div className="item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div 
                  className="type-icon"
                  style={{ backgroundColor: item.color }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="item-info">
                <div className="item-title">{item.id} {item.title}</div>
                <div className="item-meta">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button 
          className="create-epic-btn"
          onClick={handleCreateEpic}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tạo Công việc
        </button>
      </div>

      <style jsx>{`
        .work-items-list {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .list-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .list-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .list-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .work-item {
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
          display: flex;
          align-items: center;
        }

        .work-item:hover {
          background: #f9fafb;
        }

        .work-item.selected {
          background: #eff6ff;
          border-left-color: #3b82f6;
        }

        .item-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .item-icon {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .type-icon {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-title {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-badge {
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .create-epic-btn {
          width: 100%;
          padding: 12px 20px;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .create-epic-btn:hover {
          background: #f9fafb;
          color: #374151;
        }

        /* Scrollbar styling */
        .list-content::-webkit-scrollbar {
          width: 6px;
        }

        .list-content::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .list-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .list-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};
