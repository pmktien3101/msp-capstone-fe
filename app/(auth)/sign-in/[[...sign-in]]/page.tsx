"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { setAccessToken, isAuthenticated } from "@/lib/auth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
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
  {
    email: "member1@gmail.com",
    password: "123",
    userData: {
      userId: "4",
      email: "member1@gmail.com",
      role: "Member",
      image: "https://getstream.io/random_svg/?id=4&name=staff",
    },
  },
  {
    email: "member2@gmail.com",
    password: "123",
    userData: {
      userId: "5",
      email: "member2@gmail.com",
      role: "Member",
      image: "https://getstream.io/random_svg/?id=4&name=staff",
    },
  },
  {
    email: "member3@gmail.com",
    password: "123",
    userData: {
      userId: "6",
      email: "member3@gmail.com",
      role: "Member",
      image: "https://getstream.io/random_svg/?id=4&name=staff",
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
                  <Mail className="input-icon" size={20} color="#FFA463" strokeWidth={2} />
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
                  <Lock className="input-icon" size={20} color="#FFA463" strokeWidth={2} />
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
                      <EyeOff size={20} color="#FFA463" strokeWidth={2} />
                    ) : (
                      <Eye size={20} color="#FFA463" strokeWidth={2} />
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

              <div className="register-section">
                <p className="register-description">
                  Chưa có tài khoản? <Link href="/sign-up" className="register-link">Đăng ký tài khoản doanh nghiệp</Link> để bắt đầu quản lý dự án và nhân sự của bạn.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
