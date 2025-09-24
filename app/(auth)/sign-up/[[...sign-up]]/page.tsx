"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import "@/app/styles/sign-up.scss";
import { User, Eye, EyeOff } from "lucide-react";

interface RegisterFormData {
  businessName: string;
  businessType: string;
  industry: string;
  businessAddress: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  agreeTerms: boolean;
  selectedPlan: string;
  yearlyBilling: boolean;
}

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    businessName: "",
    businessType: "",
    industry: "",
    businessAddress: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
    selectedPlan: "",
    yearlyBilling: false,
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

  const availablePlans = [
    {
      id: "basic",
      name: "Cơ Bản",
      price: 499000,
      description: "Phù hợp cho doanh nghiệp nhỏ mới bắt đầu",
      features: [
        "Tối đa 5 người dùng",
        "Quản lý dự án cơ bản",
        "Báo cáo hàng tháng",
        "Email support",
      ],
    },
    {
      id: "pro",
      name: "Chuyên Nghiệp",
      price: 999000,
      description: "Dành cho doanh nghiệp đang phát triển",
      features: [
        "Không giới hạn người dùng",
        "Quản lý dự án nâng cao",
        "Báo cáo chi tiết",
        "Hỗ trợ 24/7",
      ],
    },
  ];

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


  const selectPlan = (planId: string) => {
    setRegisterForm((prev) => ({
      ...prev,
      selectedPlan: planId,
    }));
  };


  const isFormValid = () => {
    return (
      registerForm.businessName &&
      registerForm.businessType &&
      registerForm.industry &&
      registerForm.businessAddress &&
      registerForm.firstName &&
      registerForm.lastName &&
      registerForm.email &&
      registerForm.password &&
      registerForm.confirmPassword &&
      registerForm.password === registerForm.confirmPassword &&
      registerForm.phone &&
      registerForm.agreeTerms &&
      registerForm.selectedPlan
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
        <div className="register-form-section">
          <div className="form-header">
            <div className="logo-container">
              <div className="logo-icon">
                <User size={40} strokeWidth={2} color="#FF5E13" />
              </div>
              <h1>Đăng Ký Tài Khoản Business Owner</h1>
              <p>Vui lòng điền thông tin doanh nghiệp và chờ admin duyệt</p>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Thông Tin Doanh Nghiệp</h3>

              <div className="form-group">
                <label htmlFor="businessName">Tên Doanh Nghiệp *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    placeholder="Nhập tên doanh nghiệp"
                    value={registerForm.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="businessType">Loại Hình Doanh Nghiệp *</label>
                  <div className="input-wrapper">
                    <select
                      id="businessType"
                      name="businessType"
                      value={registerForm.businessType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn loại hình doanh nghiệp</option>
                      <option value="startup">Startup</option>
                      <option value="small-business">Doanh Nghiệp Nhỏ</option>
                      <option value="medium-business">Doanh Nghiệp Vừa</option>
                      <option value="enterprise">Doanh Nghiệp Lớn</option>
                      <option value="agency">Công Ty Agency</option>
                      <option value="consulting">Công Ty Tư Vấn</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="industry">Ngành Nghề *</label>
                  <div className="input-wrapper">
                    <select
                      id="industry"
                      name="industry"
                      value={registerForm.industry}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn ngành nghề</option>
                      <option value="technology">Công Nghệ</option>
                      <option value="healthcare">
                        Y Tế & Chăm Sóc Sức Khỏe
                      </option>
                      <option value="finance">Tài Chính & Ngân Hàng</option>
                      <option value="education">Giáo Dục & Đào Tạo</option>
                      <option value="retail">Bán Lẻ & Thương Mại</option>
                      <option value="manufacturing">Sản Xuất & Chế Tạo</option>
                      <option value="consulting">Tư Vấn & Dịch Vụ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="businessAddress">Địa Chỉ Doanh Nghiệp *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="businessAddress"
                    name="businessAddress"
                    placeholder="Nhập địa chỉ đầy đủ"
                    value={registerForm.businessAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

            </div>

            <div className="form-section">
              <h3 className="section-title">Thông Tin Tài Khoản</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Họ *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Nhập họ"
                      value={registerForm.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Tên *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Nhập tên"
                      value={registerForm.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Doanh Nghiệp *</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Nhập email doanh nghiệp"
                    value={registerForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <small className="form-help">
                  Email này sẽ được sử dụng để đăng nhập vào hệ thống
                </small>
              </div>

              <div className="form-row">
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
                        <EyeOff size={20} color="#FFA463" strokeWidth={2} />
                      ) : (
                        <Eye size={20} color="#FFA463" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                  <small className="form-help">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </small>
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
                        <EyeOff size={20} color="#FFA463" strokeWidth={2} />
                      ) : (
                        <Eye size={20} color="#FFA463" strokeWidth={2} />
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
            </div>

            {/* <div className="form-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={registerForm.agreeTerms}
                  onChange={handleInputChange}
                  required
                />
                <span className="checkmark"></span>
                Tôi đồng ý với{" "}
                <a href="#" className="terms-link">
                  Điều Khoản Sử Dụng
                </a>{" "}
                và{" "}
                <a href="#" className="terms-link">
                  Chính Sách Bảo Mật
                </a>
              </label>
            </div> */}

            <button
              type="submit"
              className="register-btn"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <span>Gửi Đơn & Thanh Toán</span>
              )}
            </button>

            <div className="signin-link">
              <p>
                Đã có tài khoản? <a href="/auth/sign-in">Đăng nhập</a>
              </p>
            </div>
          </form>
        </div>

        <div className="register-info-section">
          <div className="info-content">

            <div className="plan-section">
              <h3 className="section-title">Chọn Gói Dịch Vụ</h3>
              <p className="section-description">
                Chọn gói phù hợp với nhu cầu doanh nghiệp của bạn
              </p>

              <div className="plan-options">
                {availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-option ${registerForm.selectedPlan === plan.id ? "selected" : ""
                      }`}
                    onClick={() => selectPlan(plan.id)}
                  >
                    <div className="plan-header">
                      <h4>{plan.name}</h4>
                      <div className="plan-price">
                        <span className="currency">VND</span>
                        <span className="amount">
                          {new Intl.NumberFormat("vi-VN").format(
                            registerForm.yearlyBilling
                              ? plan.price * 12 * 0.8 // 20% discount for yearly billing
                              : plan.price
                          )}
                        </span>
                        <span className="period">
                          /{registerForm.yearlyBilling ? "năm" : "tháng"}
                        </span>
                      </div>
                    </div>
                    <p className="plan-description">{plan.description}</p>
                    <div className="plan-features">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <svg
                            className="feature-check"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="billing-toggle">
                <span>Thanh toán theo tháng</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={registerForm.yearlyBilling}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        yearlyBilling: e.target.checked,
                      }))
                    }
                  />
                  <span className="slider"></span>
                </label>
                <span>
                  Thanh toán theo năm{" "}
                  <span className="save-badge">Tiết kiệm 20%</span>
                </span>
              </div>
            </div>

            <div className="process-section">
              <h3 className="section-title">Quy Trình Đăng Ký</h3>
              <div className="process-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Điền thông tin</h4>
                    <p>
                      Điền đầy đủ thông tin doanh nghiệp và chọn gói dịch vụ phù hợp
                    </p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Gửi đơn & Thanh toán</h4>
                    <p>Tiến hành gửi đơn đăng ký và thực hiện thanh toán</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Kích hoạt tài khoản</h4>
                    <p>Thanh toán thành công, Email Doanh Nghiệp và Mật Khẩu sẽ được dùng làm tài khoản Chủ Doanh Nghiệp để quản lý nhân sự và doanh nghiệp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
