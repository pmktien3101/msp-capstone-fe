"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import QRCode from "qrcode";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "expired"
  >("pending");

  const planId = searchParams.get("planId");
  const price = searchParams.get("price");
  const name = searchParams.get("name");
  const period = searchParams.get("period");

  useEffect(() => {
    // Generate QR code with payment information
    const generateQR = async () => {
      try {
        // In a real app, this would be a payment URL or payment data
        const paymentData = JSON.stringify({
          planId,
          price,
          name,
          period,
          timestamp: Date.now(),
        });

        const url = await QRCode.toDataURL(paymentData, {
          width: 300,
          margin: 2,
          color: {
            dark: "#FF5E13",
            light: "#FFFFFF",
          },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };

    generateQR();
  }, [planId, price, name, period]);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0 && paymentStatus === "pending") {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && paymentStatus === "pending") {
      setPaymentStatus("expired");
    }
  }, [countdown, paymentStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSimulatePayment = () => {
    setPaymentStatus("success");
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  if (paymentStatus === "success") {
    return (
      <div className="payment-page">
        <div className="success-container">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#10B981"
                strokeWidth="2"
                fill="#D1FAE5"
              />
              <path
                d="M8 12L11 15L16 9"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Thanh toán thành công!</h1>
          <p>Bạn đã nâng cấp lên gói {name} thành công.</p>
          <p className="redirect-text">Đang chuyển hướng...</p>
        </div>
        <style jsx>{`
          .payment-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fff5f0 0%, #fef7f0 100%);
            padding: 24px;
          }

          .success-container {
            text-align: center;
            background: white;
            padding: 48px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(255, 94, 19, 0.15);
            max-width: 500px;
            animation: slideUp 0.5s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .success-icon {
            margin-bottom: 24px;
            animation: scaleIn 0.5s ease-out 0.2s both;
          }

          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }

          .success-container h1 {
            font-size: 32px;
            font-weight: 700;
            color: #10b981;
            margin: 0 0 16px 0;
          }

          .success-container p {
            font-size: 16px;
            color: #475569;
            margin: 0 0 8px 0;
          }

          .redirect-text {
            color: #ff5e13;
            font-weight: 600;
            margin-top: 24px;
          }
        `}</style>
      </div>
    );
  }

  if (paymentStatus === "expired") {
    return (
      <div className="payment-page">
        <div className="expired-container">
          <div className="expired-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#DC2626"
                strokeWidth="2"
                fill="#FEE2E2"
              />
              <path
                d="M15 9L9 15M9 9L15 15"
                stroke="#DC2626"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1>Hết thời gian thanh toán</h1>
          <p>Mã QR đã hết hạn. Vui lòng thử lại.</p>
          <button className="back-btn" onClick={() => router.push("/")}>
            Quay lại trang chủ
          </button>
        </div>
        <style jsx>{`
          .payment-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fff5f0 0%, #fef7f0 100%);
            padding: 24px;
          }

          .expired-container {
            text-align: center;
            background: white;
            padding: 48px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(255, 94, 19, 0.15);
            max-width: 500px;
          }

          .expired-icon {
            margin-bottom: 24px;
          }

          .expired-container h1 {
            font-size: 32px;
            font-weight: 700;
            color: #dc2626;
            margin: 0 0 16px 0;
          }

          .expired-container p {
            font-size: 16px;
            color: #475569;
            margin: 0 0 32px 0;
          }

          .back-btn {
            padding: 14px 32px;
            background: linear-gradient(135deg, #ff5e13, #ff8c42);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
          }

          .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 94, 19, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container two-columns">
        {/* Left column: Info + timer + button */}
        <div className="left-column">
          <div className="payment-card">
            <div className="payment-header">
              <div className="header-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="#FF5E13"
                    strokeWidth="2"
                  />
                  <path d="M3 10H21" stroke="#FF5E13" strokeWidth="2" />
                  <circle cx="7" cy="15" r="1" fill="#FF5E13" />
                  <circle cx="11" cy="15" r="1" fill="#FF5E13" />
                </svg>
              </div>
              <h1>Thanh toán</h1>
              <p className="subtitle">Quét mã QR để hoàn tất thanh toán</p>
            </div>
            <div className="plan-info">
              <div className="info-row">
                <span className="label">Gói đăng ký:</span>
                <span className="value">{name}</span>
              </div>
              <div className="info-row">
                <span className="label">Chu kỳ:</span>
                <span className="value">
                  {period === "monthly" ? "Hàng tháng" : "Hàng năm"}
                </span>
              </div>
              <div className="info-row total">
                <span className="label">Tổng thanh toán:</span>
                <span className="value price">${price}</span>
              </div>
            </div>
            <div className="timer-section">
              <div className="timer-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#FF5E13"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 6V12L16 14"
                    stroke="#FF5E13"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="timer-text">Thời gian còn lại:</span>
              <span className="timer-value">{formatTime(countdown)}</span>
            </div>
          </div>
        </div>
        {/* Right column: QR + instructions */}
        <div className="right-column">
          <div className="qr-container">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt="QR Code"
                className="qr-code"
              />
            ) : (
              <div className="qr-loading">
                <div className="spinner"></div>
                <p>Đang tạo mã QR...</p>
              </div>
            )}
          </div>
          <div className="qr-instructions">
            <div className="instruction-item">
              <div className="step-number">1</div>
              <p>Mở ứng dụng ngân hàng hoặc ví điện tử</p>
            </div>
            <div className="instruction-item">
              <div className="step-number">2</div>
              <p>Chọn chức năng quét mã QR</p>
            </div>
            <div className="instruction-item">
              <div className="step-number">3</div>
              <p>Quét mã QR và xác nhận thanh toán</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-page {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #fff5f0 0%,
            #fef7f0 50%,
            #ffe8d9 100%
          );
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .payment-page::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(
            circle,
            rgba(255, 94, 19, 0.1) 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .payment-page::after {
          content: "";
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            rgba(255, 140, 66, 0.1) 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        .payment-container {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: white;
          border: 2px solid #ff5e13;
          color: #ff5e13;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(255, 94, 19, 0.1);
        }

        .back-button:hover {
          background: #ff5e13;
          color: white;
          transform: translateX(-4px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        .payment-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(255, 94, 19, 0.15);
          border: 1px solid rgba(255, 94, 19, 0.1);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .payment-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 2px solid #fff5f0;
        }

        .header-icon {
          display: inline-flex;
          padding: 16px;
          background: linear-gradient(135deg, #fff5f0, #ffe8d9);
          border-radius: 16px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.1);
        }

        .payment-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #0d062d;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 14px;
          color: #787486;
          margin: 0;
        }

        .plan-info {
          background: linear-gradient(135deg, #fff5f0, #fffbf7);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          border: 1px solid rgba(255, 94, 19, 0.1);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 94, 19, 0.1);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row.total {
          padding-top: 16px;
          margin-top: 8px;
          border-top: 2px solid #ff5e13;
        }

        .label {
          font-size: 14px;
          color: #787486;
          font-weight: 500;
        }

        .value {
          font-size: 16px;
          color: #0d062d;
          font-weight: 600;
        }

        .value.price {
          font-size: 24px;
          font-weight: 700;
          color: #ff5e13;
        }

        .qr-section {
          margin-bottom: 32px;
        }

        .qr-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 32px;
          background: linear-gradient(135deg, #ffffff, #fff5f0);
          border-radius: 20px;
          margin-bottom: 24px;
          border: 3px dashed rgba(255, 94, 19, 0.3);
          min-height: 350px;
        }

        .qr-code {
          width: 300px;
          height: 300px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(255, 94, 19, 0.2);
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .qr-loading {
          text-align: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #ffe8d9;
          border-top-color: #ff5e13;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .qr-loading p {
          color: #787486;
          font-size: 14px;
        }

        .qr-instructions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .instruction-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #fffbf7, #fff5f0);
          border-radius: 12px;
          border-left: 4px solid #ff5e13;
          transition: all 0.3s ease;
        }

        .instruction-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.1);
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        .instruction-item p {
          margin: 0;
          font-size: 14px;
          color: #0d062d;
          font-weight: 500;
        }

        .timer-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, #fff5f0, #ffe8d9);
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 94, 19, 0.2);
        }

        .timer-icon {
          display: flex;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .timer-text {
          font-size: 14px;
          color: #787486;
          font-weight: 500;
        }

        .timer-value {
          font-size: 20px;
          font-weight: 700;
          color: #ff5e13;
          font-family: var(--font-mono);
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .simulate-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
          position: relative;
          overflow: hidden;
        }

        .simulate-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s;
        }

        .simulate-btn:hover::before {
          left: 100%;
        }

        .simulate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 94, 19, 0.4);
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-radius: 8px;
          border: 1px solid #10b981;
        }

        .security-note span {
          font-size: 12px;
          color: #065f46;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .payment-card {
            padding: 24px;
          }

          .payment-header h1 {
            font-size: 24px;
          }

          .qr-container {
            padding: 24px;
            min-height: 300px;
          }

          .qr-code {
            width: 250px;
            height: 250px;
          }

          .instruction-item {
            padding: 12px;
          }

          .action-buttons {
            flex-direction: column;
          }
        }

        .payment-container.two-columns {
          display: flex;
          gap: 40px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .left-column {
          flex: 1.1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .right-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        @media (max-width: 900px) {
          .payment-container.two-columns {
            flex-direction: column;
            gap: 24px;
          }
          .left-column,
          .right-column {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
