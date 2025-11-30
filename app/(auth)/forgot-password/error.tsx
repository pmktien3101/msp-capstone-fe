"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            An Error Occurred
          </h1>

          {/* Error Message */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              An unexpected error occurred while loading the password recovery page.
            </p>
            <p className="text-sm text-gray-500">
              Please try again or contact support if the issue persists.
            </p>
          </div>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Error Details (Development):
              </h3>
              <p className="text-xs text-red-700 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={handleGoToSignIn}
              variant="outline"
              className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              Sign In
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Back to Home
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="text-sm font-medium text-orange-800 mb-2">
              Need Help?
            </h3>
            <p className="text-xs text-orange-700">
              If the issue persists, please contact us via support email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
