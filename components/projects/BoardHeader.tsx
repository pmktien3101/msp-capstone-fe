'use client';

import { mockMembers, mockTasks } from "@/constants/mockData";

interface BoardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupBy: string;
  onGroupByChange: (groupBy: string) => void;
}

export const BoardHeader = ({ 
  searchQuery, 
  onSearchChange, 
  groupBy, 
  onGroupByChange 
}: BoardHeaderProps) => {
  // Get members who have tasks
  const getMembersWithTasks = () => {
    const memberIdsWithTasks = new Set(mockTasks.map(task => task.assignee).filter(Boolean));
    return mockMembers.filter(member => memberIdsWithTasks.has(member.id));
  };

  const membersWithTasks = getMembersWithTasks();

  return (
    <div className="board-header">
      <div className="header-left">
        <div className="search-container">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="search-icon">
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Tìm kiếm công việc"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="members-avatars">
          {membersWithTasks.map((member) => (
            <div key={member.id} className="member-avatar" title={member.name}>
              {member.avatar}
            </div>
          ))}
        </div>
      </div>

      <div className="header-right">
        <div className="group-dropdown">
          <select 
            value={groupBy} 
            onChange={(e) => onGroupByChange(e.target.value)}
            className="group-select"
          >
            <option value="status">Nhóm theo trạng thái</option>
            <option value="assignee">Nhóm theo người thực hiện</option>
            <option value="milestone">Nhóm theo cột mốc</option>
          </select>
        </div>

        <button className="header-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 3V5H21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button className="header-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
        .board-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          gap: 16px;
        }

        .header-left {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .search-container {
          position: relative;
          width: 300px;
          flex-shrink: 0;
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

        .members-avatars {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .member-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(251, 146, 60, 0.3);
        }

        .member-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(251, 146, 60, 0.4);
        }


        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .group-dropdown {
          margin-right: 8px;
        }

        .group-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .group-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
          .board-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .header-left {
            flex-direction: column;
            gap: 12px;
          }

          .search-container {
            width: 100%;
          }

          .members-avatars {
            justify-content: center;
            flex-wrap: wrap;
          }

          .header-right {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};
