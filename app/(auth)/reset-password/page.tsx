"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Lock,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import "@/app/styles/reset-password.scss";

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
      toast.error("Password must be at least 6 characters.");
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
        setMessage(result.message || "Password reset successfully!");
        toast.success("Password reset successfully!");
      } else {
        if (
          result.error?.toLowerCase().includes("expired") ||
          result.error?.toLowerCase().includes("hết hạn")
        ) {
          setStatus("expired");
          setMessage(result.error || "Reset token has expired.");
        } else {
          setStatus("error");
          setMessage(
            result.error ||
              "Password reset failed. Token may have expired or is invalid."
          );
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
          iconColor: "text-orange",
          title: "Reset Password",
        };
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-orange",
          title: "Password Reset Successfully!",
        };
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-orange",
          title: "Password Reset Failed",
        };
      case "expired":
        return {
          icon: AlertCircle,
          iconColor: "text-orange",
          title: "Token Expired",
        };
      default:
        return {
          icon: Lock,
          iconColor: "text-gray",
          title: "Reset Password",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="reset-password">
      <div className="reset-password__container">
        <div className="reset-password__content">
          {/* Icon */}
          <div className="reset-password__icon-wrapper">
            <IconComponent className={config.iconColor} />
          </div>

          {/* Title */}
          <h1 className="reset-password__title">
            {config.title}
          </h1>

          {/* Message */}
          <div className="reset-password__message">
            <p>{message}</p>
            {email && (
              <p className="text-sm">
                Email: <span>{email}</span>
              </p>
            )}
          </div>

          {/* Password Input Form */}
          {status === "input" && (
            <div className="reset-password__form">
              {/* New Password */}
              <div className="reset-password__input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="reset-password__input"
                  disabled={isResetting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="reset-password__toggle-password"
                  disabled={isResetting}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="reset-password__input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="reset-password__input"
                  disabled={isResetting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="reset-password__toggle-password"
                  disabled={isResetting}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="reset-password__requirements">
                <p>Password requirements:</p>
                <ul>
                  <li className={newPassword.length >= 6 ? "valid" : "invalid"}>
                    ✓ At least 6 characters
                  </li>
                  <li className={newPassword === confirmPassword && newPassword ? "valid" : "invalid"}>
                    ✓ Passwords match
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="reset-password__actions">
            {status === "input" && (
              <button
                onClick={handleResetPassword}
                className="reset-password__button reset-password__button--primary"
                disabled={
                  !email ||
                  !token ||
                  isResetting ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isResetting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            )}

            {status === "success" && (
              <button
                onClick={handleGoToSignIn}
                className="reset-password__button reset-password__button--primary"
              >
                Sign In Now
              </button>
            )}

            {(status === "error" || status === "expired") && (
              <>
                <button
                  onClick={handleResetPassword}
                  className="reset-password__button reset-password__button--primary"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </button>
                <button
                  onClick={handleGoToSignIn}
                  className="reset-password__button reset-password__button--gray"
                >
                  Back to Sign In
                </button>
              </>
            )}
          </div>

          {/* Additional Info */}
          {(status === "error" || status === "expired") && (
            <div className="reset-password__info-box reset-password__info-box--orange">
              <h3>Note:</h3>
              <ul>
                <li>• Reset token may have expired</li>
                <li>• Link may have already been used</li>
                <li>• Request a new password reset if needed</li>
                <li>• Contact admin if the issue persists</li>
              </ul>
            </div>
          )}

          {status === "success" && (
            <div className="reset-password__info-box reset-password__info-box--orange">
              <h3>
                Congratulations!
              </h3>
              <p>
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>
            </div>
          )}

          {/* Home button */}
          <div className="reset-password__home-button">
            <button
              onClick={handleGoHome}
              className="reset-password__button reset-password__button--outline-gray"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
