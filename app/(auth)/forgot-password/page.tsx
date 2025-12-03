"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";

type Status = "input" | "success" | "error";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("input");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setStatus("success");
        setMessage(
          result.message ||
            "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!"
        );
        toast.success(
          "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!"
        );
      } else {
        setStatus("error");
        setMessage(
          result.error ||
            "Không thể gửi liên kết đặt lại mật khẩu. Vui lòng thử lại."
        );
        toast.error(result.error || "Không thể gửi liên kết đặt lại mật khẩu.");
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setStatus("error");
      setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    router.push("/sign-in");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleTryAgain = () => {
    setStatus("input");
    setEmail("");
    setMessage("");
  };

  const getStatusConfig = () => {
    switch (status) {
      case "input":
        return {
          icon: Mail,
          iconColor: "text-orange-500",
          title: "Forgot Password",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-orange-500",
          title: "Check Your Email",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case "error":
        return {
          icon: AlertCircle,
          iconColor: "text-orange-500",
          title: "Request Failed",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      default:
        return {
          icon: Mail,
          iconColor: "text-gray-500",
          title: "Forgot Password",
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {config.title}
          </h1>

          {/* Subtitle */}
          {status === "input" && (
            <p className="text-sm text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          )}

          {/* Message */}
          {message && (
            <div className="mb-6">
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
          )}

          {/* Email Input Form */}
          {status === "input" && (
            <div className="mb-6">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleForgotPassword();
                  }
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {status === "input" && (
              <>
                <Button
                  onClick={handleForgotPassword}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={!email || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <Button
                  onClick={handleGoToSignIn}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </>
            )}

            {status === "success" && (
              <>
                <Button
                  onClick={handleGoToSignIn}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Back to Sign In
                </Button>

                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Back to Home
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <Button
                  onClick={handleTryAgain}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Try Again
                </Button>

                <Button
                  onClick={handleGoToSignIn}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Back to Sign In
                </Button>
              </>
            )}
          </div>

          {/* Additional Info */}
          {status === "success" && (
            <div
              className={`mt-6 p-4 ${config.bgColor} border ${config.borderColor} rounded-lg`}
            >
              <h3 className="text-sm font-medium text-orange-800 mb-2">
                What's Next?
              </h3>
              <ul className="text-xs text-orange-700 space-y-1 text-left">
                <li>• Check your email for the password reset link</li>
                <li>• The link will expire in 24 hours</li>
                <li>• If you don't see the email, check your spam folder</li>
                <li>• Click the link to create a new password</li>
              </ul>
            </div>
          )}

          {status === "error" && (
            <div
              className={`mt-6 p-4 ${config.bgColor} border ${config.borderColor} rounded-lg`}
            >
              <h3 className="text-sm font-medium text-orange-800 mb-2">
                Troubleshooting:
              </h3>
              <ul className="text-xs text-orange-700 space-y-1 text-left">
                <li>• Make sure you entered the correct email address</li>
                <li>• Check your spam folder for the reset email</li>
                <li>• Try again in a few moments</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
