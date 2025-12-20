"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import "@/app/styles/forgot-password.scss";

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
      toast.error("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setStatus("success");
        setMessage(
          result.message ||
            "Password reset link has been sent to your email!"
        );
        toast.success(
          "Password reset link has been sent to your email!"
        );
      } else {
        setStatus("error");
        setMessage(
          result.error ||
            "Unable to send password reset link. Please try again."
        );
        toast.error(result.error || "Unable to send password reset link.");
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setStatus("error");
      setMessage("An error occurred. Please try again later.");
      toast.error("An error occurred. Please try again later.");
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
          iconColor: "text-orange",
          title: "Forgot Password",
        };
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-orange",
          title: "Check Your Email",
        };
      case "error":
        return {
          icon: AlertCircle,
          iconColor: "text-orange",
          title: "Request Failed",
        };
      default:
        return {
          icon: Mail,
          iconColor: "text-gray",
          title: "Forgot Password",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="forgot-password">
      <div className="forgot-password__container">
        <div className="forgot-password__content">
          {/* Icon */}
          <div className="forgot-password__icon-wrapper">
            <IconComponent className={config.iconColor} />
          </div>

          {/* Title */}
          <h1 className="forgot-password__title">
            {config.title}
          </h1>

          {/* Subtitle */}
          {status === "input" && (
            <p className="forgot-password__subtitle">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          )}

          {/* Message */}
          {message && (
            <div className="forgot-password__message">
              <p>{message}</p>
            </div>
          )}

          {/* Email Input Form */}
          {status === "input" && (
            <div className="forgot-password__form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="forgot-password__input"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleForgotPassword();
                  }
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="forgot-password__actions">
            {status === "input" && (
              <>
                <button
                  onClick={handleForgotPassword}
                  className="forgot-password__button forgot-password__button--primary"
                  disabled={!email || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <button
                  onClick={handleGoToSignIn}
                  className="forgot-password__button forgot-password__button--outline-orange"
                >
                  <ArrowLeft />
                  Back to Sign In
                </button>
              </>
            )}

            {status === "success" && (
              <>
                <button
                  onClick={handleGoToSignIn}
                  className="forgot-password__button forgot-password__button--primary"
                >
                  Back to Sign In
                </button>

                <button
                  onClick={handleGoHome}
                  className="forgot-password__button forgot-password__button--outline-orange"
                >
                  Back to Home
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <button
                  onClick={handleTryAgain}
                  className="forgot-password__button forgot-password__button--primary"
                >
                  Try Again
                </button>

                <button
                  onClick={handleGoToSignIn}
                  className="forgot-password__button forgot-password__button--outline-orange"
                >
                  Back to Sign In
                </button>
              </>
            )}
          </div>

          {/* Additional Info */}
          {status === "success" && (
            <div className="forgot-password__info-box forgot-password__info-box--orange">
              <h3>
                What's Next?
              </h3>
              <ul>
                <li>• Check your email for the password reset link</li>
                <li>• The link will expire in 24 hours</li>
                <li>• If you don't see the email, check your spam folder</li>
                <li>• Click the link to create a new password</li>
              </ul>
            </div>
          )}

          {status === "error" && (
            <div className="forgot-password__info-box forgot-password__info-box--orange">
              <h3>
                Troubleshooting:
              </h3>
              <ul>
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
