'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdminGuard = ({ children, fallback }: AdminGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { role, userId, email } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = () => {
      if (role === 'AdminSystem') {
        setIsAdmin(true);
      } else {
        console.log('User is not admin, redirecting to dashboard');
        router.push('/dashboard');
      }
      setIsLoading(false);
    };

    const timer = setTimeout(checkAdminAccess, 100);
    return () => clearTimeout(timer);
  }, [role, router]);

  if (isLoading) {
    return fallback || (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Đang kiểm tra quyền truy cập admin...</p>
        <style jsx>{`
          .admin-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: white;
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
};

export default AdminGuard;
