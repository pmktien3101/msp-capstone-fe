'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { GlobalModals } from './GlobalModals';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Simulate loading time for CSS and components
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Very short delay to ensure CSS is loaded

    return () => clearTimeout(timer);
  }, []);

  // if (isLoading) {
  //   return <LoadingSkeleton />;
  // }

  return (
    <div className="main-layout">
      <div className="layout-header">
        <Header />
      </div>
      
      <div className="layout-body">
        <div className={`layout-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <Sidebar onCollapsedChange={setIsSidebarCollapsed} />
        </div>
        
        <div className="layout-content">
          {children}
        </div>
      </div>

      {/* Global Modals */}
      <GlobalModals />

      <style jsx>{`
        .main-layout {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #F9F4EE;
          overflow: hidden;
        }

        .layout-header {
          width: 100%;
          height: 90px;
          flex-shrink: 0;
          z-index: 1000;
        }

        .layout-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .layout-sidebar {
          width: 300px;
          height: 100%;
          flex-shrink: 0;
          background: white;
          border-right: 1px solid #FFDBBD;
          transition: width 0.3s ease;
        }

        .layout-sidebar.collapsed {
          width: 70px;
        }

        .layout-content {
          flex: 1;
          height: 100%;
          overflow-y: auto;
          background: #F9F4EE;
          padding: 24px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .layout-sidebar {
            width: 250px;
          }
          
          .layout-content {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .layout-sidebar {
            width: 200px;
          }
          
          .layout-content {
            padding: 12px;
          }
        }

        /* Custom Scrollbar */
        .layout-content::-webkit-scrollbar {
          width: 8px;
        }

        .layout-content::-webkit-scrollbar-track {
          background: #FDF0D2;
          border-radius: 4px;
        }

        .layout-content::-webkit-scrollbar-thumb {
          background: #FFA463;
          border-radius: 4px;
        }

        .layout-content::-webkit-scrollbar-thumb:hover {
          background: #FF5E13;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
