'use client';

import { useState, useRef, useEffect } from 'react';

interface ColumnMenuProps {
  columnId: string;
  columnTitle: string;
  isDoneColumn: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: () => void;
  onDeleteOldItems?: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

export const ColumnMenu = ({ 
  columnId, 
  columnTitle, 
  isDoneColumn, 
  onMoveLeft, 
  onMoveRight, 
  onDelete, 
  onDeleteOldItems,
  canMoveLeft, 
  canMoveRight 
}: ColumnMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="column-menu" ref={menuRef}>
      <button 
        className="menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Tùy chọn cột"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="menu-dropdown">
          <div className="menu-header">
            <span className="menu-title">{columnTitle}</span>
          </div>
          
          <div className="menu-divider"></div>
          
          <div className="menu-options">
            {canMoveLeft && (
              <button 
                className="menu-option"
                onClick={() => handleOptionClick(onMoveLeft)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Dịch sang trái
              </button>
            )}
            
            {canMoveRight && (
              <button 
                className="menu-option"
                onClick={() => handleOptionClick(onMoveRight)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Dịch sang phải
              </button>
            )}
            
            {isDoneColumn && onDeleteOldItems && (
              <button 
                className="menu-option menu-option-warning"
                onClick={() => handleOptionClick(onDeleteOldItems)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Xóa items cũ (sau 14 ngày)
              </button>
            )}
            
            <div className="menu-divider"></div>
            
            <button 
              className="menu-option menu-option-danger"
              onClick={() => handleOptionClick(onDelete)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Xóa cột
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .column-menu {
          position: relative;
        }

        .menu-trigger {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .menu-trigger:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 1000;
          min-width: 200px;
          overflow: hidden;
        }

        .menu-header {
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .menu-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .menu-divider {
          height: 1px;
          background: #e5e7eb;
        }

        .menu-options {
          padding: 8px 0;
        }

        .menu-option {
          width: 100%;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #374151;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .menu-option:hover {
          background: #f3f4f6;
        }

        .menu-option-warning {
          color: #f59e0b;
        }

        .menu-option-warning:hover {
          background: #fef3c7;
        }

        .menu-option-danger {
          color: #ef4444;
        }

        .menu-option-danger:hover {
          background: #fee2e2;
        }
      `}</style>
    </div>
  );
};
