'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

export default function DashboardPage() {
  const { role } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on user role
    switch (role) {
      case 'AdminSystem':
        router.push('/dashboard/admin/dashboard');
        break;
      case 'BusinessOwner':
        router.push('/dashboard/business');
        break;
      case 'pm':
      default:
        router.push('/dashboard/pm');
        break;
    }
  }, [role, router]);

  return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Đang chuyển hướng đến dashboard phù hợp...</p>
      <style jsx>{`
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(135deg, #F9F4EE 0%, #FDF0D2 50%, #FFDBBD 100%);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #FF5E13;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        p {
          color: #0D062D;
          font-size: 16px;
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
