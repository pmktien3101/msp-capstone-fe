'use client';

import { mockMembers } from '@/constants/mockData';

interface ListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
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
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange
}: ListHeaderProps) => {
  return (
    <div className="list-header">
      <div className="controls-container">
        <div className="search-container">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="search-icon">
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Tìm kiếm cột mốc..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        {statusFilter !== undefined && onStatusFilterChange && (
          <div className="filters">
            <select 
              value={statusFilter} 
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Kế hoạch</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>
        )}

        <div className="sort-controls">
          <select 
            value={sortBy} 
            onChange={(e) => onSortByChange(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="dueDate">Sắp xếp theo ngày hết hạn</option>
            <option value="progress">Sắp xếp theo tiến độ</option>
            <option value="taskCount">Sắp xếp theo số công việc</option>
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

        <div className="header-actions">
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
      </div>

      <style jsx>{`
        .list-header {
          display: flex;
          align-items: center;
          padding: 12px 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .controls-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .search-container {
          position: relative;
          width: 300px;
          flex-shrink: 0;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .search-input {
          width: 100%;
          padding: 6px 10px 6px 36px;
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


        .filters {
          display: flex;
          gap: 8px;
        }

        .filter-select {
          padding: 6px 10px;
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 6px;
        }

        .sort-select {
          padding: 6px 10px;
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
          width: 32px;
          height: 32px;
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
          width: 32px;
          height: 32px;
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

        /* Responsive Design */
        
        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 769px) {
          .list-header {
            padding: 10px 0;
          }

          .controls-container {
            gap: 6px;
          }

          .search-container {
            width: 250px;
          }

          .search-input {
            padding: 5px 9px 5px 34px;
            font-size: 13px;
          }

          .search-icon {
            left: 9px;
          }

          .filter-select {
            padding: 5px 9px;
            font-size: 13px;
          }

          .sort-select {
            padding: 5px 9px;
            font-size: 13px;
          }

          .sort-order-btn,
          .header-btn {
            width: 30px;
            height: 30px;
          }
        }

        /* Mobile Large (481px - 768px) */
        @media (max-width: 768px) and (min-width: 481px) {
          .list-header {
            padding: 8px 0;
          }

          .controls-container {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .search-container {
            width: 100%;
          }

          .search-input {
            padding: 6px 10px 6px 36px;
            font-size: 14px;
          }

          .filters {
            gap: 6px;
          }

          .filter-select {
            flex: 1;
            padding: 6px 10px;
            font-size: 14px;
          }

          .sort-controls {
            gap: 4px;
          }

          .sort-select {
            flex: 1;
            padding: 6px 10px;
            font-size: 14px;
          }

          .header-actions {
            margin-left: 0;
            justify-content: center;
            gap: 4px;
          }

          .sort-order-btn,
          .header-btn {
            width: 32px;
            height: 32px;
          }
        }

        /* Mobile Small (320px - 480px) */
        @media (max-width: 480px) {
          .list-header {
            padding: 6px 0;
          }

          .controls-container {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
          }

          .search-container {
            width: 100%;
          }

          .search-input {
            padding: 5px 8px 5px 32px;
            font-size: 13px;
          }

          .search-icon {
            left: 8px;
            width: 14px;
            height: 14px;
          }

          .filters {
            gap: 4px;
          }

          .filter-select {
            flex: 1;
            padding: 5px 8px;
            font-size: 13px;
          }

          .sort-controls {
            gap: 3px;
          }

          .sort-select {
            flex: 1;
            padding: 5px 8px;
            font-size: 13px;
          }

          .header-actions {
            margin-left: 0;
            justify-content: center;
            gap: 3px;
          }

          .sort-order-btn,
          .header-btn {
            width: 28px;
            height: 28px;
          }

          .sort-order-btn svg,
          .header-btn svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </div>
  );
};
