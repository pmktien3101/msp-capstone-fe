'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { getAccessToken } from '@/lib/auth';
import { extractUserFromToken } from '@/lib/jwt';
import { normalizeRole } from '@/lib/rbac';

export default function DashboardPage() {
  const { role, setUserData } = useUser();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("Dashboard: useEffect 1, role:", role);
    // If role is not set, try to extract from token
    if (!role) {
      const token = getAccessToken();
      console.log("Dashboard: Token exists:", !!token);
      if (token) {
        try {
          const userInfo = extractUserFromToken(token);
          console.log("Dashboard: Extracted user info:", userInfo?.email, userInfo?.role);
          if (userInfo) {
            const normalizedRole = normalizeRole(userInfo.role);
            console.log("Dashboard: Setting user data with role:", normalizedRole);
            setUserData({
              userId: userInfo.userId,
              email: userInfo.email,
              fullName: userInfo.fullName,
              role: normalizedRole,
              avatarUrl: userInfo.avatarUrl || ''
            });
            setIsInitialized(true);
            return;
          }
        } catch (error) {
          console.error('Dashboard: Error extracting user from token:', error);
        }
      }
    } else {
      console.log("Dashboard: Role already set:", role);
    }
    setIsInitialized(true);
  }, [role, setUserData]);

  useEffect(() => {
    // Redirect based on user role
    console.log("Dashboard: useEffect 2, isInitialized:", isInitialized, "role:", role);
    if (isInitialized && role) {
      console.log("Dashboard: Redirecting based on role:", role);
      switch (role) {
        case 'Admin':
          console.log("Dashboard: Redirecting to /dashboard/admin/dashboard");
          router.push('/dashboard/admin/dashboard');
          break;
        case 'BusinessOwner':
          console.log("Dashboard: Redirecting to /dashboard/business");
          router.push('/dashboard/business');
          break;
        case 'Member':
          console.log("Dashboard: Redirecting to /dashboard/member");
          router.push('/dashboard/member');
          break;
        case 'pm':
        default:
          console.log("Dashboard: Redirecting to /dashboard/pm");
          router.push('/dashboard/pm');
          break;
      }
    }
  }, [role, router, isInitialized]);

  return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Redirecting to dashboard...</p>
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
