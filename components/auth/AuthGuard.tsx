"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { isAuthenticated } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { userId, email, role } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();

      setIsUserAuthenticated(authenticated);
      setIsLoading(false);

      if (!authenticated) {
        console.log("User not authenticated, redirecting to sign-in");
        router.push("/landing");
      }
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100);

    return () => clearTimeout(timer);
  }, [userId, email, role, router]);

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

  if (!isUserAuthenticated) {
    return null; // Will redirect to sign-in
  }

  return <>{children}</>;
};

export default AuthGuard;
