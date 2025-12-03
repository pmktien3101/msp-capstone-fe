"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/lib/rbac";

interface MemberGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  allowedRoles?: UserRole[];
}

const MemberGuard = ({
  children,
  fallback,
  allowedRoles = [UserRole.MEMBER],
}: MemberGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { role, userId, email } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkMemberAccess = () => {
      const authenticated = isAuthenticated();
      const user = getCurrentUser();

      if (!authenticated || !user) {
        console.log("User not authenticated, redirecting to sign-in");
        router.push("/sign-in");
        setIsLoading(false);
        return;
      }

      const userRole = user.role as UserRole;
      const hasAccess = allowedRoles.includes(userRole);

      if (hasAccess) {
        setIsAuthorized(true);
      } else {
        console.log(`User role ${user.role} not authorized for member access`);
        router.push("/dashboard");
      }

      setIsLoading(false);
    };

    const timer = setTimeout(checkMemberAccess, 100);
    return () => clearTimeout(timer);
  }, [role, router, allowedRoles]);

  if (isLoading) {
    return (
      fallback || (
        <div className="member-loading">
          <div className="loading-spinner"></div>
          <p>Checking for member access...</p>
          <style jsx>{`
            .member-loading {
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
              color: white;
              font-size: 14px;
              margin: 0;
            }
          `}</style>
        </div>
      )
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect to appropriate page
  }

  return <>{children}</>;
};

export default MemberGuard;
