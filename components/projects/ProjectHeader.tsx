'use client';

import { Button } from "@/components/ui/button";
import { useProjectModal } from "@/contexts/ProjectModalContext";
import { useUser } from "@/hooks/useUser";
import { Plus } from 'lucide-react';

export function ProjectHeader() {
  const { openCreateModal } = useProjectModal();
  const { role } = useUser();

  // Check if user can create projects (not a member)
  const canCreateProject = role !== 'Member';

  return (
    <div className="page-header">
      <div className="header-content">
        <div className="header-title">
          <h1>Tất Cả Dự Án</h1>
          <p>Quản lý và theo dõi tất cả các dự án của bạn</p>
        </div>
        <div className="header-actions">
          {canCreateProject && (
            <Button 
              onClick={openCreateModal} 
              variant="default"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                color: '#FF5E13',
                border: '2px solid #FF5E13',
                borderRadius: '12px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(255, 94, 19, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF5E13 0%, #f97316 100%)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 94, 19, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                e.currentTarget.style.color = '#FF5E13';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 94, 19, 0.2)';
              }}
            >
              <Plus size={16} />
              Tạo Dự Án Mới
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-header {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(248, 250, 252, 0.9) 50%,
            rgba(255, 255, 255, 0.95) 100%);
          backdrop-filter: blur(10px);
          border-bottom: 2px solid rgba(255, 94, 19, 0.1);
          padding: 20px 0;
          margin-bottom: 24px;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          position: relative;
          overflow: hidden;
        }

        .page-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, 
            #FF5E13 0%, 
            #ff7c3e 25%, 
            #ffa463 50%, 
            #ff7c3e 75%, 
            #FF5E13 100%);
          background-size: 300% 100%;
          animation: shimmer 4s ease-in-out infinite;
          box-shadow: 0 2px 8px rgba(255, 94, 19, 0.3);
        }

        @keyframes shimmer {
          0%, 100% { background-position: 300% 0; }
          50% { background-position: -300% 0; }
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        .header-title h1 {
          margin: 0 0 12px 0;
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, 
            #1f2937 0%, 
            #374151 50%, 
            #1f2937 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.025em;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .header-title p {
          margin: 0;
          font-size: 18px;
          color: #64748b;
          font-weight: 500;
          opacity: 0.9;
          line-height: 1.6;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .header-content {
            max-width: 100%;
            padding: 0 20px;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 24px 0;
            margin-bottom: 24px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            padding: 0 16px;
          }

          .header-title h1 {
            font-size: 28px;
          }

          .header-title p {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .page-header {
            padding: 20px 0;
            margin-bottom: 20px;
          }

          .header-content {
            padding: 0 12px;
            gap: 16px;
          }

          .header-title h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
