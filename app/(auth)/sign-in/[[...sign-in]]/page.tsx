"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { setAccessToken, isAuthenticated } from "@/lib/auth";
import "../../../styles/auth.scss";

// Mock user data for testing
const MOCK_USERS = [
  {
    email: "pm@gmail.com",
    password: "123",
    userData: {
      userId: "1",
      email: "pm@gmail.com",
      role: "pm",
      image: "https://getstream.io/random_svg/?id=1&name=pm",
    },
  },
  {
    email: "admin@gmail.com",
    password: "123",
    userData: {
      userId: "2",
      email: "admin@gmail.com",
      role: "AdminSystem",
      image: "https://getstream.io/random_svg/?id=2&name=admin",
    },
  },
  {
    email: "business@gmail.com",
    password: "123",
    userData: {
      userId: "3",
      email: "business@gmail.com",
      role: "BusinessOwner",
      image: "https://getstream.io/random_svg/?id=3&name=business",
    },
  },
];

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Always call hooks at the top level
  const { setUserData } = useUser();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
    setIsLoading(true);

    try {
      // Mock authentication check
      const foundUser = MOCK_USERS.find(
        (user) =>
          user.email === formData.email && user.password === formData.password
      );

      if (foundUser) {
        // Store token using utility function
        setAccessToken("mock-token-123", formData.rememberMe);

        // Set user data
        setUserData(foundUser.userData);

        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        alert(
          "Invalid email or password. Try:\n- pm@gmail.com / pm123\n- admin@gmail.com / admin123\n- business@gmail.com / business123"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Left Side - Visual */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="logo-container">
              <div className="logo-icon">
                <Image src="/logo.png" alt="MSP Logo" width={60} height={60} />
              </div>
              <h1 className="visual-title">Chào Mừng Trở Lại</h1>
              <p className="visual-subtitle">
                Đăng nhập để tiếp tục quản lý cuộc họp kinh doanh của bạn
              </p>
            </div>

            <div className="visual-illustration">
              <div className="floating-elements">
                <div className="floating-card">
                  <div className="card-icon">📅</div>
                  <div className="card-text">Lập Lịch Thông Minh</div>
                </div>
                <div className="floating-card">
                  <div className="card-icon">🤝</div>
                  <div className="card-text">Hợp Tác Nhóm</div>
                </div>
                <div className="floating-card">
                  <div className="card-icon">📊</div>
                  <div className="card-text">Phân Tích Dữ Liệu</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-card">
            <div className="form-header">
              <h2>Đăng Nhập</h2>
              <p>Vui lòng đăng nhập để tiếp tục</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="#FFA463"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 6L12 13L2 6"
                      stroke="#FFA463"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật Khẩu</label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                      stroke="#FFA463"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                      stroke="#FFA463"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu của bạn"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1747 15.0074 10.801 14.8565C10.4273 14.7056 10.0867 14.4811 9.80385 14.1962C9.52097 13.9113 9.29639 13.5707 9.14551 13.197C8.99463 12.8233 8.92051 12.4227 8.92759 12.0199C8.93468 11.6171 9.02291 11.2198 9.18691 10.8518C9.35091 10.4838 9.58737 10.1526 9.8822 9.8779"
                          stroke="#FFA463"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <line
                          x1="1"
                          y1="1"
                          x2="23"
                          y2="23"
                          stroke="#FFA463"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="#FFA463"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                          stroke="#FFA463"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Ghi nhớ đăng nhập
                </label>
                <Link href="/forgot-password" className="forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? <div className="loading-spinner" /> : "Đăng Nhập"}
              </button>

              <div className="divider">
                <span>hoặc</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn google-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Tiếp tục với Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
