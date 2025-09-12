'use client';

import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="loading-skeleton-container">
      {/* Header Skeleton */}
      <div className="header-skeleton">
        <div className="header-content">
          <div className="logo-skeleton loading-skeleton"></div>
          <div className="search-skeleton loading-skeleton"></div>
          <div className="user-skeleton loading-skeleton"></div>
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="body-skeleton">
        {/* Sidebar Skeleton */}
        <div className="sidebar-skeleton">
          <div className="sidebar-item-skeleton loading-skeleton"></div>
          <div className="sidebar-item-skeleton loading-skeleton"></div>
          <div className="sidebar-item-skeleton loading-skeleton"></div>
          <div className="sidebar-item-skeleton loading-skeleton"></div>
          <div className="sidebar-item-skeleton loading-skeleton"></div>
        </div>

        {/* Content Skeleton */}
        <div className="content-skeleton">
          <div className="content-header-skeleton loading-skeleton"></div>
          <div className="content-grid-skeleton">
            <div className="card-skeleton loading-skeleton"></div>
            <div className="card-skeleton loading-skeleton"></div>
            <div className="card-skeleton loading-skeleton"></div>
            <div className="card-skeleton loading-skeleton"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading-skeleton-container {
          width: 100vw;
          height: 100vh;
          background: #F9F4EE;
          display: flex;
          flex-direction: column;
        }

        .header-skeleton {
          width: 100%;
          height: 90px;
          background: white;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
          display: flex;
          align-items: center;
          padding: 0 24px;
        }

        .header-content {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-skeleton {
          width: 200px;
          height: 40px;
          border-radius: 8px;
        }

        .search-skeleton {
          width: 300px;
          height: 44px;
          border-radius: 6px;
        }

        .user-skeleton {
          width: 200px;
          height: 50px;
          border-radius: 25px;
        }

        .body-skeleton {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .sidebar-skeleton {
          width: 300px;
          height: 100%;
          background: white;
          border-right: 1px solid #FFDBBD;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-item-skeleton {
          width: 100%;
          height: 50px;
          border-radius: 8px;
        }

        .content-skeleton {
          flex: 1;
          height: 100%;
          background: #F9F4EE;
          padding: 24px;
        }

        .content-header-skeleton {
          width: 100%;
          height: 60px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .content-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .card-skeleton {
          width: 100%;
          height: 200px;
          border-radius: 12px;
        }

        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;
