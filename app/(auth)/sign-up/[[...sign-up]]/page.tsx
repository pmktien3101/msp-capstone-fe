"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import "@/app/styles/sign-up.scss";
import { User, Eye, EyeOff } from "lucide-react";

interface RegisterFormData {
  fullName: string;
  organizationName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    fullName: "",
    organizationName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
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
        `}</style>
      </div>
    );
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement registration logic
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated API call
      console.log("Form submitted:", registerForm);
    } catch (error) {
      console.error("Registration error:", error);
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
  };




  const isFormValid = () => {
    return (
      registerForm.fullName &&
      registerForm.organizationName &&
      registerForm.phone &&
      registerForm.email &&
      registerForm.password &&
      registerForm.confirmPassword &&
      registerForm.password === registerForm.confirmPassword
    );
  };

  // Show redirect message if already authenticated
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
        `}</style>
      </div>
    );
  }

  // If already authenticated, show redirect message
  if (isAuthenticated()) {
    // return <RedirectMessage message="Bạn đã đăng nhập rồi, đang chuyển hướng đến dashboard..." />;
    return null; // Prevent rendering anything while redirecting
  }

  return (
    <div className="register-container">
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

        <div className="form-and-info-wrapper">
          <form className="register-form" onSubmit={handleSubmit}>
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

              <div className="form-group">
                <label htmlFor="organizationName">Tên Tổ Chức/Doanh Nghiệp *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    placeholder="Nhập tên tổ chức/doanh nghiệp"
                    value={registerForm.organizationName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số Điện Thoại *</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    value={registerForm.phone}
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
                {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                  <small className="form-error">
                    Mật khẩu xác nhận không khớp
                  </small>
                )}
              </div>
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
                Đã có tài khoản? <a href="/sign-in">Đăng nhập</a>
              </p>
            </div>
          </form>

          <div className="process-section">
            <h3 className="section-title">Quy Trình Đăng Ký</h3>
            <div className="process-steps">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Điền thông tin</h4>
                  <p>Điền đầy đủ thông tin người dùng và tên tổ chức/doanh nghiệp</p>
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
                  <h4>Kích hoạt tài khoản</h4>
                  <p>Xác nhận email thành công sẽ có thể dùng tài khoản đã đăng ký để sử dụng nền tảng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
