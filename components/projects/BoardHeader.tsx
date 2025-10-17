'use client';

import { mockMembers, mockTasks } from "@/constants/mockData";

interface Member {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface BoardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupBy: string;
  onGroupByChange: (groupBy: string) => void;
  members?: Member[];
  userRole?: string;
}

export const BoardHeader = ({ 
  searchQuery, 
  onSearchChange, 
  groupBy, 
  onGroupByChange,
  members = [],
  userRole
}: BoardHeaderProps) => {
  // Generate initials from member name
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Check if user is Member role
  const isMemberRole = userRole === 'Member' || userRole === 'member';

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
          {members.length > 0 ? (
            members.map((member) => (
              <div 
                key={member.id} 
                className="member-avatar" 
                title={member.name}
                style={{ background: getAvatarColor(member.name) }}
              >
                {getInitials(member.name)}
              </div>
            ))
          ) : (
            <div className="no-members-text">Chưa có thành viên</div>
          )}
        </div>
      </div>

      <div className="header-right">
        {!isMemberRole && (
          <div className="group-dropdown">
            <select 
              value={groupBy} 
              onChange={(e) => onGroupByChange(e.target.value)}
              className="group-select"
            >
              <option value="none">Không nhóm</option>
              <option value="status">Nhóm theo trạng thái</option>
              <option value="assignee">Nhóm theo người thực hiện</option>
              <option value="milestone">Nhóm theo cột mốc</option>
            </select>
          </div>
        )}
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

        .no-members-text {
          font-size: 13px;
          color: #9ca3af;
          font-style: italic;
        }

        .member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border: 2px solid white;
        }

        .member-avatar:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          z-index: 10;
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
          padding: 10px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .group-select:focus {
          outline: none;
          border-color: #ea580c;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1);
          background: #ffffff;
          transform: translateY(-1px);
        }

        .group-select:hover {
          border-color: #ea580c;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
