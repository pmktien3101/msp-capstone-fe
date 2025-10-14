"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { isAuthenticated, getCurrentUser, getAccessToken, getRefreshToken } from "@/lib/auth";
import { isTokenExpired, isValidJwtFormat } from "@/lib/jwt";
import { api } from "@/services/api";

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
    const checkAuth = async () => {
      const token = getAccessToken();
      const refreshToken = getRefreshToken();
      
      // If no token at all, redirect to sign-in
      if (!token) {
        console.log("No access token found, redirecting to sign-in");
        setHasPermission(false);
        router.push("/landing");
        setIsLoading(false);
        return;
      }
      
      // If token is expired, check if we have refresh token
      if (isTokenExpired(token)) {
        console.log("Token expired - checking refresh token availability");
        
        if (!refreshToken) {
          console.log("No refresh token available - redirecting to sign-in");
          setHasPermission(false);
          router.push("/landing");
          return;
        }
        
        // Make a test request to trigger api interceptors
        try {
          console.log("Attempting to refresh token via test request");
          // Use a simple GET request to trigger interceptors
          await api.get('/auth/me'); // This will trigger the request interceptor
          
          // After request, check if token was refreshed
          setTimeout(() => {
            const authenticated = isAuthenticated();
            const user = getCurrentUser();
            
            if (authenticated && user) {
              // Check role-based access
              if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
                console.log(`User role ${user.role} not authorized for this route`);
                setHasPermission(false);
                router.push("/dashboard");
                return;
              }
              
              setHasPermission(true);
              setIsUserAuthenticated(true);
            } else {
              setHasPermission(false);
              router.push("/landing");
            }
          }, 500); // Wait 500ms for refresh to complete
          
        } catch (error) {
          console.log("Test request failed - refresh token invalid or expired");
          // If refresh failed, user needs to login again
          setHasPermission(false);
          router.push("/landing");
        }
        return;
      } else {
        // Token is valid
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
