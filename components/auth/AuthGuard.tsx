"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { isAuthenticated, getCurrentUser, getAccessToken } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

const AuthGuard = ({ 
  children, 
  fallback, 
  requiredPermissions = [], 
  requiredRoles = [] 
}: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const { userId, email, role } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken();
      
      // If no token at all, redirect to sign-in
      if (!token) {
        console.log("No access token found, redirecting to sign-in");
        setHasPermission(false);
        router.push("/landing");
        setIsLoading(false);
        return;
      }
      
      // Check if user is authenticated (don't check token expiration here)
      const authenticated = isAuthenticated();
      const user = getCurrentUser();
      
      setIsUserAuthenticated(authenticated);
      
      if (authenticated && user) {
        // Check role-based access
        if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
          console.log(`User role ${user.role} not authorized for this route`);
          setHasPermission(false);
          router.push("/dashboard");
          return;
        }
        
        setHasPermission(true);
      } else {
        setHasPermission(false);
        console.log("User not authenticated, redirecting to sign-in");
        router.push("/landing");
      }
      
      setIsLoading(false);
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100);

    return () => clearTimeout(timer);
  }, [userId, email, role, router, requiredRoles, requiredPermissions]);

  if (isLoading) {
    return (
      fallback || (
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>Đang kiểm tra xác thực...</p>
          <style jsx>{`
            .auth-loading {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: #f9fafb;
            }

            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #e5e7eb;
              border-top: 4px solid #ff5e13;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 16px;
            }

            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }

            p {
              color: #6b7280;
              font-size: 14px;
              margin: 0;
            }
          `}</style>
        </div>
      )
    );
  }

  if (!isUserAuthenticated || !hasPermission) {
    return null; // Will redirect to appropriate page
  }

  return <>{children}</>;
};

export default AuthGuard;
