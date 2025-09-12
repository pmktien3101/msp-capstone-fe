'use client';

export const TimelineHeader = () => {
  return (
    <div className="timeline-header">
      <div className="header-left">
        <div className="search-container">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="search-icon">
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Tìm kiếm timeline"
            className="search-input"
          />
        </div>
      </div>

      <div className="header-center">
        <div className="user-avatars">
          <div className="avatar ql-avatar">QL</div>
          <div className="avatar generic-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="filter-dropdowns">
          <select className="filter-select">
            <option value="">Công việc</option>
            <option value="epic1">Công việc 1</option>
            <option value="epic2">Công việc 2</option>
          </select>
          
          <select className="filter-select">
            <option value="">Danh mục trạng thái</option>
            <option value="todo">Cần làm</option>
            <option value="in-progress">Đang làm</option>
            <option value="done">Hoàn thành</option>
          </select>
        </div>
      </div>

      <div className="header-right">
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
        .timeline-header {
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
          gap: 16px;
        }

        .user-avatars {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .ql-avatar {
          background: #3b82f6;
          color: white;
        }

        .generic-avatar {
          background: #f3f4f6;
          color: #6b7280;
        }

        .filter-dropdowns {
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
          .timeline-header {
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

          .filter-dropdowns {
            flex: 1;
          }

          .filter-select {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};
