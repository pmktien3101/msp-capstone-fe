"use client";

import { useEffect } from "react";
import { XCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import "@/app/styles/reset-password.scss";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Reset password error:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoToSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <div className="reset-password__error">
      <div className="reset-password__error-container">
        <div className="reset-password__error-content">
          {/* Error Icon */}
          <div className="reset-password__error-icon-wrapper">
            <XCircle />
          </div>

          {/* Error Title */}
          <h1 className="reset-password__error-title">
            An Error Occurred
          </h1>

          {/* Error Message */}
          <div className="reset-password__error-message">
            <p>
              An unexpected error occurred while loading the password reset page.
            </p>
            <p className="text-sm">
              Please try again or contact support if the issue persists.
            </p>
          </div>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="reset-password__error-details">
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
          <div className="reset-password__error-actions">
            <button
              onClick={reset}
              className="reset-password__error-button reset-password__error-button--primary"
            >
              <RefreshCw />
              Try Again
            </button>
            
            <button
              onClick={handleGoToSignIn}
              className="reset-password__error-button reset-password__error-button--outline-orange"
            >
              Sign In
            </button>
            
            <button
              onClick={handleGoHome}
              className="reset-password__error-button reset-password__error-button--outline-gray"
            >
              Back to Home
            </button>
          </div>

          {/* Support Info */}
          <div className="reset-password__error-support">
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
