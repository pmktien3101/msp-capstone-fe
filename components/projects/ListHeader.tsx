'use client';

import { mockMembers } from '@/constants/mockData';

interface ListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (assignee: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

export const ListHeader = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange
}: ListHeaderProps) => {
  return (
    <div className="list-header">
      <div className="header-left">
        <div className="search-container">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="search-icon">
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Tìm kiếm tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="header-center">
        <div className="filters">
          <select 
            value={statusFilter} 
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="todo">Cần làm</option>
            <option value="in-progress">Đang làm</option>
            <option value="review">Đang review</option>
            <option value="done">Hoàn thành</option>
          </select>

          <select 
            value={assigneeFilter} 
            onChange={(e) => onAssigneeFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="unassigned">Chưa giao</option>
            {mockMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="header-right">
        <div className="sort-controls">
          <select 
            value={sortBy} 
            onChange={(e) => onSortByChange(e.target.value)}
            className="sort-select"
          >
            <option value="title">Sắp xếp theo tên</option>
            <option value="status">Sắp xếp theo trạng thái</option>
            <option value="assignee">Sắp xếp theo người thực hiện</option>
            <option value="dueDate">Sắp xếp theo ngày hạn</option>
            <option value="priority">Sắp xếp theo độ ưu tiên</option>
          </select>

          <button 
            className="sort-order-btn"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              {sortOrder === 'asc' ? (
                <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          </button>
        </div>

        <button className="header-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button className="header-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <style jsx>{`
        .list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          gap: 16px;
        }

        .header-left {
          flex: 1;
          max-width: 300px;
        }

        .search-container {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 40px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .header-center {
          display: flex;
          align-items: center;
        }

        .filters {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 8px;
        }

        .sort-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sort-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .sort-order-btn {
          width: 36px;
          height: 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .sort-order-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          color: #374151;
        }

        .header-btn {
          width: 36px;
          height: 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .header-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          color: #374151;
        }

        @media (max-width: 768px) {
          .list-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .header-left {
            max-width: none;
          }

          .header-center {
            justify-content: space-between;
          }

          .filters {
            flex: 1;
          }

          .filter-select {
            flex: 1;
          }

          .header-right {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};
