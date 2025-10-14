"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { authService } from "@/services/authService";
import "@/app/styles/sign-up.scss";
import { User, Eye, EyeOff, Users, Building2, CheckCircle, XCircle } from "lucide-react";

interface RegisterFormData {
  fullName: string;
  organization: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessLicense: string; // Tên file giấy phép kinh doanh
}

type Role = "Member" | "BusinessOwner";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<Role>("Member");
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    fullName: "",
    organization: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessLicense: "",
  });

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        console.log("User already authenticated, redirecting to dashboard");
        router.push("/dashboard");
        return;
      }
      setIsCheckingAuth(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="auth-checking">
        <div className="loading-spinner"></div>
        <p>Đang kiểm tra trạng thái đăng nhập...</p>
        <style jsx>{`
          .auth-checking {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(
              135deg,
              #f9f4ee 0%,
              #fdf0d2 50%,
              #ffdbbd 100%
            );
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #ff5e13;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          p {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
          }


          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null); // Clear previous messages

    // Validate form before submitting
    if (!isFormValid()) {
      setMessage({ 
        type: 'error', 
        text: role === "BusinessOwner" 
          ? "Vui lòng điền đầy đủ thông tin và chọn tệp giấy phép kinh doanh" 
          : "Vui lòng điền đầy đủ thông tin" 
      });
      setIsLoading(false);
      return;
    }

    try {
      // Prepare registration data based on role
      const registrationData = {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        phoneNumber: registerForm.phoneNumber,
        role: role,
        ...(role === "BusinessOwner" && {
          organization: registerForm.organization,
          businessLicense: registerForm.businessLicense, // Gửi tên file dưới dạng string
        }),
      };

      console.log("Submitting registration:", registrationData);

      const result = await authService.register(registrationData);

      if (result.success) {
        console.log("Registration successful:", result.message);
        // Show success message
        setMessage({ type: 'success', text: result.message || "Đăng ký thành công!" });
        // Redirect to sign-in page after 2 seconds
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        // Show error message
        setMessage({ type: 'error', text: result.error || "Đăng ký thất bại. Vui lòng thử lại." });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage({ type: 'error', text: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setRegisterForm((prev) => ({
      ...prev,
      businessLicense: file ? file.name : "",
    }));
  };

  const isFormValid = () => {
    const baseValid =
      registerForm.fullName &&
      registerForm.phoneNumber &&
      registerForm.email &&
      registerForm.password &&
      registerForm.confirmPassword &&
      registerForm.password === registerForm.confirmPassword;

    // Business accounts cần organizationName và businessLicense
    if (role === "BusinessOwner") {
      return baseValid && registerForm.organization && registerForm.businessLicense;
    }

    return baseValid;
  };

  // If already authenticated, show redirect message
  if (isAuthenticated()) {
    return null; // Prevent rendering anything while redirecting
  }

  return (
    <div className="register-container">
      <style jsx>{`
        .register-message {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          animation: slideDown 0.4s ease-out;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 2px solid;
          position: relative;
          overflow: hidden;
        }

        .register-message::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          animation: shimmer 2s infinite;
        }

        .register-message-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .register-message.success {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #064e3b;
          border-color: #10b981;
        }

        .register-message.error {
          background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
          color: #7f1d1d;
          border-color: #ef4444;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="register-content">
        <div className="form-header">
          <div className="logo-container">
            <div className="logo-icon">
              <User size={32} strokeWidth={2} color="white" />
            </div>
            <h1>Đăng Ký Tài Khoản</h1>
            <p>Tạo tài khoản để sử dụng nền tảng</p>
          </div>
        </div>

        <div className="account-type-tabs">
          <button
            type="button"
            className={`tab-button ${role === "Member" ? "active" : ""}`}
            onClick={() => setRole("Member")}
          >
            <Users size={20} />
            <span>Tài Khoản Cá Nhân</span>
          </button>
          <button
            type="button"
            className={`tab-button ${
              role === "BusinessOwner" ? "active" : ""
            }`}
            onClick={() => setRole("BusinessOwner")}
          >
            <Building2 size={20} />
            <span>Tài Khoản Doanh Nghiệp</span>
          </button>
        </div>

        <div className="form-and-info-wrapper">
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Message Display */}
            {message && (
              <div className={`register-message ${message.type === 'success' ? 'success' : 'error'}`}>
                <div className="register-message-content">
                  {message.type === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Họ và Tên *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Nhập họ và tên đầy đủ"
                    value={registerForm.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {role === "BusinessOwner" && (
                <div className="form-group">
                  <label htmlFor="organizationName">
                    Tên Tổ Chức/Doanh Nghiệp *
                  </label>
                  <div className="input-wrapper">
                  <input
                    type="text"
                    id="organizationName"
                    name="organization"
                    placeholder="Nhập tên tổ chức/doanh nghiệp"
                    value={registerForm.organization}
                    onChange={handleInputChange}
                    required
                  />
                  </div>
                </div>
              )}

              {/* Đã bỏ trường ngành kinh doanh */}

              <div className="form-group">
                <label htmlFor="phone">Số Điện Thoại *</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    name="phoneNumber"
                    placeholder="Nhập số điện thoại"
                    value={registerForm.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Nhập email"
                    value={registerForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật Khẩu *</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={registerForm.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#FFA463" strokeWidth={2} />
                    ) : (
                      <Eye size={18} color="#FFA463" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu *</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={registerForm.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="#FFA463" strokeWidth={2} />
                    ) : (
                      <Eye size={18} color="#FFA463" strokeWidth={2} />
                    )}
                  </button>
                </div>
                {registerForm.confirmPassword &&
                  registerForm.password !== registerForm.confirmPassword && (
                    <small className="form-error">
                      Mật khẩu xác nhận không khớp
                    </small>
                  )}
              </div>

               {role === "BusinessOwner" && (
                 <div className="form-group">
                   <label htmlFor="businessLicense">Giấy Phép Kinh Doanh*</label>
                   <div
                     className="input-wrapper"
                     style={{ position: "relative" }}
                   >
                     <input
                       type="file"
                       id="businessLicense"
                       name="businessLicense"
                       accept="image/*,.pdf"
                       onChange={handleFileChange}
                       required
                       style={{
                         display: "none",
                       }}
                     />
                     <button
                       type="button"
                       onClick={() =>
                         document.getElementById("businessLicense")?.click()
                       }
                       className="custom-file-btn"
                       style={{
                         width: "100%",
                         padding: "12px",
                         border: "1px solid #e5e7eb",
                         borderRadius: "8px",
                         background: "#fff",
                         color: "#1a1a1a",
                         cursor: "pointer",
                       }}
                     >
                       {registerForm.businessLicense
                         ? `Đã chọn: ${registerForm.businessLicense}`
                         : "Chọn tệp giấy phép kinh doanh..."}
                     </button>
                   </div>
                   {!registerForm.businessLicense && role === "BusinessOwner" && (
                     <small style={{ color: "#ef4444", fontWeight: "500" }}>
                       Vui lòng chọn tệp giấy phép kinh doanh
                     </small>
                   )}
                 </div>
               )}
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <span>Đăng Ký Tài Khoản</span>
              )}
            </button>

            <div className="signin-link">
              <p>
                Đã có tài khoản? <Link href="/sign-in">Đăng nhập</Link>
              </p>
            </div>
          </form>

          <div className="process-section">
            <h3 className="section-title">Quy Trình Đăng Ký</h3>
            {role === "Member" ? (
              <div className="process-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Điền thông tin</h4>
                    <p>Điền đầy đủ thông tin cá nhân của bạn</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Xác nhận email</h4>
                    <p>Kiểm tra email và xác nhận tài khoản</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Bắt đầu sử dụng</h4>
                    <p>Đăng nhập và sử dụng ngay các tính năng của nền tảng</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="process-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Điền thông tin</h4>
                    <p>
                      Điền đầy đủ thông tin người dùng và tên tổ chức/doanh
                      nghiệp
                    </p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Gửi thông tin & Xác nhận email</h4>
                    <p>Gửi thông tin đăng ký và xác nhận email</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Chờ phê duyệt</h4>
                    <p>
                      Admin sẽ xem xét và phê duyệt tài khoản doanh nghiệp của
                      bạn
                    </p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Kích hoạt tài khoản</h4>
                    <p>
                      Sau khi được phê duyệt, bạn có thể đăng nhập và sử dụng
                      nền tảng
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
