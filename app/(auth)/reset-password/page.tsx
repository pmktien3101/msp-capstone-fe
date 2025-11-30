"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";

type Status = "loading" | "success" | "error" | "expired" | "input";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("input");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (!emailParam || !tokenParam) {
      setStatus("error");
      setMessage("Email and token are required.");
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
    setStatus("input");
  }, [searchParams]);

  const validatePassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both password fields.");
      return false;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!email || !token || isResetting) return;

    if (!validatePassword()) return;

    setIsResetting(true);

    try {
      const result = await authService.resetPassword(email, token, newPassword);

      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Password has been reset successfully!");
        toast.success("Password has been reset successfully!");
      } else {
        if (result.error?.toLowerCase().includes("expired") || 
            result.error?.toLowerCase().includes("hết hạn")) {
          setStatus("expired");
          setMessage(result.error || "Reset token has expired.");
        } else {
          setStatus("error");
          setMessage(result.error || "Password reset failed. Token may have expired or is invalid.");
        }
        toast.error(result.error || "Password reset failed.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setStatus("error");
      setMessage("An error occurred while resetting password. Please try again later.");
      toast.error("An error occurred while resetting password.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoToSignIn = () => {
    router.push("/sign-in");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const getStatusConfig = () => {
    switch (status) {
      case "input":
        return {
          icon: Lock,
          iconColor: "text-orange-500",
          title: "Reset Password",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-orange-500",
          title: "Password Reset Successfully!",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-orange-500",
          title: "Password Reset Failed",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case "expired":
        return {
          icon: AlertCircle,
          iconColor: "text-orange-500",
          title: "Token Expired",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      default:
        return {
          icon: Lock,
          iconColor: "text-gray-500",
          title: "Reset Password",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <IconComponent className={`h-16 w-16 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {config.title}
          </h1>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">{message}</p>
            {email && (
              <p className="text-sm text-gray-500">
                Email: <span className="font-medium">{email}</span>
              </p>
            )}
          </div>

          {/* Password Input Form */}
          {status === "input" && (
            <div className="space-y-4 mb-6">
              {/* New Password */}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  disabled={isResetting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isResetting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  disabled={isResetting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isResetting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-600 text-left">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="space-y-1">
                  <li className={newPassword.length >= 6 ? "text-green-600" : "text-gray-600"}>
                    ✓ At least 6 characters
                  </li>
                  <li className={newPassword === confirmPassword && newPassword ? "text-green-600" : "text-gray-600"}>
                    ✓ Passwords match
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {status === "input" && (
              <Button
                onClick={handleResetPassword}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!email || !token || isResetting || !newPassword || !confirmPassword}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            )}

            {status === "success" && (
              <Button
                onClick={handleGoToSignIn}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Sign In Now
              </Button>
            )}

            {(status === "error" || status === "expired") && (
              <>
                <Button
                  onClick={handleResetPassword}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
                <Button
                  onClick={handleGoToSignIn}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Back to Sign In
                </Button>
              </>
            )}
          </div>

          {/* Additional Info */}
          {(status === "error" || status === "expired") && (
            <div className={`mt-6 p-4 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                Note:
              </h3>
              <ul className="text-xs text-gray-700 space-y-1 text-left">
                <li>• Reset token may have expired</li>
                <li>• Link may have already been used</li>
                <li>• Request a new password reset if needed</li>
                <li>• Contact admin if the issue persists</li>
              </ul>
            </div>
          )}

          {status === "success" && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="text-sm font-medium text-orange-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-xs text-orange-700">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
            </div>
          )}

          {/* Home button */}
          <div className="mt-4">
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
