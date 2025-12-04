"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";

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
      setMessage("Email và token là bắt buộc.");
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
    if (inviteTokenParam) {
      setInviteToken(inviteTokenParam);
    }
    setStatus("loading"); // Trạng thái sẵn sàng để xác nhận
  }, [searchParams]);

  const handleConfirmEmail = async () => {
    if (!email || !token || isConfirming) return;

    setIsConfirming(true);

    try {
      const result = await authService.confirmEmail(email, token, inviteToken ?? undefined);

      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Email đã được xác nhận thành công!");
        toast.success("Email đã được xác nhận thành công!");
      } else {
        // Kiểm tra nếu token hết hạn
        if (result.error?.toLowerCase().includes("expired") ||
          result.error?.toLowerCase().includes("hết hạn")) {
          setStatus("expired");
          setMessage(result.error || "Token xác nhận đã hết hạn.");
        } else {
          setStatus("error");
          setMessage(result.error || "Xác nhận email thất bại. Token có thể đã hết hạn hoặc không hợp lệ.");
        }
        toast.error(result.error || "Xác nhận email thất bại.");
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      setStatus("error");
      setMessage("Có lỗi xảy ra khi xác nhận email. Vui lòng thử lại sau.");
      toast.error("Có lỗi xảy ra khi xác nhận email.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;

    try {
      const result = await authService.resendConfirmation(email);

      if (result.success) {
        toast.success("Email xác nhận đã được gửi lại!");
        setMessage(result.message || "Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.");
      } else {
        toast.error(result.error || "Gửi lại email thất bại.");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error("Có lỗi xảy ra khi gửi lại email.");
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
          iconColor: "text-orange-500",
          title: "Xác nhận email",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          title: "Xác nhận email thành công!",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          title: "Xác nhận email thất bại",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      case "expired":
        return {
          icon: AlertCircle,
          iconColor: "text-yellow-500",
          title: "Token đã hết hạn",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      default:
        return {
          icon: Mail,
          iconColor: "text-gray-500",
          title: "Xác nhận email",
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

          {/* Actions */}
          <div className="space-y-3">
            {status === "loading" && (
              <Button
                onClick={handleConfirmEmail}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!email || !token || isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xác nhận...
                  </>
                ) : (
                  "Xác nhận email"
                )}
              </Button>
            )}

            {status === "success" && (
              <Button
                onClick={handleGoToSignIn}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Đăng nhập ngay
              </Button>
            )}

            {(status === "error" || status === "expired") && (
              <>
                <Button
                  onClick={handleConfirmEmail}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xác nhận...
                    </>
                  ) : (
                    "Thử lại"
                  )}
                </Button>
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Gửi lại email xác nhận
                </Button>
                <Button
                  onClick={handleGoToSignIn}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Quay lại đăng nhập
                </Button>
              </>
            )}
          </div>

          {/* Additional Info */}
          {(status === "error" || status === "expired") && (
            <div className={`mt-6 p-4 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                Lưu ý:
              </h3>
              <ul className="text-xs text-gray-700 space-y-1 text-left">
                <li>• Token xác nhận có thể đã hết hạn</li>
                <li>• Link xác nhận có thể đã được sử dụng</li>
                <li>• Vui lòng kiểm tra email spam nếu không thấy email</li>
                <li>• Liên hệ admin nếu vấn đề vẫn tiếp diễn</li>
              </ul>
            </div>
          )}

          {status === "success" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Chúc mừng!
              </h3>
              <p className="text-xs text-green-700">
                Tài khoản của bạn đã được xác nhận thành công. Bây giờ bạn có thể đăng nhập và sử dụng tất cả các tính năng của hệ thống.
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
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
