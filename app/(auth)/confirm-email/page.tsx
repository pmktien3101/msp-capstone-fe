"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Mail, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import "@/app/styles/confirm-email.scss";

type Status = "loading" | "success" | "error" | "expired";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    const inviteTokenParam = searchParams.get("inviteToken");

    if (!emailParam || !tokenParam) {
      setStatus("error");
      setMessage("Email and token are required.");
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
    if (inviteTokenParam) {
      setInviteToken(inviteTokenParam);
    }
    setStatus("loading"); // Ready to confirm
  }, [searchParams]);

  const handleConfirmEmail = async () => {
    if (!email || !token || isConfirming) return;

    setIsConfirming(true);

    try {
      const result = await authService.confirmEmail(email, token, inviteToken ?? undefined);

      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Email has been confirmed successfully!");
        toast.success("Email has been confirmed successfully!");
      } else {
        // Check if token expired
        if (result.error?.toLowerCase().includes("expired") ||
          result.error?.toLowerCase().includes("hết hạn")) {
          setStatus("expired");
          setMessage(result.error || "Confirmation token has expired.");
        } else {
          setStatus("error");
          setMessage(result.error || "Email confirmation failed. Token may have expired or is invalid.");
        }
        toast.error(result.error || "Email confirmation failed.");
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      setStatus("error");
      setMessage("An error occurred while confirming email. Please try again later.");
      toast.error("An error occurred while confirming email.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;

    try {
      const result = await authService.resendConfirmation(email);

      if (result.success) {
        toast.success("Confirmation email has been resent!");
        setMessage(result.message || "Confirmation email has been resent. Please check your inbox.");
      } else {
        toast.error(result.error || "Failed to resend email.");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error("An error occurred while resending email.");
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
      case "loading":
        return {
          icon: Clock,
          iconColor: "text-orange",
          title: "Confirm Email",
        };
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green",
          title: "Email Confirmed Successfully!",
        };
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-red",
          title: "Email Confirmation Failed",
        };
      case "expired":
        return {
          icon: AlertCircle,
          iconColor: "text-yellow",
          title: "Token Has Expired",
        };
      default:
        return {
          icon: Mail,
          iconColor: "text-gray",
          title: "Confirm Email",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="confirm-email">
      <div className="confirm-email__container">
        <div className="confirm-email__content">
          {/* Icon */}
          <div className="confirm-email__icon-wrapper">
            <IconComponent className={config.iconColor} />
          </div>

          {/* Title */}
          <h1 className="confirm-email__title">
            {config.title}
          </h1>

          {/* Message */}
          <div className="confirm-email__message">
            <p>{message}</p>
            {email && (
              <p className="confirm-email__email-display">
                Email: <span className="confirm-email__email-value">{email}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="confirm-email__actions">
            {status === "loading" && (
              <button
                onClick={handleConfirmEmail}
                className="confirm-email__button confirm-email__button--primary"
                disabled={!email || !token || isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Email"
                )}
              </button>
            )}

            {status === "success" && (
              <button
                onClick={handleGoToSignIn}
                className="confirm-email__button confirm-email__button--primary"
              >
                Sign In Now
              </button>
            )}

            {(status === "error" || status === "expired") && (
              <>
                <button
                  onClick={handleConfirmEmail}
                  className="confirm-email__button confirm-email__button--primary"
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </button>
                <button
                  onClick={handleResendEmail}
                  className="confirm-email__button confirm-email__button--outline-orange"
                >
                  Resend Confirmation Email
                </button>
                <button
                  onClick={handleGoToSignIn}
                  className="confirm-email__button confirm-email__button--gray"
                >
                  Back to Sign In
                </button>
              </>
            )}
          </div>

          {/* Additional Info */}
          {(status === "error" || status === "expired") && (
            <div className={`confirm-email__info-box confirm-email__info-box--${status === "error" ? "error" : "warning"}`}>
              <h3 className="confirm-email__info-box-title">
                Note:
              </h3>
              <div className="confirm-email__info-box-content">
                <ul>
                  <li>• Confirmation token may have expired</li>
                  <li>• Confirmation link may have already been used</li>
                  <li>• Please check spam folder if you don't see the email</li>
                  <li>• Contact admin if the problem persists</li>
                </ul>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="confirm-email__info-box confirm-email__info-box--success">
              <h3 className="confirm-email__info-box-title">
                Congratulations!
              </h3>
              <div className="confirm-email__info-box-content">
                <p>
                  Your account has been confirmed successfully. You can now sign in and use all the features of the system.
                </p>
              </div>
            </div>
          )}

          {/* Home button */}
          <div className="confirm-email__home-button">
            <button
              onClick={handleGoHome}
              className="confirm-email__button confirm-email__button--outline-gray"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
