"use client";

import { useEffect } from "react";
import { XCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import "@/app/styles/forgot-password.scss";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Forgot password error:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoToSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <div className="forgot-password__error">
      <div className="forgot-password__error-container">
        <div className="forgot-password__error-content">
          {/* Error Icon */}
          <div className="forgot-password__error-icon-wrapper">
            <XCircle />
          </div>

          {/* Error Title */}
          <h1 className="forgot-password__error-title">
            An Error Occurred
          </h1>

          {/* Error Message */}
          <div className="forgot-password__error-message">
            <p>
              An unexpected error occurred while loading the password recovery page.
            </p>
            <p className="text-sm">
              Please try again or contact support if the issue persists.
            </p>
          </div>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="forgot-password__error-details">
              <h3>
                Error Details (Development):
              </h3>
              <p>
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="forgot-password__error-actions">
            <button
              onClick={reset}
              className="forgot-password__error-button forgot-password__error-button--primary"
            >
              <RefreshCw />
              Try Again
            </button>
            
            <button
              onClick={handleGoToSignIn}
              className="forgot-password__error-button forgot-password__error-button--outline-orange"
            >
              Sign In
            </button>
            
            <button
              onClick={handleGoHome}
              className="forgot-password__error-button forgot-password__error-button--outline-gray"
            >
              Back to Home
            </button>
          </div>

          {/* Support Info */}
          <div className="forgot-password__error-support">
            <h3>
              Need Help?
            </h3>
            <p>
              If the issue persists, please contact us via support email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
