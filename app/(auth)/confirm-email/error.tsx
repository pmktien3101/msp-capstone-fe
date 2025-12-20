"use client";

import { useEffect } from "react";
import { XCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import "@/app/styles/confirm-email.scss";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Confirm email error:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoToSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <div className="confirm-email__error">
      <div className="confirm-email__error-container">
        <div className="confirm-email__error-content">
          {/* Error Icon */}
          <div className="confirm-email__error-icon-wrapper">
            <XCircle />
          </div>

          {/* Error Title */}
          <h1 className="confirm-email__error-title">
            An Error Occurred
          </h1>

          {/* Error Message */}
          <div className="confirm-email__error-message">
            <p>
              An unexpected error occurred while loading the email confirmation page.
            </p>
            <p className="text-sm">
              Please try again or contact support if the problem persists.
            </p>
          </div>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="confirm-email__error-details">
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
          <div className="confirm-email__error-actions">
            <button
              onClick={reset}
              className="confirm-email__error-button confirm-email__error-button--primary"
            >
              <RefreshCw />
              Try Again
            </button>
            
            <button
              onClick={handleGoToSignIn}
              className="confirm-email__error-button confirm-email__error-button--outline-orange"
            >
              Sign In
            </button>
            
            <button
              onClick={handleGoHome}
              className="confirm-email__error-button confirm-email__error-button--outline-gray"
            >
              Go to Home
            </button>
          </div>

          {/* Support Info */}
          <div className="confirm-email__error-support">
            <h3>
              Need Help?
            </h3>
            <p>
              If the problem persists, please contact us via support email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
