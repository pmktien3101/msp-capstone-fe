import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  maxPageButtons?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  maxPageButtons = 5,
}) => {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if near the start
      if (currentPage <= 3) {
        endPage = Math.min(maxPageButtons - 1, totalPages - 1);
      }

      // Adjust if near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPageButtons - 2));
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination-container">
      {/* {showInfo && (
        <div className="pagination-info">
          Hiển thị {startIndex + 1}-{endIndex} trong tổng số {totalItems} mục
        </div>
      )} */}
      
      <div className="pagination-controls">
        <button
          className="pagination-btn pagination-nav"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          title="Trang trước"
          aria-label="Trang trước"
        >
          ‹
        </button>

        {pageNumbers.map((page, index) => (
          <button
            key={`${page}-${index}`}
            className={`pagination-btn ${
              page === currentPage ? 'active' : ''
            } ${page === '...' ? 'ellipsis' : ''}`}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
            aria-label={typeof page === 'number' ? `Trang ${page}` : 'More pages'}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        <button
          className="pagination-btn pagination-nav"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          title="Trang sau"
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>

      <style jsx>{`
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 12px 12px;
          margin-top: 16px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pagination-info {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pagination-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 12px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-btn:hover:not(:disabled):not(.ellipsis) {
          border-color: #FF5E13;
          background: #FFF5F0;
          color: #FF5E13;
        }

        .pagination-btn.active {
          background: linear-gradient(135deg, #FF5E13 0%, #FF8C42 100%);
          color: white;
          border-color: #FF5E13;
          box-shadow: 0 2px 8px rgba(255, 94, 19, 0.3);
        }

        .pagination-btn.active:hover {
          background: linear-gradient(135deg, #FF5E13 0%, #FF8C42 100%);
          color: white;
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f8fafc;
          color: #94a3b8;
        }

        .pagination-btn.ellipsis {
          border: none;
          background: transparent;
          cursor: default;
          pointer-events: none;
        }

        .pagination-btn.pagination-nav {
          font-size: 18px;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .pagination-container {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .pagination-info {
            text-align: center;
          }

          .pagination-controls {
            justify-content: center;
          }

          .pagination-btn {
            min-width: 32px;
            height: 32px;
            padding: 0 8px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;
